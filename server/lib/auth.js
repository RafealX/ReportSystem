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
        let key = this.cookies.get('s_key');
        let security = key && JSON.parse(util.decrypt(key));
        if (security && security.expires > Date.now()) {
            this.state.userId = security.userId;
            this.state.loginUser = yield User.findById(security.userId);
        }
        yield next;
    }
};

module.exports.openId = function(){
    return function* (next){
        
    }
}