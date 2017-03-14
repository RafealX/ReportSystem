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
   /* let user = yield User.findById(this.state.userid).exec();
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
    }*/
   if(!this.state.loginUser){
       this.body = {
           code:400,
           msg:'用户未登录'
       }
       return;
   }else{
       let user = this.state.loginUser;
       let groupid = user.groupid;
       let group = yield Group.findOne({id:groupid});
       if(group){
           group = group.toObject();
           if(group.adminid.indexOf(user.id)>=0){
               this.state.group = group;
               yield next;
           }else{
               this.body={
                   code:400,
                   msg:'不是管理员'
               }
               return;
           }
       }else{
           this.body={
               code:400,
               msg:'用户不属于任何小组'
           }
           return;
       }
   }
}
router.all('*',auth.mustLogin());
/**
 * 获取所有小组
 */
router.get('/get', injectGroup,function* () {
    if(this.state.group){
        let members = {};
        let users = this.state.group.members;
        let usersObj = JSON.parse(users);
        for(var i in usersObj){
            let user_ = yield User.findOne({id:i});
            if(user_) {
                user_ = user_.toObject();
                members[user_.id] = {
                    name:user_.name,
                    role:user_.role
                }
            }
        }
        let group = _.clone(this.state.group,true);
        group.members = JSON.stringify(members);
        this.body = {
            code:200,
            data:group
        }

    }else{
        this.body = {
            code:400,
            msg:'用户不属于任何小组'
        }
    }
    return;
});

router.get('/users/ungroup',injectGroup,function* (next) {
    let users = yield User.find({groupid:{"$eq":'0'}});
    if(users.length>0){
        this.body = {
            code:200,
            data:users
        }
    }else{
        this.body = {
            code:200,
            data:[]
        }
    }
    yield next;
})

/**
 * 设置小组信息
 */
router.post('/set', injectGroup,function* () {
    if(this.state.group){
        let rData = this.request.params;
        if(!rData){
            throw new BusinessError(ErrCode.ABSENCE_PARAM);
        }
        let groupid = rData.id;
        let params = {};
        params['$set'] = {
            name:rData.name,
            members :rData.members,
            copyto:rData.copyto
        }
        yield Group.update({id:groupid},params);
        this.body={
            code:200,
            msg:''
        }
    }else{
        this.body = {
            code:400,
            msg:'用户无权限'
        }
    }
    return;
});

/**
 * 小组中删除用户
 */
router.post('/user/del',injectGroup,function* () {
    if(this.state.group){
        let rData = this.request.params;
        if(!rData){
            throw new BusinessError(ErrCode.ABSENCE_PARAM);
        }
        let groupid = rData.id;
        let params = {};
        let delUserid = rData.userid;
        let userparams = {};
        userparams['$set'] = {
            groupid:'0'
        };
        yield User.update({id:delUserid},userparams);
        params['$set'] = {
            members :rData.members,
        }
        yield Group.update({id:groupid},params);
        this.body={
            code:200,
            msg:''
        }
    }else{
        this.body = {
            code:400,
            msg:'用户无权限'
        }
    }
    return;
})
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
 * 添加小组
 */
router.post('/create', auth.mustLogin(),function* () {
    let rDate = this.request.params;
    if(!rDate){
        throw new BusinessError(ErrCode.ABSENCE_PARAM, '缺少必备参数');
    }
    //需要判断user是否有权限创建组
    /*let user = this.state.loginUser;
    let target = User.findOne({name:user.nickname})*/
    let id = util.uuid();
    let group = new Group({
        id:id,
        name: rDate.name,
        members: JSON.stringify({}),
        adminid: ''
    });
    yield group.save();
    this.body = {
        code: 200,
        groupid: id
    }
});
/*router.post('/create/mock', function* () {
    let rDate = this.request.params;
    if(!rDate){
        throw new BusinessError(ErrCode.ABSENCE_PARAM, '缺少必备参数');
    }
    let id = util.uuid();
    let group = new Group({
        id:id,
        name: rDate.name,
        members: JSON.stringify({}),
        adminid: ''
    });
    yield group.save();
    this.body = {
        code: 200,
        groupid: id
    }
});*/

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
router.post('/getmember', auth.mustLogin(),function* () {
    let user = this.state.loginUser;
    if(user){
        let userid = user.id;
        let groupid = user.groupid;
        let group =yield Group.findOne({id:groupid});
        if(group){
            let group_ = group.toObject();
            if(group_.adminid.indexOf(userid)>=0){
                //遍历小组获取小组的成员的数据

                this.body = {
                    code:200,
                    data:JSON.parse(group_.members)
                }
                return;
            }else{
                this.body ={
                    code: 400,
                    msg:'用户不是该组组长'
                }
                return;
            }
        }else{
            this.body ={
                code: 400,
                msg:'用户不属于任何一个组'
            }
            return;
        }
    }
    this.body ={
        code: 400,
        msg:'用户没登录'
    }
});
/**
 * 添加小组成员
 */
router.post('/addmember', auth.mustLogin(), function* () {
    let rData = this.request.params;
    if(!rData){
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    let groupid = rData.id;
    let users = rData.addusers;
    if(users){
        let userids = users.split(',');
        for(var i=0;i<userids.length;i++){
            if(userids[i]=='')
                continue;
            let userid = userids[i];
            let group = yield Group.findOne({id:groupid});
            if(!group){
            }else{
                let group_ = group.toObject();

                var params = {};
                params['$set']= {
                    members:rData.members
                }
                yield Group.update({id:groupid},params);
                let userparams = {};
                userparams['$set'] = {
                    groupid:groupid
                };
                yield User.update({id:userid},userparams);
                this.body = {
                    code:200,
                    msg:'成功加入'+group_.name
                }
            }
        }

    }

});
/*router.post('/addmember/mock', function* () {
    let rData = this.request.params;
    if(!rData){
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    let groupid = rData.groupid;
    let user = yield User.findOne({id:rData.userid});
    if(user){
        user = user.toObject();
        let userid = user.id;
        let usergroup = user.groupid;
        let group =yield Group.findOne({id:usergroup});
        if(group){
            this.body = {
                code:400,
                msg:'用户已属于'+group.toObject().name
            }
        }else{
            let group = yield Group.findOne({id:groupid});
            if(group){
                let group_ = group.toObject();
                let members = JSON.parse(group_.members);
                if(members.hasOwnProperty(userid)){
                    this.body = {
                        code:400,
                        msg:'用户已属于该组'
                    }
                } else{
                    members[userid] = user.name;
                    var params = {};
                    params['$set']= {
                        members:JSON.stringify(members)
                    }
                    yield Group.update({id:groupid},params);
                    params = {};
                    params['$set'] = {
                        groupid:groupid
                    };
                    yield User.update({id:userid},params);
                    this.body = {
                        code:200,
                        msg:'成功加入'+group_.name
                    }
                    return;
                }

            }
        }
    }
    this.body ={
        code: 400,
        msg:'用户没登录'
    }

});
router.post('/addmemberall/mock', function* () {
    //clear and mock
    let rData = this.request.params;
    if(!rData){
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    let groupid = rData.groupid;
    let group =yield Group.findOne({id:groupid});
    var params_g = {};
    var members = {};
    if(group){
        let group_ = group.toObject();
        let user = yield User.find({});
        if(user.length>0){
            for(let i =0;i<user.length;i++){
                var tar_user = user[i].toObject();
                members[tar_user.id] = tar_user.name;
                let params = {};
                params['$set'] = {
                  groupid: groupid,
                    role:1
                };
                yield User.update({id:tar_user.id},params);
            }
            params_g['$set'] = {
                members:JSON.stringify(members)
            };
            yield Group.update({id:groupid},params_g);
            this.body ={
                code: 200,
                msg:'成功'
            }
            return;
        }
    }

    this.body ={
        code: 400,
        msg:'用户没登录'
    }

});*/

router.post('/setadmin',injectGroup,function* () {
    let rData = this.request.params;
    if(!rData){
        throw new BusinessError(ErrCode.ABSENCE_PARAM, '缺少必备参数');
    }
    let groupid = rData.groupid;
    let userid = rData.targetuserid;
    let isadmin = rData.isadmin;
    let group = yield Group.findOne({id:groupid});
    let user = yield User.findOne({id:userid});
    if(group && user){
        let group_ = group.toObject();
        let user_ = user.toObject();
        let params = {};
        let sourceadmin = group_.adminid;

        if(sourceadmin.indexOf(user_.id)>=0){
            if(isadmin==0){
                //去除其权限
                let admins = sourceadmin.split('||');
                let target = "";
                _.each(admins,itm=>{
                    if(itm!=user_.id){
                        target+=itm+'||';
                    }
                });
                if(target){
                    target = target.substring(0,target.length-2);
                }else{
                    target = this.state.loginUser.id;//总不能没有一个组长吧。
                }
                params['$set'] = {
                    adminid:target
                };
                yield Group.update({id:group_.id},params);
            }
        }
        else{
            if(isadmin==1){
                let admins = sourceadmin.split('||');
                let target = "";
                _.each(admins,itm=>{
                    if(itm){
                        target+=itm+'||';
                    }
                });
                if(target){
                    target+=user_.id
                }else{
                    target = user_.id+"||"+this.state.loginUser.id;//调用此接口的用户必然是组长
                }
                params['$set'] = {
                    adminid:target
                };
                yield Group.update({id:group_.id},params);
            }


        }

        var params_g = {};

        params_g['$set'] = {
            role:isadmin==1?2:1
        };

        yield User.update({id:userid},params_g);
        this.body = {
            code:200,
            msg:'设置成功'
        }
        return;
    }
    this.body = {
        code:400,
        msg:''
    }
});

/*router.post('/setadmin/mock',function* () {
   let rData = this.request.params;
   if(!rData){
       throw new BusinessError(ErrCode.ABSENCE_PARAM, '缺少必备参数');
   }
   let groupid = rData.groupid;
   let userid = rData.userid;
   let group = yield Group.findOne({id:groupid});
   let user = yield User.findOne({id:userid});
   if(group && user){
       let group_ = group.toObject();
       let user_ = user.toObject();
       let params = {};
       params['$set'] = {
         adminid:user_.id
       };
       yield Group.update({id:group_.id},params);
       var params_g = {};
       params_g['$set'] = {
           role:2
       };
       yield User.update({id:userid},params_g);
       this.body = {
           code:200,
           msg:'设置成功'
       }
       return;
   }
   this.body = {
       code:400,
       msg:''
   }
});*/
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


module.exports = router;