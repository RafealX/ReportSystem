/**
 * Created by hzxiangfangnian on 2017/2/6.
 */
const rq = require('request-promise');
const koarequest = require('koa-request');
const logger = require('./logger');
/*
*OpenId 第一步需要使用的配置
*/

let Utils={
    buildUrl:function (host,data) {
        let result = host;
        result +='?';
        let params = '';
        for(let key in data){
            params += encodeURI(key)+'='+encodeURI(data[key]);
            params+='&';
        }
        params = params.substring(0,params.length-1);
        result+=params;
        return result;
    }
};

const openid_server = 'https://login.netease.com/openid/';
const assoc_handle = 'assoc_handle';
const mac_key = 'mac_key';

let AssociationKeys = {
    assoc_handle:'',
    mac_key:'',
    expires_in:''
}

let OpenId = {
    association:function* () {
        let data = {
            "openid.mode":'associate',
            'openid.assoc_type':'HMAC-SHA256',
            'openid.session_type':'no-encryption'
        };
        let resultUrl = Utils.buildUrl(openid_server,data);
        let options = {
            url:resultUrl,
            headers: { 'User-Agent': 'request' },
            method:'GET'
        };
        let body = yield koarequest(options);
        logger.info(body);
        let result = body.split('\n');
        if(result.length>0){
            result.forEach((itm,idx)=>{
                console.log(itm);
                let temp = itm.split(':');
                if(temp.length==2 && AssociationKeys.hasOwnProperty(temp[0])){
                    AssociationKeys[temp[0]] = temp[1];
                }
            })

        }
        return AssociationKeys;
    },
    login:function (req,resp) {
        
    }
};
module.exports = OpenId;