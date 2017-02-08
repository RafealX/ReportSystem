/**
 * 用户api
 */
'use strict';
const rq = require('request-promise');
const jose = require('node-jose');
const jwt = require('jsonwebtoken');
const router = require('koa-router')({prefix: '/user'});
const User = require('../model/user');
const Group = require('../model/group');
const thunkify = require('thunkify');
const logger = require('../lib/logger');
const passportLocalMongoose = require('passport-local-mongoose');
const auth = require('../lib/auth');
const util = require('../lib/util');
const BusinessError = require('../error/BusinessError');
const _ = require('lodash');
const ErrCode = BusinessError.ErrCode;
const OpenId = require('../lib/openid');
const koarequest = require('koa-request');


OpenId.set.options({
    "client_id":'92d874daec3e11e6911c5cf3fc96a72c',
    "client_secret":"6d05d72d2ba746959fb845c775f585b592d87b24ec3e11e6911c5cf3fc96a72c",
    "cb_router":'/api/user/login/openid/cb',
    'fail_url':'/index'
});

/**
 * 用户登录
 */
router.post('/login', function* () {
    let params = this.request.params;
    let user = yield thunkify(auth.authenticate)(params.username, params.password);
    if (!user) {
        throw new BusinessError(414, '该帐号未注册');
    }
    if (user && user.id) {
        user = user.toObject();
        if (user.groupId) {
            let group = yield Group.findById(user.groupId);
            user.groupAdmin = _.findIndex(group.members, {userId: user.id, admin: true}) > -1;
        }
        auth.login(this, user);
        this.body = {
            code: 200,
            user: user
        };
    } else {
        throw new BusinessError(407, '用户名或密码错误');
    }
});

router.post('/login/openid', function* (next) {
    logger.info(this.request.body.last);
    //let last_url = this.request.body.last ? this.request.body.last : "/m/report/my/list";

    //openIdInstance.set.lasturl(last_url);

    OpenId.connect(this);

    /*let resulturl = this.request.header.origin;
    let state = util.uuid();

    this.session.state = state;
    this.session.backUrl = last_url;
    resulturl+='/api/user/login/openid/cb';
    let redirectUrl = OpenId.generateAuthURL(resulturl,state);
    this.redirect(redirectUrl);*/

});
router.all('/login/openid/cb', function* (next) {
    let self = this;
    let callBackGenerator = OpenId.callback(this);
    let authorization = yield callBackGenerator.next();
    let verifyresponse = yield callBackGenerator.next(authorization.value);
    callBackGenerator.next(verifyresponse.value);


    /*let code = this.request.params.code;
    let state = this.request.params.state;
    let err_descript = this.request.params['error_description'];
    let session_state = this.session.state;
    if(!session_state || state!=session_state){
        //两次state状态不一致，说明源不一致，可能是假请求，需要重新登录
        this.redirect(failed_url);
    }
    let result = '';
    if(code!=null){
        let options = {
            method:'POST',
            formData:{
                "grant_type":"authorization_code",
                code:code,
                'redirect_uri':redirect_url,
                'client_id':client_id,
                'client_secret':client_secret
            }
        };
        let response = yield koarequest(token_endpoint,options);
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
                this.redirect();
            }
            if(payload.iss!=oidc_server){
                //iss 必须与网易的 OIDC Server 地址一致
                this.redirect(failed_url);
            }
            if(payload.aud!=client_id){
                // aud 必须包含client_id，网易这里只会有一个 aud，检查是否一致即可
                this.redirect(failed_url);
            }
            if(Math.floor(new Date().getTime()/1000)>payload.exp){
                //超时
                this.redirect(failed_url);
            }
            //进行签名校验
            if(alg=="HS256"){
                var verifyResult = jwt.verify(id_token,client_secret);
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
                    let verifyRequest = yield koarequest(userinfo_endpoint,options);
                    if(verifyRequest.statusCode==200){
                        //self.body = JSON.stringify(verifyRequest.body);
                        self.cookies.set('report_uinfo',JSON.stringify(verifyRequest.body));
                        this.redirect();
                    }else{

                    }
                }
            }else{
                //此处是使用RSA256加密的tokenid 看了Java代码，不知道怎么写，而且目前返回的结果都是HS256加密的
            }
            logger.info(output);
        }else
            this.redirect(failed_url);
    }else if(err_descript!=""){
        //登录失败，要传回消息给客户端
        this.redirect(failed_url);
    }else{
        //登录失败，要传回消息给客户端
        this.redirect(failed_url);
    }

    logger.info(state,session_state);*/
});
/**
 * 退出登录
 */
router.get('/logout', function* () {
    this.cookies.set('s_key', '', {expires: new Date(0)});
    this.body = {code: 200};
});
/**
 * 找回密码
 */
router.post('/find', function*() {
    let mail = this.request.params.mail;
    if (!util.isMail(mail)) {
        throw new BusinessError(412, '邮箱格式不正确');
    }
    let user = yield User.findByUsername(mail);
    if (!user) {
        throw new BusinessError(413, '该邮箱未注册');
    }
    let key = util.encrypt(JSON.stringify({userId: user.id, expires: Date.now() + 3600000}));
    let link = `http://rp.ddplan.cn/account/reset/${key}`;
    let html = `
                    <p>亲爱的${user.nickname}：</p>
		            <p>您申请了密码重置。请访问此链接，输入您的新密码：</p>
		            <a href="${link}">${link}</a>
		            <p>简报</p>`;
    yield util.sendMail({to: mail, html: html, subject: '简报 密码重置链接'});
    this.body = {code: 200};
});
/**
 * 重置密码
 */
router.post('/reset', function*() {
    let key = this.request.params.key;
    let pass = this.request.params.password;
    if (!pass || !key) {
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    let info = JSON.parse(util.decrypt(key));
    if (info.expires > Date.now()) {
        let user = yield User.findById(info.userId).exec();
        yield thunkify(user.setPassword).call(user, pass);
        yield user.save();
        this.body = {code: 200};
    } else {
        throw new BusinessError(411, '链接已过期');
    }
});
/**
 * 获取登录用户
 */
router.get('/get', auth.mustLogin(), function*() {
    let user = yield User.findById(this.state.userId).exec();
    this.body = {
        code: 200,
        user: user
    };
});
/**
 * 搜索用户
 */
router.get('/search', auth.mustLogin(), function* () {
    let name = this.request.query.name;
    let user = yield User.findById(this.state.userId).exec();
    let list = yield User.find({nickname: {$regex: name}, groupId: user.groupId}).exec();
    this.body = {
        code: 200,
        list: list
    };
});
/**
 * 更新个人信息
 */
router.post('/upinfo', auth.mustLogin(), function*() {
    let params = this.request.params;
    let loginUser = this.state.loginUser;
    if (params.nickname) {
        loginUser.nickname = params.nickname;
    }
    if (params.workMail) {
        loginUser.workMail = params.workMail;
    }
    if (params.avatar) {
        loginUser.avatar = params.avatar;
    }
    yield loginUser.save();
    this.body = {
        code: 200
    };
});

/**
 * 更新个人信息
 */
router.post('/uppass', auth.mustLogin(), function*() {
    let params = this.request.params;
    if (!params.oldPass || !params.newPass) {
        throw new BusinessError(ErrCode.INVALID_PARAM);
    }
    let user = yield thunkify(auth.authenticate)(this.state.loginUser.username, params.oldPass);
    if (!user) {
        throw new BusinessError(414, '该帐号未注册');
    }
    if (!user.id) {
        throw new BusinessError(409, '原密码不正确');
    }
    yield thunkify(user.setPassword).call(user, params.newPass);
    yield user.save();
    this.body = {
        code: 200
    };
});

module.exports = router;