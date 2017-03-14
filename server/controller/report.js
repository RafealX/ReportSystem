/**
 * 日报
 */
'use strict';
const _ = require('lodash');
const co = require('co');
const nodemailer = require('nodemailer');
const router = require('koa-router')({prefix: '/report'});
const User = require('../model/user');
const Group = require('../model/group');
const Task = require('../model/task');
const Taskhistory = require('../model/taskhistory');
const Report = require('../model/report');
const DelayHistory = require('../model/delayhistory');
const logger = require('../lib/logger');
const auth = require('../lib/auth');
const util = require('../lib/util');
const config = require('../config');
const BusinessError = require('../error/BusinessError');
const ErrCode = BusinessError.ErrCode;
const ObjectId = require('mongodb').ObjectId;

let reportHandle = {
    istodayadd:function() {
        return function*(next) {
            let rData = this.request.params;
            let userid = '';
            if(rData && rData.userid){
                userid = rData.userid;
            }else
                userid = this.state.loginUser.userid;
            let date = rData.time || util.today();
            let report = yield Report.find({userid:userid,time:date,status:{"$lt":3}});

            if(report.length>0){
                this.body = {
                    code:400,
                    msg:'今日已发送过日报！'
                }
                return;
            }else
                yield next;
        }
    }
};

router.all('*',auth.mustLogin());
/**
 * 获取个人日报
 * userid
 * offset
 * limit
 */

router.get('/get', function* () {
    let reports = [];
    let params = this.request.params;
    let list = yield Report.find({userid: params.userid,status:{"$lt":3}})
    .sort({"time":-1})
    .skip(parseInt(params.offset) || 0)
    .limit(parseInt(params.limit) || 15);
    for(let x=0,k=list.length;x<k;x++){
        let rpitm = list[x].toObject();
        let taskArr = rpitm.tasks.split(",");
        let tasklist = [];  //存放真正的task列表
        for(let i=0,l=taskArr.length;i<l;i++){
            let para = yield Taskhistory.findOne({id: taskArr[i]});

            if(para) {

                let taskhistory = para.toObject();
                let taskid = taskhistory.taskid;
                let taskhistoryid = taskhistory.id;
                let isDelayItem =  yield DelayHistory.find({taskid: taskid,taskhistoryid:taskhistoryid})
                    .sort({"time":-1});
                if(isDelayItem.length>0){
                    isDelayItem = isDelayItem[0];
                    let objs = isDelayItem.toObject();
                    taskhistory.delay = objs.targettime - objs.sourcetime;
                    taskhistory.delaytotime = objs.targettime;
                }
                tasklist.push(taskhistory)

            };
        }
        rpitm.taskhistorylist=tasklist;
        reports.push(rpitm);
    }
    this.body = {
        code: 200,
        reports: reports
    }
});

/*
* 检测用户今日是否已经写了日报
*/
router.post('/isadded',function* (next) {
    let rData = this.request.params;
    let userid = '';
    if(rData && rData.userid){
        userid = rData.userid;
    }else
        userid = this.state.loginUser.userid;
    let date = rData.time || util.today();
    let report = yield Report.find({userid:userid,time:date,status:{"$lt":3}});

    if(report.length>0){
        let reportitm = report[0];

        this.body = {
            code:400,
            status:reportitm.status,
            msg:'今日已发送过日报！'
        }
        return;
    }else
        this.body = {
            code:200,
            msg:''
        }
        return;
});

/**
 * 添加日报,
 * 添加日报情况只会往taskhistory添加记录，
 */   
router.post('/add',reportHandle.istodayadd(),function* () {
    let rData = this.request.params;
    if(!rData){
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    let reporttaskids = '';
    let taskhistorylist = JSON.parse(rData.taskhistorylist);



    /*add日报
    调用3表
    task
    taskhistorylist
    report*/
    for(var i=0,l=taskhistorylist.length;i<l;i++){
        let taskid = taskhistorylist[i].taskid;
        let targetTask = yield Task.findOne({id:taskid});
        if(!targetTask){
            //添加新任务不与此相关，如果本次日志添加了新任务，就会被真正添加到任务中，而删除了日报此任务不会被删除，只能到任务tab中删除
            let mtask = {};

            taskid = mtask.id = util.uuid();
            mtask.status = 2;
            mtask.userid = rData.userid;
            mtask.groupid = rData.groupid;
            mtask.username = this.state.loginUser.name;
            mtask.endtime = taskhistorylist[i].tasktime;
            mtask.starttime = util.today();
            mtask.isdelay = false;
            mtask.delaycount = 0;
            mtask.name = taskhistorylist[i].taskname;
            mtask.ticket = '';
            mtask.totaltime =0;
            mtask.description = taskhistorylist[i].description;
            mtask.progress = 0;
            let task = new Task(mtask);
            targetTask = yield task.save();
        }
        let targetTaskObject = targetTask.toObject();

        var taskparams = {};
        taskparams['$set'] = {};
        /*if(!isNaN(taskhistorylist[i].elapse*1) && taskhistorylist[i].elapse*1>0){
            taskparams['$inc']={
                totaltime:taskhistorylist[i].elapse*1
            }
        }*/
        let mtaskhistory = {},mtaskhistoryid = '';
        mtaskhistoryid = mtaskhistory.id = util.uuid();
        reporttaskids+=mtaskhistory.id+',';
        mtaskhistory.taskid = targetTaskObject.id;
        mtaskhistory.taskname = taskhistorylist[i].taskname;
        mtaskhistory.elapse = taskhistorylist[i].elapse*1;
        mtaskhistory.content = taskhistorylist[i].content;
        mtaskhistory.time = util.today();
        mtaskhistory.userid = rData.userid;
        mtaskhistory.groupid = rData.groupid;
        mtaskhistory.username = this.state.loginUser.name;
        mtaskhistory.status = 1;//新建的时候为1，此时未发送
        mtaskhistory.progress = taskhistorylist[i].progress;
        mtaskhistory.startprogress = targetTaskObject.progress;

        let taskhistory = new Taskhistory(mtaskhistory);
        yield taskhistory.save();
        let changedtask = {};
        changedtask['$set'] = {
            taskname:taskhistorylist[i].taskname
        }
        yield Taskhistory.update({taskid:targetTaskObject.id},changedtask);

        taskparams['$set'].name = taskhistorylist[i].taskname;
        taskparams['$set'].description = taskhistorylist[i].description;

        //task
        //证明延期了！
        if(targetTaskObject.endtime!=taskhistorylist[i].tasktime){
            taskparams['$set'].endtime = taskhistorylist[i].tasktime;
            let delayparams = {};
            delayparams.taskid = taskid;
            delayparams.time = new Date().getTime();//记录创建时间
            delayparams.userid = rData.userid;
            delayparams.groupid = rData.groupid;
            delayparams.sourcetime = targetTaskObject.endtime;
            delayparams.targettime = taskhistorylist[i].tasktime;
            delayparams.reason = taskhistorylist[i].reason || '';//Todo 增加reason字段
            delayparams.taskhistoryid=mtaskhistoryid;
            let delayhistory = new DelayHistory(delayparams);
            yield delayhistory.save();

        }
        yield Task.update({id:taskid},taskparams);

    }
    reporttaskids = reporttaskids.substring(0,reporttaskids.length-1);
    //report
    let rReport = {};
    rReport.status = 1;
    rReport.time = rData.time;
    rReport.others = rData.others;
    rReport.userid = rData.userid;
    rReport.groupid = rData.groupid;
    rReport.username = rData.username||this.state.loginUser.name;
    rReport.tasks = reporttaskids;
    let mReport = new Report(rReport);
    yield mReport.save();

    this.body = {
        code: 200,
        data: mReport
    };

});
/**
 * 发送日报
 * para reportid
 */
router.post('/send', function* () {
    let rData = this.request.params;
    let report = yield Report.findOne({id:rData.reportid});
    if (!report) {
        throw new BusinessError(ErrCode.NOT_FIND);
    }
    report = report.toObject();

    let taskhistorylist =report.tasks.split(",");
    let report_params = {};
    report_params['$set'] = {
        status:2
    };
    for(var i=0,l=taskhistorylist.length;i<l;i++){
        let taskid = taskhistorylist[i];
        let mtaskhistory = yield Taskhistory.findOne({id: taskid});
        if(mtaskhistory) {
            mtaskhistory = mtaskhistory.toObject();
            let task_his_param = {};
            task_his_param['$set'] = {
                status: 2
            }
            let targettaskid = mtaskhistory.taskid;
            let targettask = yield Task.findOne({id: targettaskid});
            if (targettask) {
                targettask = targettask.toObject();
                let taskparams = {};
                if(mtaskhistory.elapse*1>0)
                    targettask.totaltime += mtaskhistory.elapse;
                taskparams['$set'] = {
                    progress: mtaskhistory.progress,
                    totaltime: targettask.totaltime
                }
                if(mtaskhistory.progress*1==100){
                    taskparams['$set'].status = 3;
                }
                yield Task.update({id: targettaskid}, taskparams);
            }
            yield Taskhistory.update({id: taskid}, task_his_param);
        }

    }

    yield Report.update({id:rData.reportid},report_params);
    this.body = {
        code: 200
    };
});
/**
 * 编辑、修改日报
 * para reportid
 */
router.post('/edit', function* () {
    let rData = this.request.params;
    if(!rData){
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    //编辑肯定是对现有存在的日报进行填写
    let reportid = rData.reportid;
    if(!reportid){
        this.body={
            code:400,
            msg:'缺少待编辑日报id'
        };
        return;
    }
    let report = yield Report.findOne({id:reportid});
    if(!report){
        this.body={
            code:400,
            msg:'待编辑日报已被删除'
        };
        return;
    }
    report = report.toObject();
/*
    let taskhistoryids = report.tasks.split(',');
    for(var i=0;i<taskhistoryids.length;i++){

    }
*/

    let reporttaskids = "";
    let taskhistorylist = JSON.parse(rData.taskhistorylist);

    for(var i=0,l=taskhistorylist.length;i<l;i++){
        let taskid = taskhistorylist[i].taskid;
        let targetTask = yield Task.findOne({id:taskid});
        var taskparams = {};
        taskparams['$set']={};
        var targetTaskObject;
        let mtaskhistoryid = '';
        if(!targetTask){
            //添加新任务
            let mtask = {};

            taskid = mtask.id = util.uuid();
            mtask.status = 2;
            mtask.userid = rData.userid;
            mtask.groupid = rData.groupid;
            mtask.username = this.state.loginUser.name;
            mtask.endtime = taskhistorylist[i].tasktime;
            mtask.starttime = util.today();
            mtask.isdelay = false;
            mtask.delaycount = 0;
            mtask.name = taskhistorylist[i].taskname;
            mtask.ticket = '';
            mtask.totaltime =0;
            mtask.description = taskhistorylist[i].description;
            mtask.progress = 0;
            let task = new Task(mtask);
            targetTask = yield task.save();


            targetTaskObject = targetTask.toObject();
            let mtaskhistory = {};
            mtaskhistoryid = mtaskhistory.id = util.uuid();
            reporttaskids+=mtaskhistory.id+',';
            mtaskhistory.taskid = targetTaskObject.id;
            mtaskhistory.taskname = taskhistorylist[i].taskname;
            mtaskhistory.elapse = taskhistorylist[i].elapse*1;
            mtaskhistory.content = taskhistorylist[i].content;
            mtaskhistory.time = util.today();
            mtaskhistory.userid = rData.userid;
            mtaskhistory.groupid = rData.groupid;
            mtaskhistory.username = this.state.loginUser.name;
            mtaskhistory.status = 1;
            mtaskhistory.startprogress = targetTaskObject.progress;
            mtaskhistory.progress = taskhistorylist[i].progress;

            let taskhistory = new Taskhistory(mtaskhistory);
            yield taskhistory.save();
        }
        else{
            mtaskhistoryid = taskhistorylist[i].id;
            reporttaskids+=mtaskhistoryid+',';
            let taskhistory = yield Taskhistory.findOne({id:taskhistorylist[i].id});
            targetTaskObject = targetTask.toObject();
            var taskhistoryparams = {};

            taskhistoryparams['$set']={
                content:taskhistorylist[i].content,
                progress:taskhistorylist[i].progress,
                elapse:taskhistorylist[i].elapse
            }
            let changedtask = {};
            changedtask['$set'] = {
                taskname:taskhistorylist[i].taskname
            }
            yield Taskhistory.update({taskid:targetTaskObject.id},changedtask);

            taskparams['$set'].name = taskhistorylist[i].taskname;
            taskparams['$set'].description = taskhistorylist[i].description;
            //判断progress，elapse
            yield Taskhistory.update({id:taskhistorylist[i].id},taskhistoryparams);

        }
        //task
        //延期是不可逆的操作，只要确定了就会被记录下来，无论编辑还是新建的时候，对任务进行了延期，都会被记录下来
        if(targetTaskObject.endtime!=taskhistorylist[i].tasktime){
            taskparams['$set'].endtime = taskhistorylist[i].tasktime;
            let delayparams = {};
            delayparams.taskid = taskid;
            delayparams.time = new Date().getTime();//记录创建时间
            delayparams.userid = rData.userid;
            delayparams.groupid = rData.groupid;
            delayparams.sourcetime = targetTaskObject.endtime;
            delayparams.targettime = taskhistorylist[i].tasktime;
            delayparams.reason = taskhistorylist[i].reason || '';//Todo 增加reason字段
            delayparams.taskhistoryid=mtaskhistoryid;
            let delayhistory = new DelayHistory(delayparams);
            yield delayhistory.save();

        }
        yield Task.update({id:taskid},taskparams);

    }
    reporttaskids = reporttaskids.substring(0,reporttaskids.length-1);



    //report
    var params = {};
    params["$set"] = {
        time:rData.time,
        tasks:reporttaskids,
        others:rData.others
    };
    let updateReport = yield Report.update({id:reportid},params);


    this.body = {
        code: 200,
        reportid:reportid
    };
});

/**
 * 删除日报
 * para reportid
 */
router.post('/delete',function* () {
    let rData = this.request.params;
    let report = yield Report.findOne({id:rData.reportid});
    if (!report) {
        throw new BusinessError(ErrCode.NOT_FIND);
    }
    report = report.toObject();
    let taskhistorylist =report.tasks.split(",");
    let report_params = {};
    report_params['$set'] = {
        status:3
    };
    for(var i=0,l=taskhistorylist.length;i<l;i++){
        let taskid = taskhistorylist[i];
        let mtaskhistory = yield Taskhistory.findOne({id: taskid});
        if(mtaskhistory) {
            mtaskhistory = mtaskhistory.toObject();
            let task_his_param = {};
            task_his_param['$set'] = {
                status: 3
            }
            let targettaskid = mtaskhistory.taskid;
            let targettask = yield Task.findOne({id: targettaskid});
            if (targettask) {
                targettask = targettask.toObject();
                let taskparams = {};

                targettask.totaltime -= mtaskhistory.elapse;
                if (targettask.totaltime < 0) targettask.totaltime = 0;
                taskparams['$set'] = {
                    progress: mtaskhistory.startprogress,
                    totaltime: targettask.totaltime
                }
                if( mtaskhistory.startprogress*1<100)
                    taskparams['$set'].status = 2;
                yield Task.update({id: targettaskid}, taskparams);
            }
            yield Taskhistory.update({id: taskid}, task_his_param);
        }

    }

    yield Report.update({id:rData.reportid},report_params);
    this.body = {
        code: 200,
        report: report
    };
});

/*
   打回日报
   打回日报后，把日报状态置为2，关联的taskhistory状态置为2，撤销task进度，耗时，无法撤销延期修改。
*/
router.post('/back',function* () {
   let rData = this.request.params;
   if(!rData){
       throw new BusinessError(ErrCode.NOT_FIND);
   }
    let reportid = rData.reportid;
    if(!reportid){
        this.body={
            code:400,
            msg:'缺少待编辑日报id'
        };
        return;
    }
    let report = yield Report.findOne({id:reportid});
    if(!report){
        this.body={
            code:400,
            msg:'待编辑日报已被删除'
        };
        return;
    }
    report = report.toObject();
    //第一步进行权限检查,只有小组组长才能进行打回操作
    let group = yield Group.findOne({id:report.groupid});
    if(!group){
        this.body={
            code:400,
            msg:'目标小组不存在'
        };
        return;
    }
    group = group.toObject();
    if(group.adminid.indexOf(this.state.loginUser.id)){
        this.body={
            code:400,
            msg:'您无权限操作'
        };
        return;
    }
    let taskhistorylist =report.tasks.split(",");
    let report_params = {};
    report_params['$set'] = {
        status:1
    };
    for(var i=0,l=taskhistorylist.length;i<l;i++){
        let taskid = taskhistorylist[i];
        let mtaskhistory = yield Taskhistory.findOne({id: taskid});
        if(mtaskhistory) {
            mtaskhistory = mtaskhistory.toObject();
            let task_his_param = {};
            task_his_param['$set'] = {
                status: 1
            }
            let targettaskid = mtaskhistory.taskid;
            let targettask = yield Task.findOne({id: targettaskid});
            if (targettask) {
                targettask = targettask.toObject();
                let taskparams = {};
                if(mtaskhistory.elapse*1>0)
                    targettask.totaltime -= mtaskhistory.elapse;
                taskparams['$set'] = {
                    progress: mtaskhistory.startprogress,
                    totaltime: targettask.totaltime
                }
                yield Task.update({id: targettaskid}, taskparams);
            }
            yield Taskhistory.update({id: taskid}, task_his_param);
        }

    }

    yield Report.update({id:rData.reportid},report_params);
    this.body = {
        code: 200
    };

});

/**
 * 小组日报
 * para groupid
 * offset  0,1,2,3....
 */
router.post('/team/get',function* () {
    let reports = [];
    let reporttimelist = {};
    let params = this.request.params;
    let list = yield Report.find({groupid: params.groupid,status:{"$eq":2}}).sort({"time":-1});
    let Obj = {};
    let timelist = [];
    for(let x=0,k=list.length;x<k;x++){
        let rpitm = list[x].toObject();
        let timestr = rpitm.time;
        if(!Obj[timestr])
        {
            timelist.push(timestr);
            reporttimelist[timestr] = [rpitm.id]
            Obj[timestr] = 1;
        }else{
            reporttimelist[timestr].push(rpitm.id)
        }
    }
    let Tar = reporttimelist[timelist[params.offset]];
    //日报
    if(Tar&&Tar.length&&Tar.length>0){
        for(var n=0,v=Tar.length;n<v;n++){
            let nlist = yield Report.findOne({id: Tar[n]});
            //todo 这里的nlist应该只有一条数据？！
            let ritem = nlist.toObject();
            let taskArr = ritem.tasks.split(",");
            let tasklist = [];  //存放真正的task列表
            for(let i=0,l=taskArr.length;i<l;i++){
                let para = yield Taskhistory.findOne({id: taskArr[i]});
                if(para) {

                    let taskhistory = para.toObject();
                    let taskid = taskhistory.taskid;
                    let taskhistoryid = taskhistory.id;
                    let isDelayItem =  yield DelayHistory.findOne({taskid: taskid,taskhistoryid:taskhistoryid});
                    if(isDelayItem){
                        let objs = isDelayItem.toObject();
                        taskhistory.delay = objs.targettime - objs.sourcetime;
                        taskhistory.delaytotime = objs.targettime;
                    }
                    tasklist.push(taskhistory)

                };

            }
            ritem.taskhistorylist=tasklist;
            reports.push(ritem);
        }
    }

    this.body = {
        code: 200,
        reports: reports
    }

    //未加reportbytime表前
   /* let reports = [];
    let params = this.request.params;
    let list = yield Report.find({groupid: params.groupid})
        .sort({"time": -1})
        .skip(parseInt(params.offset) || 0)
        .limit(parseInt(params.limit) || 15);
    for(let x=0,k=list.length;x<k;x++){
        let rpitm = list[x].toObject();
        let taskArr = rpitm.tasks.split(",");
        let tasklist = [];  //存放真正的task列表
        for(let i=0,l=taskArr.length;i<l;i++){
            let para = yield Taskhistory.findOne({id: taskArr[i]});
            if(para) tasklist.push(para.toObject());
        }
        rpitm.taskhistorylist=tasklist;
        reports.push(rpitm);
    }
    this.body = {
        code: 200,
        reports: reports
    }*/
});

/**
 * 将小组简报邮件抄送
 */
router.post('/sendmail', auth.mustLogin(), function *() {
    let params = this.request.params;
    if (!params.time)
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    let user = this.state.loginUser;
    let userid = user.id;
    let groupid = user.groupid;
    let group = yield Group.findOne({id:groupid});
    if(group){
        let group_ = group.toObject();
        if(group_.adminid==userid){
            let reports = yield Report.find({groupid:groupid,time:params.time});
            if(reports.length>0){
                //遍历生成日报格式
                for(var o=0;o<reports.length;o++){
                   /* let rid = reports[o].id;
                    let rpparams = {};
                    rpparams['$set'] = {
                        issend:true
                    };
                    yield Report.update({id:rid},rpparams);*/
                }
                var options = {
                    from           : '<hzhhtesting@163.com>',
                    to             : '<hzxiangfangnian@corp.netease.com>',
                    cc             : '<lordjesus@sina.cn>',    //抄送
                    //bcc         : '' ,   //密送
                    subject        : '一封来自Node Mailer的邮件',
                    html           : '<h1>你好，这是一封来自NodeMailer的邮件！</h1>',
                };

                util.sendMail(options);

            }else{
                this.body={
                    code:400,
                    msg:(new Date(time).toLocaleDateString())+'不存在日报'
                }
                return;
            }
        }else{
            this.body={
                code:400,
                msg:'用户不是组长'
            }
            return;
        }
    }else{
        this.body={
            code:400,
            msg:'小组不存在'
        }
        return;
    }
    /*let teamReport = yield TeamReport.findById(params.teamReportId);
    if (!teamReport) throw new BusinessError(ErrCode.NOT_FIND);
    if (!teamReport.list || !teamReport.list.length) throw new BusinessError(416, '暂无简报');
    let team = yield Team.findById(teamReport.teamId);
    if (!team) throw new BusinessError(417, '小组不存在');
    if (!_.find(team.members, {admin: true, userId: this.state.userId})) {
        throw new BusinessError(409, '无操作权限');
    }
    let userIds = teamReport.list.map(x => x.userId);
    let users = yield User.find({_id: {$in: userIds}}).exec();
    users = users.map(u => u.toObject());
    let list = teamReport.list.map(x => x.toObject());
    list.forEach(x => {
        x.user = _.find(users, {id: x.userId}) || {};
    });
    let cc = users.map(x => x.workMail).concat(team.mails.split(/(,|;)/)).filter(x => !!x);
    let html = yield this.render('mail', {list: list, writeResp: false});

    util.sendMail({
        from: `"${this.state.loginUser.nickname}" <${config.mail.auth.user}>`,
        cc: cc.join(','),
        subject: team.name + teamReport.periodDesc,
        html: html
    });*/
    this.body = {code: 200};
});
router.post('/sendmail/mock', function *() {
    var options = {
        from           : '<hzhhtesting@163.com>',
        //bcc         : '' ,   //密送
        subject        : '一封来自Node Mailer的邮件',
        html           : '<h1>你好，这是一封来自NodeMailer的邮件！</h1>',
    };
    let reports = yield Report.find({groupid:'h5lka3729a4abll1b57fml7ip4f0d7lk2dcioedob1ldl36d',time:1487865600000});

    let group = yield Group.findOne({id:'h5lka3729a4abll1b57fml7ip4f0d7lk2dcioedob1ldl36d'});
    let group_ = group.toObject();
    let members = group_.members;
    members = JSON.parse(members);
    var to_ = '',mail_tpl = "<$>";
    for(var i in members){
        var user = yield User.findOne({id:i});
        let user_ = user.toObject();
        to_+=mail_tpl.replace('$',user.email)+',';
    }
    to_ = to_.substring(0,to_.length-1);
    options.to = to_;

    var cc_ = group_.copyto,cc_to='';
    cc_ = cc_.split(',');
    for(var i=0;i<cc_.length;i++){
        if(cc_[i])
            cc_to+=mail_tpl.replace('$',cc_[i])+',';
    }
    cc_to = cc_to.substring(0,cc_to.length-1);
    options.cc = cc_to;
    options.subject = new Date(1487865600000).toLocaleDateString()+'日报';
    //接下来就是生成html结构了亲
    for(var r=0;r<reports.length;r++){
        let report = reports[r].toObject();
        let taskArr = report.tasks.split(",");
        let tasklist = [];  //存放真正的task列表
        for(let i=0,l=taskArr.length;i<l;i++){
            let para = yield Taskhistory.findOne({id: taskArr[i]});

            if(para) {
                let taskhistory = para.toObject();
                let taskid = taskhistory.taskid;
                let taskhistoryid = taskhistory.id;
                let isDelayItem =  yield DelayHistory.find({taskid: taskid,taskhistoryid:taskhistoryid})
                    .sort({"time":-1});
                if(isDelayItem.length>0){
                    isDelayItem = isDelayItem[0];
                    let objs = isDelayItem.toObject();
                    taskhistory.delay = objs.targettime - objs.sourcetime;
                    taskhistory.delaytotime = objs.targettime;
                }
                tasklist.push(taskhistory)

            }
        }
        report.taskhistorylist=tasklist;
        reports.push(rpitm);
    }

    var mailTransport = nodemailer.createTransport({
        host: 'smtp.163.com',
        port: 465,
        secure: true,
        auth: {
            user: 'hzhhtesting@163.com',
            pass: 'test1234'
        }
    });



    mailTransport.sendMail(options, function(err, msg){
        if(err){
            console.log(err);
            //res.render('index', { title: err });
        }
        else {
            console.log(msg);
            //res.render('index', { title: "已接收："+msg.accepted});
        }
    });
    this.body = {code: 200};
});
module.exports = router;