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


OpenId.set.options({
    "client_id":'92d874daec3e11e6911c5cf3fc96a72c',
    "client_secret":"6d05d72d2ba746959fb845c775f585b592d87b24ec3e11e6911c5cf3fc96a72c",
    "cb_router":'/api/user/login/openid/cb',
    'fail_url':'/login'
});

router.post('/login/openid', function* (next) {
    logger.info(this.request.body.last);
    OpenId.connect(this);

});
router.all('/login/openid/cb', function* (next) {
    let self = this;
    let callBackGenerator = OpenId.callback(this);
    let authorization = yield callBackGenerator.next();
    let verifyresponse = yield callBackGenerator.next(authorization.value);

    let result = callBackGenerator.next(verifyresponse.value);
    let UserInfo = result.value;
    let list = yield User.find({nickname:UserInfo.nickname});
    if(list.length==1){
        var user = list[0].toObject();
        OpenId.goBack(this,user)
        console.log(list);
    }else{
        let insertResult = new User({
            name: UserInfo.fullname,
            groupid: 1,
            nickname:UserInfo.nickname,
            email:UserInfo.email,
            id:util.uuid()
        });
        insertResult.save();
        console.log(insertResult.toObject());
        OpenId.goBack(this,insertResult.toObject());
    }

});
/**
 * 退出登录
 */
router.get('/logout', function* () {
    OpenId.logout(this);
    this.body = {code: 200};
});

router.post('/add',function* () {
    let rData = this.request.params;
    if(!rData){
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    let UserInfo = {
        fullname:rData.name,
        nickname:rData.nickname,
        email:rData.email,
        id:util.uuid()
    };
    let user = yield User.findOne({nickname:UserInfo.nickname});
    if(!user){
        let insertResult = new User({
            name: UserInfo.fullname,
            groupid: 1,
            nickname:UserInfo.nickname,
            email:UserInfo.email,
            id:UserInfo.id
        });
        let userInfo = yield insertResult.save();
        this.body = {
            code:200,
            msg:UserInfo.id
        }
    }else{
        this.body = {
            code:400,
            msg:user.toObject().id
        }
    }

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

router.get('/mock',function* () {
   let users = [
       {
           name: '项方念',
           nickname:'hzxiangfangnian',
           email:'hzxiangfangnian@crop.netease.com',
       },
       {
           name: '曹偲',
           nickname:'caocai',
           email:'caocai@crop.netease.com',
       },
       {
           name: '詹民拥',
           nickname:'hzzhanminyong',
           email:'hzzhanminyong@crop.netease.com',
       },{
           name: '郑海波',
           nickname:'hzzhenghaibo',
           email:'hzzhenghaibo@crop.netease.com',
       },{
           name: '徐超颖',
           nickname:'hzxuchaoying',
           email:'hzxuchaoying@crop.netease.com',
       },{
           name: '凌浩',
           nickname:'hzlinghao',
           email:'hzlinghao@crop.netease.com',
       }
   ];
   users.forEach(itm=>{
       let insertResult = new User({
           name: itm.name,
           nickname:itm.nickname,
           email:itm.email
       });
       let userInfo = insertResult.save();
   });
});

module.exports = router;