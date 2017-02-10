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
    let user = yield User.findById(this.state.userid).exec();
    let group = user.groupid && (yield Group.findById(user.groupid).exec());
    if (!group) {
        this.body = {code: 404};
    } else {
        let admin = _.find(group.members, {userid: user.id, rule: 2});
        if (!admin) {
            this.body = {code: 411, msg: '不是管理员'};
        } else {
            this.state.group = group;
            yield next;
        }
    }
}
router.all('*',auth.mustLogin());
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
/**
 * 添加小组
 */
router.post('/add', injectGroup,function* () {
    let name = this.request.params.name;
    let user = User.findById(this.state.userid).exec();
    if (!name) {
        throw new BusinessError(ErrCode.ABSENCE_PARAM, '组织名不能为空');
    }
    let group = new Group({
        name: name,
        owner: this.state.userid,
        members: [{id: this.state.userid, name:user.name,role: 2}]
    });
    yield group.save();
    user.groupid = group.id;
    yield user.save();
    this.body = {
        code: 200,
        group: group
    }
});
/**
 * 编辑小组
 */
router.post('/edit', injectGroup,function* () {
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
 * 删除小组
 */
router.post('/delete',  injectGroup,function* () {
    let group = Group.findById(this.request.params.id);
    if (group.owner != this.state.userid) {
            throw new BusinessError(433, '没有权限');
    }
    yield group.remove();
    this.body = {
        code: 200
    }
});
/**
 * 获取小组成员
 */
router.post('/getmember', injectGroup,function* () {
    let group = Group.findById(this.request.params.id);
    let members = group.members;
    let lists = [];
    group.members.forEach(m => {
        lists.push(User.findById(m.id));
    });
    this.body ={
        code: 200,
        list:lists
    }
});
/**
 * 添加小组成员
 */
router.post('/addmember', injectGroup,function* () {
    let mail = this.request.params.mail;
    if (!mail) throw new BusinessError(ErrCode.ABSENCE_PARAM);
    let group = this.state.group;
    let user = yield User.findOne({username: mail});
    if (!user) throw new BusinessError(416, '用户不存在');
    if (user.groupId) throw new BusinessError(417, '添加出错,该用户已选择组织');
    user.groupid = group.id;
    yield group.update({$push: {members: {userid: user.id, role: 1}}}).exec();
    yield user.save();
    this.body = {
        code: 200,
        user: user
    };

});
/**
 * 删除小组成员
 */
router.post('/deletemember', injectGroup,function* () {
    let memberId = this.request.params.id;
    if (!memberId) throw new BusinessError(ErrCode.ABSENCE_PARAM);
    let group = this.state.group;
    let user = yield User.findById(memberId);
    yield group.update({$pull: {members: {userid: user.id}}}).exec();
    if (user) {
        user.groupid = null;
        yield user.save();
    }
    this.body = {
        code: 200
    }
});
/**
 * 获取小组任务
 */
router.post('/gettask', injectGroup,function* () {
    let group = this.state.group;
    let task = Task.find({groupid: group.id}).exec();
    this.body = {
        code: 200,
        tasks: task
    }
});
/**
 * 获取小组日报
 */
router.post('/getreport', function* () {
    let params = this.request.params;
    let list = yield Report.find({groupid: this.state.group.id})
        .sort({updateTime: -1})
        .skip(parseInt(params.offset) || 0)
        .limit(parseInt(params.limit) || 15)
        .forEach(t => {
            let tasklist = [];
            t.tasks.forEach(m => {
                let task = Task.find({taskid: m});
                tasklist.push(task);
            })
            t.push(tasklist);
        });
    //上面是通过tasks获得task,然后填到list里。

    this.body = {
        code: 200,
        list: list
    };
});


/**
 * 新建组织
 */
// router.post('/create', auth.mustLogin(), function* () {
//     let name = this.request.params.name;
//     if (!name) {
//         throw new BusinessError(ErrCode.ABSENCE_PARAM, '组织名不能为空');
//     }
//     let group = new Group({
//         name: name,
//         members: [{userId: this.state.userId, admin: true}]
//     });
//     yield group.save();
//     let user = yield User.findById(this.state.userId).exec();
//     user.groupId = group.id;
//     yield user.save();
//     this.body = {
//         code: 200,
//         group: group
//     };
// });
// /**
//  * 获取组织信息
//  */
// router.get('/get', auth.mustLogin(), injectGroup, function* () {
//     let group = this.state.group;
//     let ids = [];
//     let admins = {};
//     group.members.forEach(m => {
//         ids.push(m.userId);
//         m.admin && (admins[m.userId] = true);
//     });
//     let members = yield User.find({_id: {$in: ids}}).exec();
//     this.body = {
//         code: 200,
//         info: group,
//         members: members.map(m => {
//             let obj = m.toObject();
//             obj.admin = !!admins[m.id];
//             return obj;
//         })
//     };
// });
// /**
//  * 更新组织信息
//  */
// router.post('/update', auth.mustLogin(), injectGroup, function* () {
//     let name = this.request.params.name;
//     let ret = {};
//     if (!name) {
//         throw new BusinessError(ErrCode.ABSENCE_PARAM, '组织名不能为空');
//     } else {
//         let group = this.state.group;
//         group.name = name;
//         yield group.save();
//         ret.code = 200;
//     }
//     this.body = ret;
// });
// /**
//  * 添加组织成员
//  */
// router.post('/addMember', auth.mustLogin(), injectGroup, function* () {
//     let mail = this.request.params.mail;
//     if (!mail) throw new BusinessError(ErrCode.ABSENCE_PARAM);
//     let group = this.state.group;
//     let user = yield User.findOne({username: mail});
//     if (!user) throw new BusinessError(416, '用户不存在');
//     if (user.groupId) throw new BusinessError(417, '添加出错,该用户已选择组织');
//     user.groupId = group.id;
//     yield group.update({$push: {members: {userId: user.id, admin: false}}}).exec();
//     yield user.save();
//     this.body = {
//         code: 200,
//         user: user
//     };
// });
// /**
//  * 删除组织成员
//  */
// router.post('/delMember', auth.mustLogin(), injectGroup, function* () {
//     let memberId = this.request.params.id;
//     if (!memberId) throw new BusinessError(ErrCode.ABSENCE_PARAM);
//     let group = this.state.group;
//     let user = yield User.findById(memberId);
//     yield group.update({$pull: {members: {userId: user.id}}}).exec();
//     if (user) {
//         user.groupId = null;
//         yield user.save();
//     }
//     this.body = {
//         code: 200
//     }
// });
// /**
//  * 更新组织成员角色
//  */
// router.post('/updateRole', auth.mustLogin(), injectGroup, function* () {
//     let userId = this.request.params.userId;
//     let admin = this.request.params.admin;
//     if (!userId || admin == null) throw new BusinessError(ErrCode.ABSENCE_PARAM);
//     let group = this.state.group;
//     let member = _.find(group.members, {userId: userId});
//     if (!member) throw new BusinessError(418, '用户不存在');
//     member.admin = admin;
//     yield group.save();
//     this.body = {
//         code: 200
//     }
// });

module.exports = router;