/**
 * 小组api
 */
'use strict';
const _ = require('lodash');
const router = require('koa-router')({prefix: '/team'});
const User = require('../model/user');
const Group = require('../model/group');
const Team = require('../model/team');
const logger = require('../lib/logger');
const auth = require('../lib/auth');
const util = require('../lib/util');
const BusinessError = require('../error/BusinessError');
const ErrCode = BusinessError.ErrCode;


function* injectTeam(next) {
    let teamId = this.request.params.teamId;
    let team = teamId && (yield Team.findById(teamId).exec());
    if (!team) {
        throw new BusinessError(ErrCode.NOT_FIND);
    }
    let admin = _.find(team.members, {userId: this.state.userId, admin: true});
    if (!admin) {
        throw new BusinessError(411, '不是管理员');
    }
    this.state.team = team;
    yield next;
}
/**
 * 创建小组
 */
router.post('/create', auth.mustLogin(), function* () {
    let name = this.request.params.name;
    let canBeFollow = this.request.params.canBeFollow;
    if (!name) {
        throw new BusinessError(ErrCode.ABSENCE_PARAM, '组名不能为空');
    }
    let user = yield User.findById(this.state.userId).exec();
    let team = new Team({
        name: name,
        groupId: user.groupId,
        createTime: Date.now(),
        canBeFollow: canBeFollow,
        members: [{userId: this.state.userId, admin: true}]
    });
    yield team.save();
    this.body = {
        code: 200,
        group: team
    };
});
/**
 * 获取小组信息
 */
router.get('/get', auth.mustLogin(), injectTeam, function* () {
    let team = this.state.team;
    let ids = [];
    let admins = {};
    team.members.forEach(m => {
        ids.push(m.userId);
        m.admin && (admins[m.userId] = true);
    });
    let members = yield User.find({_id: {$in: ids}}).exec();
    let follows = yield User.find({_id: {$in: team.follows.map(m => m.userId)}});
    this.body = {
        code: 200,
        info: team,
        follows: follows,
        members: members.map(m => {
            let obj = m.toObject();
            obj.admin = !!admins[m.id];
            return obj;
        })
    };
});
/**
 * 更新小组信息
 */
router.post('/update', auth.mustLogin(), injectTeam, function* () {
    let team = this.state.team;
    let name = this.request.params.name;
    let mails = this.request.params.mails;
    let canBeFollow = this.request.params.canBeFollow;
    let ret = {};
    name != null && (team.name = name);
    mails != null && (team.mails = mails);
    canBeFollow != null && (team.canBeFollow = canBeFollow);
    yield team.save();
    ret.code = 200;
    this.body = ret;
});
/**
 * 删除小组信息
 */
router.get('/delete', auth.mustLogin(), injectTeam, function* () {
    yield this.state.team.remove();
    this.body = {code: 200};
});
/**
 * 添加小组成员
 */
router.post('/addMember', auth.mustLogin(), injectTeam, function* () {
    let ids = this.request.params.ids;
    if (!ids) throw new BusinessError(ErrCode.ABSENCE_PARAM);
    let team = this.state.team;
    let newMembers = ids.filter(id => !_.find(team.members, {userId: id})).map(id => {
        return {userId: id, admin: false};
    });
    if (newMembers.length) {
        Array.prototype.push.apply(team.members, newMembers);
        yield team.save();
    }
    this.body = {code: 200};
});
/**
 * 删除小组成员
 */
router.post('/delMember', auth.mustLogin(), injectTeam, function* () {
    let userId = this.request.params.userId;
    if (!userId) throw new BusinessError(ErrCode.ABSENCE_PARAM);
    let team = this.state.team;
    yield team.update({$pull: {members: {userId: userId}}}).exec();
    this.body = {code: 200};
});
/**
 * 更新成员角色
 */
router.post('/updateRole', auth.mustLogin(), injectTeam, function* () {
    let userId = this.request.params.userId;
    let admin = this.request.params.admin;
    if (!userId || admin == null) throw new BusinessError(ErrCode.ABSENCE_PARAM);
    let team = this.state.team;
    let member = _.find(team.members, {userId: userId});
    if (!member) throw new BusinessError(418, '用户不存在');
    member.admin = admin;
    yield team.save();
    this.body = {code: 200};
});
/**
 * 我所在的小组列表
 */
router.get('/myList', auth.mustLogin(), function* () {
    let userId = this.state.userId;
    let teams = yield Team.find({members: {$elemMatch: {userId: userId}}}).exec();
    this.body = {
        code: 200,
        teams: teams.map(team => {
            let obj = team.toObject();
            obj.memberSize = team.members.length;
            obj.followSize = team.follows.length;
            obj.admin = _.find(team.members, {userId: userId, admin: true});
            return obj;
        })
    };
});
/**
 * 我关注的小组列表
 */
router.get('/followList', auth.mustLogin(), function* () {
    let userId = this.state.userId;
    let teams = yield Team.find({follows: {$elemMatch: {userId: userId}}}).exec();
    this.body = {
        code: 200,
        teams: teams.map(team => {
            let obj = team.toObject();
            obj.memberSize = team.members.length;
            obj.followSize = team.follows.length;
            return obj;
        })
    };
});
/**
 * 该组织的全部小组
 */
router.get('/all', auth.mustLogin(), function*() {
    let user = yield User.findById(this.state.userId).exec();
    let teams = yield Team.find({groupId: user.groupId}).exec();
    this.body = {
        code: 200,
        teams: teams.map(team => {
            let obj = team.toObject();
            obj.memberSize = team.members.length;
            obj.followSize = team.follows.length;
            obj.admin = !!_.find(team.members, {userId: user.id, admin: true});
            obj.my = obj.admin || !!_.find(team.members, {userId: user.id});
            obj.followed = team.canBeFollow && !!_.find(team.follows, {userId: user.id});
            return obj;
        })
    };
});
/**
 * 关注小组
 */
router.get('/follow', auth.mustLogin(), function*() {
    let params = this.request.params;
    if (!params.teamId || params.follow == null) {
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    let team = yield Team.findById(params.teamId).exec();
    if (!team) throw new BusinessError(ErrCode.NOT_FIND, '小组不存在');
    if (!team.canBeFollow) throw new BusinessError(401, '该小组不允许关注');
    let cdt = {follows: {userId: this.state.userId}};
    yield team.update(this.request.query.follow == 'true' ? {$push: cdt} : {$pull: cdt}).exec();
    this.body = {code: 200};
});

module.exports = router;