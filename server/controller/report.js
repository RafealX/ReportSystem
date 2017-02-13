/**
 * 日报
 */
'use strict';
const _ = require('lodash');
const co = require('co');
const router = require('koa-router')({prefix: '/report'});
const User = require('../model/user');
const Group = require('../model/group');
const Task = require('../model/task');
const Taskhistory = require('../model/taskhistory');
const Report = require('../model/report');
const logger = require('../lib/logger');
const auth = require('../lib/auth');
const util = require('../lib/util');
const config = require('../config');
const BusinessError = require('../error/BusinessError');
const ErrCode = BusinessError.ErrCode;
const ObjectId = require('mongodb').ObjectId;


/**
 * 获取个人日报
 * userid
 * offset
 * limit
 */

router.get('/get',auth.mustLogin(), function* () {
    let reports = [];
    let params = this.request.params;
    let list = yield Report.find({userid: params.userid,status:{"$ne":3}})
    .sort({"time":-1})
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
    }
});
/**
 * 添加日报
 */   
router.post('/add', auth.mustLogin(),function* () {
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
        let taskid = taskhistorylist[i].targettask;
        //task

        var taskparams = {};
        taskparams['$set'] = {
            progress:taskhistorylist[i].progress
        };
        taskparams['$inc']={
            totaltime:taskhistorylist[i].elapse
        }
        let mtask = yield Task.update({id:taskid},taskparams);
        let mtaskhistory = {};
        mtaskhistory.id = util.uuid();
        reporttaskids+=mtaskhistory.id+',';
        mtaskhistory.targettask = taskhistorylist[i].targettask;
        mtaskhistory.taskname = taskhistorylist[i].taskname;
        mtaskhistory.elapse = taskhistorylist[i].elapse*1;
        mtaskhistory.question = taskhistorylist[i].question;
        mtaskhistory.summary = taskhistorylist[i].summary;
        let date = new Date();
        date = new Date(date.toLocaleDateString());
        mtaskhistory.time = date.getTime();
        mtaskhistory.progress = taskhistorylist[i].progress;
        let taskhistory = new Taskhistory(mtaskhistory);
        yield taskhistory.save();
    }
    reporttaskids = reporttaskids.substring(0,reporttaskids.length-1);
    //report
    let rReport = {};
    rReport.status = 1;
    rReport.time = rData.time;
    rReport.others = rData.others;
    rReport.userid = rData.userid;
    rReport.groupid = rData.groupid;
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
router.post('/send',auth.mustLogin(), function* () {
    let rData = this.request.params;
    let report = yield Report.findOne({id:rData.reportid});
    if (!report) {
        throw new BusinessError(ErrCode.NOT_FIND);
    }
    report.status = 2;
    yield report.save();
    this.body = {
        code: 200
    };
});
/**
 * 编辑、修改日报
 * para reportid
 */
router.post('/edit',auth.mustLogin(), function* () {
    let rData = this.request.params;
    if(!rData){
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    let reporttaskids = [];
    let taskhistorylist = JSON.parse(rData.taskhistorylist);

    /*add日报
     调用3表
     task
     taskhistorylist
     report*/
    for(var i=0,l=taskhistorylist.length;i<l;i++){
        let taskid = taskhistorylist[i].targettask;

        //task
        var taskparams = {};
        taskparams['$set'] = {
            progress:taskhistorylist[i].progress
        };
        taskparams['$inc']={
            totaltime:taskhistorylist[i].elapse
        }
        let mtask = yield Task.update({id:taskid},taskparams);

        console.log(mtask);
        //taskhistory
        let mtaskhistory = {};
        mtaskhistory.id = taskhistorylist.id;
        if(!taskhistorylist[i].id){
            //说明是编辑里新增的记录
            let newTask = new Taskhistory({
                targettask: taskid,
                taskname:taskhistorylist[i].taskname,
                elapse: taskhistorylist[i].elapse*1,    //耗时
                question: taskhistorylist[i].question,
                summary: taskhistorylist[i].summary,
                time: rData.time,
                progress: taskhistorylist[i].progress
            });
            yield newTask.save();
            reporttaskids.push(newTask.toObject().id);
        }else{
            reporttaskids.push(taskhistorylist[i].id);
            var params = {};

            params["$set"] = {
                targettask:taskid,
                elapse:taskhistorylist[i].elapse,
                question:taskhistorylist[i].question,
                summary : taskhistorylist[i].summary,
                progress : taskhistorylist[i].progress
            };
            yield Taskhistory.update({id:taskhistorylist[i].id},params);
        }

        /*mtaskhistory.targettask = taskhistorylist[i].targettask;
        mtaskhistory.elapse = taskhistorylist[i].elapse;
        mtaskhistory.question = taskhistorylist[i].questioin;
        mtaskhistory.summary = taskhistorylist[i].summary;
        time = new Date().getTime();
        mtaskhistory.progress = taskhistorylist[i].progress;
        let taskhistory = new Taskhistory(mtaskhistory);
        yield taskhistory.save();*/
    }
    //report
    let reportid = rData.reportid;
    let targettask = '';
    reporttaskids.forEach((v,i)=>{
        targettask+=v+',';
    });
    targettask = targettask.substring(0,targettask.length-1);
    var params = {};
    params["$set"] = {
        time:rData.time,
        tasks:targettask,
        others:rData.others,
        userid:rData.userid,
        groupid : rData.groupid
    };
    let report = yield Report.update({id:reportid},params);


    this.body = {
        code: 200
    };
});

router.get('/todayadded',auth.mustLogin(),function* () {
    let rData = this.request.params;
    let mtask = {};
    if(!rData){
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    };
    mtask.status = 1;
    mtask.userid = this.state.loginUser.id;
    mtask.groupid = this.state.loginUser.groupid;
    var today = {};
    //today["$gte"] =  new Date(2012, 7, 14);
    let result = Report.find()
});
/**
 * 删除日报
 * para reportid
 */
router.post('/delete',auth.mustLogin(),function* () {
    let rData = this.request.params;
    let report = yield Report.findOne({id:rData.reportid});
    let taskhistorylist =report.tasks.split(",");
    if (!report) {
        throw new BusinessError(ErrCode.NOT_FIND);
    }
    for(var i=0,l=taskhistorylist.length;i<l;i++){
        let taskid = taskhistorylist[i];
        let mtaskhistory = yield Taskhistory.findOne({id: taskid});
        let targettask = mtaskhistory.targettask;
        let mtask = yield  Task.findOne({id: targettask});
        mtask.totaltime -= mtaskhistory.elapse;
        if(mtask.totaltime<0)mtask.totaltime = 0;
        yield mtaskhistory.remove();
        let mtaskhistorys = yield Taskhistory.findOne({id:taskid});
        if(mtaskhistorys){
            mtask.progress = mtaskhistorys.progress;
        }
        yield  mtask.save();

    }

    report.status = 3;
    yield report.save();
    this.body = {
        code: 200,
        report: report
    };

    /*let rData = this.request.params;
    if(!rData){
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    let reporttaskids = '';
    let taskhistorylist = JSON.parse(rData.taskhistorylist);
    /!*add日报
     调用3表
     task
     taskhistorylist
     report*!/
    for(var i=0,l=taskhistorylist.length;i<l;i++){
        let taskid = taskhistorylist[i].targettask;
        //task
        var taskparams = {};
        taskparams['$set'] = {
            progress:taskhistorylist[i].progress
        };
        taskparams['$inc']={
            totaltime:taskhistorylist[i].elapse
        }
        let mtask = yield Task.update({id:taskid},taskparams);
        let mtaskhistory = {};
        mtaskhistory.id = util.uuid();
        reporttaskids+=mtaskhistory.id+',';
        mtaskhistory.targettask = taskhistorylist[i].targettask;
        mtaskhistory.taskname = taskhistorylist[i].taskname;
        mtaskhistory.elapse = taskhistorylist[i].elapse*1;
        mtaskhistory.question = taskhistorylist[i].question;
        mtaskhistory.summary = taskhistorylist[i].summary;
        mtaskhistory.time = new Date();
        mtaskhistory.progress = taskhistorylist[i].progress;
        let taskhistory = new Taskhistory(mtaskhistory);
        yield taskhistory.save();
    }
    reporttaskids = reporttaskids.substring(0,reporttaskids.length-1);
    //report
    let rReport = {};
    rReport.status = 1;
    rReport.time = rData.time;
    rReport.others = rData.others;
    rReport.userid = rData.userid;
    rReport.groupid = rData.groupid;
    rReport.tasks = reporttaskids;
    let mReport = new Report(rReport);
    yield mReport.save();
    this.body = {
        code: 200,
        data: mReport
    };*/




});
/**
 * 小组日报
 * para groupid
 * offset  0,1,2,3....
 */
router.post('/team/get',auth.mustLogin(),function* () {
    let reports = [];
    let reporttimelist = {};
    let params = this.request.params;
    let list = yield Report.find({groupid: params.groupid}).sort({"time":-1});
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
                if(para) tasklist.push(para.toObject());
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
 * 新建简报
 */
// router.post('/create', auth.mustLogin(), function* () {
//     let rData = this.request.params.report;
//     if (!rData || !rData.content || !rData.type || !rData.periodTime) {
//         throw new BusinessError(ErrCode.ABSENCE_PARAM);
//     }
//     rData.userId = this.state.userId;
//     let report = new Report(rData);
//     yield report.save();
//     this.body = {
//         code: 200,
//         report: report
//     };
// });
// /**
//  * 更新
//  */
// router.post('/update', auth.mustLogin(), function* () {
//     let rData = this.request.params.report;
//     if (!rData || !rData.id || !rData.content || !rData.type || !rData.periodTime) {
//         throw new BusinessError(ErrCode.ABSENCE_PARAM);
//     }
//     let report = yield Report.findById(rData.id);
//     if (!report) {
//         throw new BusinessError(ErrCode.NOT_FIND);
//     }
//     report.type = rData.type;
//     report.content = rData.content;
//     report.periodTime = rData.periodTime;
//     yield report.save();
//     this.body = {
//         code: 200
//     };
// });
// /**
//  * 我的简报
//  */
// router.get('/my', auth.mustLogin(), function* () {
//     let params = this.request.params;
//     let list = yield Report.find({userid: this.state.userid})
//         .sort({updateTime: -1})
//         .skip(parseInt(params.offset) || 0)
//         .limit(parseInt(params.limit) || 15);
//     this.body = {
//         code: 200,
//         list: list
//     };
// });
// /**
//  * 小组简报
//  */
// router.get('/team', auth.mustLogin(), function* () {
//     let params = this.request.params;
//     let userId = this.state.userId;
//     // 我所在的小组
//     let teams = yield Team.find({members: {$elemMatch: {userId: userId}}}).exec();
//     // 我关注的小组
//     let followTeams = yield Team.find({follows: {$elemMatch: {userId: userId}}}).exec();
//     let teamMap = {};
//     let userMap = {};
//     let teamIds = [];
//     // 建立所有小组的k-v查询,以后面使用
//     teams.concat(followTeams).forEach(t => {
//         teamMap[t.id] = t;
//         teamIds.push(t.id);
//     });
//     // 查找小组日报
//     let list = yield TeamReport.find({teamId: {$in: teamIds}})
//         .sort({createTime: -1})
//         .skip(parseInt(params.offset) || 0)
//         .limit(parseInt(params.limit) || 15);
//     list = list.filter(x => x.list && x.list.length).map(x => x.toObject());
//     list.forEach(l => {
//         let team = teamMap[l.teamId];
//         let notSend = team.members.map(u => u.userId);
//         l.admin = !!_.find(team.members, {userId: userId, admin: true});
//         l.list.forEach(r => {
//             userMap[r.userId] = true;
//             // 将已发送的从not send里剔除
//             let index = notSend.indexOf(r.userId);
//             if (index >= 0) {
//                 notSend.splice(index, 1);
//             }
//         });
//         notSend.forEach(uid => userMap[uid] = true);
//         l.notSend = notSend;
//     });
//     let users = yield User.find({_id: {$in: Object.keys(userMap)}});
//     users.forEach(u => {
//         userMap[u.id] = u;
//     });
//     this.body = {
//         code: 200,
//         list: list,
//         teamMap: teamMap,
//         userMap: userMap
//     };
// });
// /**
//  * 删除简报
//  */
// router.get('/delete', auth.mustLogin(), function* () {
//     let rp = yield Report.findById(this.request.query.id);
//     if (!rp) throw new BusinessError(ErrCode.NOT_FIND);
//     if (rp.userId != this.state.userId) {
//         throw new BusinessError(433, '没有权限');
//     }
//     yield rp.remove();
//     if (rp.toTeam && rp.toTeam.teamReportId) {
//         let teamReport = yield TeamReport.findById(rp.toTeam.teamReportId);
//         let index = _.findIndex(teamReport.list, {reportId: rp.id});
//         if (index >= 0) {
//             teamReport.list.splice(index, 1);
//             yield teamReport.save();
//         }
//     }
//     this.body = {
//         code: 200
//     };
// });
// /**
//  * 发送简报
//  */
// router.post('/send', auth.mustLogin(), function* () {
//     let rp = yield Report.findById(this.request.body.reportId);
//     let team = yield Team.findById(this.request.body.teamId);
//     if (rp && team) {
//         let trp = yield TeamReport.findOne({
//             teamId: this.request.body.teamId,
//             periodDesc: rp.periodDesc
//         });
//         if (!trp) {
//             trp = new TeamReport({
//                 teamId: this.request.body.teamId,
//                 type: rp.type,
//                 periodDesc: rp.periodDesc,
//                 list: []
//             });
//         }
//         let send = _.find(trp.list, {userId: rp.userId});
//         if (send) {
//             send.reportId = rp.id;
//             send.content = rp.content;
//         } else {
//             trp.list.push({
//                 userId: rp.userId,
//                 reportId: rp.id,
//                 content: rp.content
//             });
//         }
//         rp.toTeam = {teamId: team.id, teamName: team.name, teamReportId: trp.id};
//         yield rp.save();
//         yield trp.save();
//         this.body = {
//             code: 200,
//             toTeam: rp.toTeam
//         };
//     }
// });
// /**
//  * 将小组简报邮件抄送
//  */
// router.get('/sendMail', auth.mustLogin(), function *() {
//     let params = this.request.params;
//     if (!params.teamReportId) throw new BusinessError(ErrCode.ABSENCE_PARAM);
//     let teamReport = yield TeamReport.findById(params.teamReportId);
//     if (!teamReport) throw new BusinessError(ErrCode.NOT_FIND);
//     if (!teamReport.list || !teamReport.list.length) throw new BusinessError(416, '暂无简报');
//     let team = yield Team.findById(teamReport.teamId);
//     if (!team) throw new BusinessError(417, '小组不存在');
//     if (!_.find(team.members, {admin: true, userId: this.state.userId})) {
//         throw new BusinessError(409, '无操作权限');
//     }
//     let userIds = teamReport.list.map(x => x.userId);
//     let users = yield User.find({_id: {$in: userIds}}).exec();
//     users = users.map(u => u.toObject());
//     let list = teamReport.list.map(x => x.toObject());
//     list.forEach(x => {
//         x.user = _.find(users, {id: x.userId}) || {};
//     });
//     let cc = users.map(x => x.workMail).concat(team.mails.split(/(,|;)/)).filter(x => !!x);
//     let html = yield this.render('mail', {list: list, writeResp: false});
//     util.sendMail({
//         from: `"${this.state.loginUser.nickname}" <${config.mail.auth.user}>`,
//         cc: cc.join(','),
//         subject: team.name + teamReport.periodDesc,
//         html: html
//     });
//     this.body = {code: 200};
// });

module.exports = router;