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
 */

router.get('/get', function* () {
    // let params = this.request.params;
    // let list = yield Report.find({userid: params.userid})
    //     .sort({updateTime: -1})
    //     .skip(parseInt(params.offset) || 0)
    //     .limit(parseInt(params.limit) || 15)
    //     .forEach(t => {
    //         let tasklist = [];
    //         t.tasks.forEach(m => {
    //             let task = Task.find({taskid: m});
    //             tasklist.push(task);
    //         })
    //         t.push(tasklist);
    //     });
    // //上面是通过tasks获得task,然后填到list里。

    // this.body = {
    //     code: 200,
    //     lists: list
    // };

    let temp = new Report({
        status: 1,
        time: 3,
        others:"sdfdsgdfgskd",
        tasks: "1,2,3,3",
        taskhistorys: String,
        userid: this.request.body.userid,
        groupid: 1,
    });

    temp.save();
    let params = this.request.params;
    let reports = [];
    let tempd = yield Report.find({userid: params.userid});
    console.log(temp);
    let list = yield Report.find({userid: params.userid})
    .skip(parseInt(params.offset) || 0)
    .limit(parseInt(params.limit) || 15);
    for(let x=0,k=list.length;x<k;x++){
        let taskArr = list[x].tasks.split(",");
        let tasklist = [];  //存放真正的task列表
        // taskArr.forEach(m =>{
        //     var generator = function*(mm){
        //         let para = yield Task.findById(mm);
        //     };
        //     let taskgenerator = generator(m);
        //     let task = taskgenerator.next();
        
        // });
        for(let i=0,l=taskArr.length;i<l;i++){
            console.log(taskArr[i]);
            //let para = yield Task.find({_id: ObjectId(taskArr[i])});
            let para = yield Task.find({userid: day});
            // let para = yield Task.find({userid: params.userid});
            console.log(para);
        }
        //console.log(tasklist);
        reports.push(list[x]);
    }
    // list.forEach(t => {
    //     let taskArr = t.tasks.split(",");
    //     let tasklist = [];  //存放真正的task列表
    //     // taskArr.forEach(m =>{
    //     //     var generator = function*(mm){
    //     //         let para = yield Task.findById(mm);
    //     //     };
    //     //     let taskgenerator = generator(m);
    //     //     let task = taskgenerator.next();
        
    //     // });
    //     for(let i=0,l=taskArr.length;i<l;i++){
    //         let para = yield Task.find({_id:ObjectId(taskArr[i])});
    //         console.log(para);
    //     }
    //     //console.log(tasklist);
    //     reports.push(t);
    // });
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
    let userid = this.request.params.userid;
    let content = JSON.parse(this.request.body.content);
    let tasks = [];
    let reports = content.report;
    let tempTasks = content.tasks;

    //第一步，写入report表数据
    //1.组织数据




    //let tasks = eval(rData.tasks);
    let rReport = {};
    rReport.status = 1;
    rReport.time = new Date().getTime();
    rReport.others = rData.others;
    rReport.userid = rData.userid;
    rReport.groupid = rData.groupid;
    rReport.tasks = [];
    if(!rData){
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    for(let i=0,l=tasks.length;i<l;i++){
        //let otask =yield Task.find({_id:ObjectId(tasks[i]._id)});
        console.log(tasks[i]._id);
        let otask =yield Task.find({type:"day"});
        console.log(otask);
    }

    // rData.userid = this.state.userid;
    // rData.groupid = this.state.groupId;
    // let rReport = {};
    // rReport.status = 1;
    // rReport.time = new Date().getTime();
    // rReport.others = rData.others;
    // rReport.userid = rData.userid;
    // rReport.groupid = rData.groupid;
    // rReport.tasks = [];
    // if(!rData){
    //     throw new BusinessError(ErrCode.ABSENCE_PARAM);
    // }
    // // *
    // // * 添加日报，调用3表
    // // * reports
    // // * tasks
    // // * taskhistorys
    // // * 
    // rData.tasks.forEach(t => {
    //     let otask = Task.findById(t.taskid);
    //     otask.progress = t.progress;
    //     otask.save();
    //     //history
    //     //todo 不能直接new tasks中的项，因为task和taskhistory数据结构不一样，下面更新相同
    //     let taskhistory = new Taskhistory(t);
    //     taskhistory.save();
    // });
    
    // let oReport = new Report(rReport);
    // yield oReport.save();
    this.body = {
        code: 200,
        data: rData
    };

});
/**
 * 发送日报
 */
router.post('/send', function* () {
    let report = yield Report.findById(this.request.query.id);
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
 */
router.post('/edit', function* () {
    let rData = this.request.params.report;
    //let report = yield Report.findById(this.request.query.id);
    let report = yield Report.findById(rData.id);
    if (!rData || !rData.id) {
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    }
    report.time = rData.time;
    report.others = rData.others;
    /**
    * 更新日报，调用3表
    * reports
    * tasks
    * taskhistorys
    **/ 
    rData.tasks.forEach(t => {
        let otask = Task.findById(t.taskid);
        otask.progress = t.progress;
        otask.save();
        //history
        //todo
        let taskhistory = new Taskhistory(t);
        taskhistory.save();
    });
    let oReport = new Report(rReport);
    yield oReport.save();
    this.body = {
        code: 200
    };
});
/**
 * 删除日报
 */
router.post('/delete',function* () {
    let report = yield Report.findById(this.request.body.id);
    if(report){
        yield Report.update({id:this.request.body.id},{status:3});
        this.body = {
            code: 200
        };
    }

});

router.post('/team/get',function* () {
    let report = yield Report.findById(this.request.query.id);
    if (!report) {
        throw new BusinessError(ErrCode.NOT_FIND);
    }
    report.status = 3;
    yield report.save();
    this.body = {
        code: 200
    };
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