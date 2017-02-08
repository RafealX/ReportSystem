/**
 * Created by hzxiangfangnian on 2017/2/6.
 */
const koarequest = require('koa-request');
const jose = require('node-jose');
const jwt = require('jsonwebtoken');
const logger = require('./logger');
const util = require('./util.js');
/*
*OpenId 第一步需要使用的配置
*/
let Options = {};
Options.openid_server = 'https://login.netease.com/connect/authorize';
Options.client_id = '92d874daec3e11e6911c5cf3fc96a72c';
Options.client_secret = "6d05d72d2ba746959fb845c775f585b592d87b24ec3e11e6911c5cf3fc96a72c";
Options.token_endpoint = "https://login.netease.com/connect/token";
Options.oidc_server = "https://login.netease.com/connect";
Options.userinfo_endpoint = "https://login.netease.com/connect/userinfo";
Options.cb_router="/";
Options.fail_url="/index";
/*
   帮助函数
*/
let Utils={
    buildUrl:function (host,data) {
        let result = host;
        result +='?';
        let params = '';
        for(let key in data){
            params += encodeURIComponent(key)+'='+encodeURIComponent(data[key]);
            params+='&';
        }
        params = params.substring(0,params.length-1);
        result+=params;
        return result;

    },
    generateAuthURL:function (redirectUrl,state) {
        let data = {
            'response_type':"code",
            "scope":"openid nickname fullname email dep",
            "client_id":Options.client_id,
            "redirect_uri":redirectUrl,
            "state":state
        };
        let resultUrl = Utils.buildUrl(Options.openid_server,data);
        return resultUrl;
    },
};

module.exports = {
    getNewInstance(ctx){
        return new OpenID({ctx:ctx});
    },
    connect:function (ctx) {
        var request = ctx.request,response = ctx.response;
        let lastUrl = request.body.last ? request.body.last : "/";
        let state = util.uuid();
        ctx.session.state = state;
        ctx.session.backUrl = lastUrl;
        let resulturl = request.header.origin;
        resulturl+=Options.cb_router;
        ctx.session.redirectUrl = resulturl
        let redirectUrl = Utils.generateAuthURL(resulturl,state);
        ctx.redirect(redirectUrl);
    },
    failback:function (ctx,message) {
        ctx.cookie.set('login_err',message);
        ctx.redirect(fail_url);
    },
    callback:function* (ctx) {
        let code = ctx.request.params.code;
        let state = ctx.request.params.state;
        let err_descript = ctx.request.params['error_description'];
        let session_state = ctx.session.state;
        let message = "";
        if(!session_state || state!=session_state){
            //两次state状态不一致，说明源不一致，可能是假请求，需要重新登录
            this.failback(ctx,"state不一致，请重新登录");
        }
        let result = '';
        if(code!=null){
            let resulturl = ctx.session.redirectUrl;
            let options = {
                method:'POST',
                formData:{
                    "grant_type":"authorization_code",
                    code:code,
                    'redirect_uri':resulturl,
                    'client_id':Options.client_id,
                    'client_secret':Options.client_secret
                }
            };
            let response = yield koarequest(Options.token_endpoint,options);
            if(response.statusCode){
                let body = JSON.parse(response.body);
                let access_token = body["access_token"];
                let id_token = body["id_token"];

                var output= jwt.decode(id_token,{complete: true});
                //获取结果解析数据
                let payload = output.payload;
                //获取算法数据
                let alg = output.header.alg;
                if(!payload){
                    this.failback(ctx,"获取token失败");
                }
                if(payload.iss!=Options.oidc_server){
                    //iss 必须与网易的 OIDC Server 地址一致
                    this.failback(ctx,"OIDC Server有误！请检查服务器OIDC Server配置");
                }
                if(payload.aud!=Options.client_id){
                    // aud 必须包含client_id，网易这里只会有一个 aud，检查是否一致即可
                    this.failback(ctx,"client_id不一致");
                }
                if(Math.floor(new Date().getTime()/1000)>payload.exp){
                    //超时
                    this.failback(ctx,"token已失效");
                }
                //进行签名校验
                if(alg=="HS256"){
                    var verifyResult = jwt.verify(id_token,Options.client_secret);
                    if(verifyResult){
                        //可以获取用户信息了
                        let options = {
                            method:'GET',
                            qs:{
                                'access_token':access_token
                            },
                            headers: {
                                'User-Agent': 'ReportSystemUA'
                            },
                            json: true
                        };
                        let verifyRequest = yield koarequest(Options.userinfo_endpoint,options);
                        if(verifyRequest.statusCode==200){
                            //self.body = JSON.stringify(verifyRequest.body);
                            let cookieValue = "report_uinfo="+new Buffer(JSON.stringify(verifyRequest.body)).toString('base64')+'; Expire='+(new Date().getTime()+36000*1000)
                                            +'; Path=/;';
                            ctx.response.set('Set-Cookie',cookieValue)
                            //ctx.response.cookies.set('report_uinfo',new Buffer(JSON.stringify(verifyRequest.body)).toString('base64'));
                            ctx.response.redirect(ctx.session.backUrl);
                        }else{

                        }
                    }
                }else{
                    //此处是使用RSA256加密的tokenid 看了Java代码，不知道怎么写，而且目前返回的结果都是HS256加密的
                }
                logger.info(output);
            }else
                this.failback(ctx,'OpenID服务器返回状态码:'+response.statusCode);
        }else if(err_descript!=""){
            //登录失败，要传回消息给客户端
            this.failback(ctx,'登录失败:'+err_descript);
        }else{
            //登录失败，要传回消息给客户端
            this.failback(ctx,'OpenID服务器返回code码:'+code);
        }
    },

    set:{
        options:function (obj) {
            for(let key in obj){
                if(Options.hasOwnProperty(key)&&obj[key]){
                    Options[key] = obj[key];
                }
            }
        }
    }
};;