/**
 * 组织管理api
 */
'use strict';
const _ = require('lodash');
const router = require('koa-router')({prefix: '/group'});
const User = require('../model/user');
const Group = require('../model/group');
const logger = require('../lib/logger');
const auth = require('../lib/auth');
const util = require('../lib/util');
const BusinessError = require('../error/BusinessError');
const ErrCode = BusinessError.ErrCode;

function* injectGroup(next) {
    let user = yield User.findById(this.state.userId).exec();
    let group = user.groupId && (yield Group.findById(user.groupId).exec());
    if (!group) {
        this.body = {code: 404};
    } else {
        let admin = _.find(group.members, {userId: user.id, admin: true});
        if (!admin) {
            this.body = {code: 411, msg: '不是管理员'};
        } else {
            this.state.group = group;
            yield next;
        }
    }
}
/**
 * 获取所有小组
 */
router.post('/get', auth.mustLogin(), function* () {});
/**
 * 添加小组
 */
router.post('/add', auth.mustLogin(), function* () {});
/**
 * 编辑小组
 */
router.post('/edit', auth.mustLogin(), function* () {});
/**
 * 删除小组
 */
router.post('/delete', auth.mustLogin(), function* () {});
/**
 * 获取小组成员
 */
router.post('/getmember', auth.mustLogin(), function* () {});
/**
 * 添加小组成员
 */
router.post('/addmember', auth.mustLogin(), function* () {});
/**
 * 删除小组成员
 */
router.post('/deletemember', auth.mustLogin(), function* () {});
/**
 * 获取小组任务
 */
router.post('/gettask', auth.mustLogin(), function* () {});
/**
 * 获取小组日报
 */
router.post('/getreport', auth.mustLogin(), function* () {});


/**
 * 新建组织
 */
router.post('/create', auth.mustLogin(), function* () {
    let name = this.request.params.name;
    if (!name) {
        throw new BusinessError(ErrCode.ABSENCE_PARAM, '组织名不能为空');
    }
    let group = new Group({
        name: name,
        members: [{userId: this.state.userId, admin: true}]
    });
    yield group.save();
    let user = yield User.findById(this.state.userId).exec();
    user.groupId = group.id;
    yield user.save();
    this.body = {
        code: 200,
        group: group
    };
});
/**
 * 获取组织信息
 */
router.get('/get', auth.mustLogin(), injectGroup, function* () {
    let group = this.state.group;
    let ids = [];
    let admins = {};
    group.members.forEach(m => {
        ids.push(m.userId);
        m.admin && (admins[m.userId] = true);
    });
    let members = yield User.find({_id: {$in: ids}}).exec();
    this.body = {
        code: 200,
        info: group,
        members: members.map(m => {
            let obj = m.toObject();
            obj.admin = !!admins[m.id];
            return obj;
        })
    };
});
/**
 * 更新组织信息
 */
router.post('/update', auth.mustLogin(), injectGroup, function* () {
    let name = this.request.params.name;
    let ret = {};
    if (!name) {
        throw new BusinessError(ErrCode.ABSENCE_PARAM, '组织名不能为空');
    } else {
        let group = this.state.group;
        group.name = name;
        yield group.save();
        ret.code = 200;
    }
    this.body = ret;
});
/**
 * 添加组织成员
 */
router.post('/addMember', auth.mustLogin(), injectGroup, function* () {
    let mail = this.request.params.mail;
    if (!mail) throw new BusinessError(ErrCode.ABSENCE_PARAM);
    let group = this.state.group;
    let user = yield User.findOne({username: mail});
    if (!user) throw new BusinessError(416, '用户不存在');
    if (user.groupId) throw new BusinessError(417, '添加出错,该用户已选择组织');
    user.groupId = group.id;
    yield group.update({$push: {members: {userId: user.id, admin: false}}}).exec();
    yield user.save();
    this.body = {
        code: 200,
        user: user
    };
});
/**
 * 删除组织成员
 */
router.post('/delMember', auth.mustLogin(), injectGroup, function* () {
    let memberId = this.request.params.id;
    if (!memberId) throw new BusinessError(ErrCode.ABSENCE_PARAM);
    let group = this.state.group;
    let user = yield User.findById(memberId);
    yield group.update({$pull: {members: {userId: user.id}}}).exec();
    if (user) {
        user.groupId = null;
        yield user.save();
    }
    this.body = {
        code: 200
    }
});
/**
 * 更新组织成员角色
 */
router.post('/updateRole', auth.mustLogin(), injectGroup, function* () {
    let userId = this.request.params.userId;
    let admin = this.request.params.admin;
    if (!userId || admin == null) throw new BusinessError(ErrCode.ABSENCE_PARAM);
    let group = this.state.group;
    let member = _.find(group.members, {userId: userId});
    if (!member) throw new BusinessError(418, '用户不存在');
    member.admin = admin;
    yield group.save();
    this.body = {
        code: 200
    }
});

module.exports = router;