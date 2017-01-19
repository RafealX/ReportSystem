/**
 * 用户api
 */
'use strict';
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

/**
 * 用户注册
 */
router.post('/register', function* () {
    let params = this.request.params;
    if (params.username && params.nickname && params.password) {
        if (!util.isMail(params.username)) {
            throw new BusinessError(ErrCode.INVALID_PARAM, '邮箱格式不正确');
        }
        try {
            let user = yield thunkify(User.register).call(User,
                Object.assign({workMail: params.username}, params),
                params.password);
            auth.login(this, user);
            this.body = {
                code: 200,
                user: user
            };
            logger.info('新注册用户', user);
        } catch (e) {
            if (e instanceof passportLocalMongoose.errors.UserExistsError) {
                throw new BusinessError(420, '该用户已注册');
            } else {
                logger.error('注册失败', e);
                throw e;
            }
        }
    } else {
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
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