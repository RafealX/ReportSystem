/**
 * Created by hzxiangfangnian on 2017/2/24.
 */
'use strict';
const _ = require('lodash');
const co = require('co');
const router = require('koa-router')({prefix: '/feedback'});
const User = require('../model/user');
const Group = require('../model/group');
const Task = require('../model/task');
const Taskhistory = require('../model/taskhistory');
const Report = require('../model/report');
const DelayHistory = require('../model/delayhistory');
const FAQ = require('../model/feedback');
const logger = require('../lib/logger');
const auth = require('../lib/auth');
const util = require('../lib/util');
const config = require('../config');
const BusinessError = require('../error/BusinessError');
const ErrCode = BusinessError.ErrCode;

router.post('/set',auth.mustLogin(),function* () {
    let rData = this.request.params;
    if(!rData){
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    let user = this.state.loginUser;
    let userid = user.id;
    let username = user.name;
    let content = rData.content;
    let faq = new FAQ({
        time:new Date().getTime(),
        content:content,
        userid:userid,
        username:username
    });
    yield faq.save();
    this.body = {
        code:200,
        msg:'成功'
    }
});
router.get('/get',auth.mustLogin(),function* () {
    let faqs = yield FAQ.find({}).sort({time:-1});
    this.body = {
        code:200,
        data:faqs
    }
});
module.exports = router;