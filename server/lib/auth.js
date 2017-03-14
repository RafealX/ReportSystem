/**
 * 用户验证相关
 */
'use strict';
const User = require('../model/user');
const util = require('./util');

const maxAge = 7 * 24 * 3600 * 1000;

module.exports.authenticate = User.authenticate();

module.exports.login = function (ctx, user) {
    let keyData = {
        userId: user.id,
        expires: Date.now() + maxAge
    };
    ctx.cookies.set('s_key', util.encrypt(JSON.stringify(keyData)), {
        expires: new Date(keyData.expires),
        httpOnly: true
    });
};

module.exports.mustLogin = function () {
    return function* (next) {
        let report_info = this.cookies.get('report_uinfo');
        console.log(report_info);
        if(report_info){
            let result = new Buffer(report_info, 'base64').toString();//str是base64编码的字符串
            if(result){
                result = JSON.parse(result);
                if(result.id){
                    let user = yield User.findOne({id:result.id});
                    if(user){
                        this.state.loginUser = user.toObject();
                    }

                }
            }
        }

        if (this.state.loginUser) {
            yield next;
        } else {
            this.body = {
        code: 403,
        msg: '未登录'
    };
}
}
};

module.exports.resolveUser = function () {
    return function* (next) {
        /*let report_info = this.cookies.get('report_uinfo');
        //let security = key && JSON.parse(util.decrypt(key));
        if(report_info){
            let result = new Buffer(report_info, 'base64').toString();//str是base64编码的字符串
            if(result){
                result = JSON.parse(result);
                if(result.id){
                    let user = yield User.findOne({id:result.id}).count();
                    if(user>0){
                        this.state.loginUser = result;
                        this.state.userId = result.id;
                    }

                }
            }
        }
*/
        /*let report_info = this.cookies.get('report_uinfo');
        console.log(report_info);
        if(report_info){
            let result = new Buffer(report_info, 'base64').toString();//str是base64编码的字符串
            if(result){
                result = JSON.parse(result);
                if(result.id){
                    let user = yield User.findOne({id:result.id}).count();
                    if(user>0){
                        this.state.loginUser = result;
                    }

                }
            }
        }*/
        yield next;
    }
};