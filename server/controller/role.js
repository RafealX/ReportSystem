'use strict';
const _ = require('lodash');
const router = require('koa-router')({prefix: '/role'});
const User = require('../model/user');
const Group = require('../model/group');
const logger = require('../lib/logger');
const auth = require('../lib/auth');
const util = require('../lib/util');
const BusinessError = require('../error/BusinessError');
const ErrCode = BusinessError.ErrCode;

/**
 * 设置权限
 */
//router.all('*',auth.mustLogin());
router.post('/set', auth.mustLogin(),function* () {
    let rData = this.request.params;
    let params = {};
    if(!rData){
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    if(this.state.loginUser && this.state.loginUser.role>1){
        let userid = rData.userid;
        let role = rData.role;
        params['$set'] = {
            role:role
        };
        yield User.update({id:userid},params);
        this.body = {
            code:200
        }
    }else{
        this.body = {
            code:403,
            msg:'未登录'
        };
        return;
    }

});
router.post('/mock/set', function* () {
    let rData = this.request.params;
    let params = {};
    if(!rData){
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    let userid = rData.userid;
    let role = rData.role;
    params['$set'] = {
        role:role
    };
    yield User.update({id:userid},params);
    this.body = {
        code:200
    }
});

/**
 * 获取所有小组
 */
router.get('/get', function* () {
    let groups = yield Group.find();
    let lists = [];
    groups.forEach(m => {
        lists.push(m.name);
    });
    this.body = {
        code: 200,
        list: lists
    }
});
module.exports = router;