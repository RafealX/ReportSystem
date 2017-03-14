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
const Report = require('../model/report');
const Task = require('../model/task');
const TaskHistory = require('../model/taskhistory');
const TaskDelayHistory = require('../model/delayhistory');
const thunkify = require('thunkify');
const logger = require('../lib/logger');
const passportLocalMongoose = require('passport-local-mongoose');
const auth = require('../lib/auth');
const util = require('../lib/util');
const BusinessError = require('../error/BusinessError');
const _ = require('lodash');
const ErrCode = BusinessError.ErrCode;
const OpenId = require('../lib/openid');
let GetEarlyDate = function (earlytime) {
    let date = new Date();
    date = new Date(date.toLocaleDateString());
    return date.setDate(date.getDate()-earlytime),date.getTime();
}
let GetLateDate = function (latetime) {
    let date = new Date();
    date = new Date(date.toLocaleDateString());
    return date.setDate(date.getDate()+latetime),date.getTime();
}

let Mock = function (options) {
    //1.Mock Task
    //2.Mock History
    //3.Mock Delay
    //4.Mock Report

    //1.Mock Task
    let timetoTask = {};
    for(let i=1;i<3;i++){
        let date = new Date();
        date = new Date(date.toLocaleDateString());
        var isDelay = false;//Math.floor(Math.random()*10)%2==0?false:true;
        var reason = '';
        if(isDelay){
            reason = reasons[Math.floor(Math.random()*10)%2];
        }
        var id = util.uuid();
        var taskoptions = {
            id:util.uuid(),
            name: options.task.taskname+i,
            userid:options.userid,
            username:options.username,
            status:options.task.status,
            starttime:options.task.starttime,
            endtime:options.task.endtime,
            delaycount:options.task.delaycount,
            progress:options.task.progress,
            groupid:options.groupid,
            totaltime:options.task.totaltime,
            description:options.task.description+i
        };
        let task = new Task(taskoptions);
        task.save();
        //Mock History,and report
        let historys = [];
        var starttime = taskoptions.starttime;
        var endtime = taskoptions.endtime;
        var progress = taskoptions.progress;
        var delaycount = 1;
        for(let j=0;endtime>starttime && progress>0;){
            var hasProgress = Math.floor(Math.random()*10)%2==1?true:false;

            var taskhistoryops = {
                id: util.uuid(),
                taskid: taskoptions.id,
                taskname:taskoptions.name,
                elapse: hasProgress?4:0,    //耗时
                time:endtime,//创建时间，是跟随report创建时间
                progress: progress,
                startprogress:hasProgress?progress-5:progress,
                userid:options.userid,
                username:options.username,
                groupid:options.groupid,
                content:hasProgress?'完成了xxxxxxx':''
            };
            if(!timetoTask[taskhistoryops.time+'']){
                timetoTask[taskhistoryops.time+''] = [];
            }
            timetoTask[taskhistoryops.time+''].push(taskhistoryops.id);
            let taskhistory = new TaskHistory(taskhistoryops);
            taskhistory.save();
            if(!hasProgress&&delaycount<7){
                let date = new Date(options.task.endtime);
                date.setDate(date.getDate()-delaycount);
                var delayhistoryops = {
                    taskid:taskoptions.id,
                    userid:options.userid,
                    username:options.username,
                    groupid:options.groupid,
                    id:util.uuid(),
                    time:endtime,
                    sourcetime: taskoptions.starttime,//原截止日期
                    targettime: date.getTime(),//延期或提前
                    taskhistoryid:taskhistoryops.id,//如果在写日报的时候发生修改，就需要在此带上
                    reason: ''
                };
                let delay = new TaskDelayHistory(delayhistoryops);
                delay.save();
                delaycount++;
            }
            j++;
            let date = new Date(endtime);
            date.setDate(date.getDate()-1);
            endtime = date.getTime();
            if(hasProgress)
                progress-=5;
        }


    }
    //Mock Report
    var starttime = options.task.starttime;
    var endtime = options.task.endtime;
    for(;starttime<util.today();){
        var ids = timetoTask[starttime+''];
        if(ids && ids.length>0){
            var iditms = '';
            ids.forEach(itm=>{
                iditms+=itm+',';
            })
            iditms = iditms.substring(0,iditms.length-1);
            var reportop = {
                status: 2,
                id: util.uuid(),
                time: starttime,
                userid:options.userid,
                username:options.username,
                groupid:options.groupid,
                others: '今天完成了啥啥啥内容,3,#98652;研究了react,5,;做完了日志系统,6,#98541',
                tasks:iditms
            };
            let report = new Report(reportop);
            report.save();
        }
        let date = new Date(starttime);
        date.setDate(date.getDate()+1);
        starttime = date.getTime();
    }
}
let MakeOptions = function(user) {
    var arrs = [];
    var option = {
        task:{
            delaycount:2,
            taskname:'0_0这可能是个假任务',
            totaltime:20,
            description:'这是描述-_-',
            progress:80,
            status:2,
            starttime:GetEarlyDate(6),
            endtime:GetLateDate(6),
        },
        taskhistory:{
            taskid:'',
            taskname:'',
            elapse: 0,    //耗时
            time: 0,
            content:''//本日无进度时会进行填写
        }
    };
    if(user.id && user.name&&user.groupid){
        let ops = _.clone(option,true);
        ops.userid = user.id;
        ops.username = user.name;
        ops.groupid = user.groupid;
        arrs.push(ops);
    }
    /*let users = yield User.find({});
    if(users.length>0){
            for(var i=1;i<users.length;i++){
                let user = users[i].toObject();
                if(user){

                    arrs.push(ops);
                }
            }
    }*/
    return arrs;
}
OpenId.set.options({
    "client_id":'92d874daec3e11e6911c5cf3fc96a72c',
    "client_secret":"6d05d72d2ba746959fb845c775f585b592d87b24ec3e11e6911c5cf3fc96a72c",
    "cb_router":'/api/user/login/openid/cb',
    'fail_url':'/login'
});
let defaultGroupId = 'h5lka3729a4abll1b57fml7ip4f0d7lk2dcioedob1ldl36d';
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
        delete user.role;
        delete user.groupid;
        OpenId.goBack(this,user)
        console.log(list);
    }else{
        let insertResult = new User({
            name: UserInfo.fullname,
            groupid: defaultGroupId,//默认加到前端组先
            nickname:UserInfo.nickname,
            email:UserInfo.email,
            id:util.uuid()
        });
        yield insertResult.save();
        let insertUser = insertResult.toObject();

        let group = yield Group.findOne({id:defaultGroupId});
        if(group){
            let group_ = group.toObject();
            let members = JSON.parse(group_.members);
            if(members.hasOwnProperty(insertUser.id)){
                this.body = {
                    code:400,
                    msg:'用户已属于该组'
                }
            } else{
                members[insertUser.id] = insertUser.name;
                var params = {};
                params['$set']= {
                    members:JSON.stringify(members)
                }
                yield Group.update({id:defaultGroupId},params);
            }

        }


        let user = {
            id:insertUser.id,
            name:UserInfo.fullname,
            groupid:defaultGroupId
        }
/*        var options = MakeOptions(user);
        options.forEach(itm=>{
         Mock(itm);
        });*/
        console.log(insertResult.toObject());
        let userObj = insertResult.toObject();
        delete userObj.role;
        delete userObj.groupid;
        OpenId.goBack(this,userObj);
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
router.get('/get', function*() {
    let rData = this.request.params;
    if(!rData && !rData.userid){
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    let userid = rData.userid;
    let user = yield User.findOne({id:userid});
    if(user){
        this.body = {
            code: 200,
            user: user.toObject()
        };
    }else{
        this.body = {
            code:400,
            msg:'用户不存在'
        }
    }

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