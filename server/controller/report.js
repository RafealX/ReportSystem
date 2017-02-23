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
const DelayHistory = require('../model/delayhistory');
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
        let taskid = taskhistorylist[i].taskid;
        let targetTask = yield Task.findOne({id:taskid});
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
        }
        let targetTaskObject = targetTask.toObject();

        var taskparams = {};
        if(!isNaN(taskhistorylist[i].elapse*1) && taskhistorylist[i].elapse*1>0){
            taskparams['$inc']={
                totaltime:taskhistorylist[i].elapse*1
            }
        }
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
        mtaskhistory.progress = taskhistorylist[i].progress;
        if(targetTaskObject.progress==taskhistorylist[i].progress){
            mtaskhistory.content='';
            mtaskhistory.startprogress = taskhistorylist[i].progress;
        }
        else{
            taskparams['$set'] = {
                progress:taskhistorylist[i].progress
            };
            mtaskhistory.content = taskhistorylist[i].content;
            mtaskhistory.startprogress = targetTaskObject.progress;
        }
        let taskhistory = new Taskhistory(mtaskhistory);
        yield taskhistory.save();

        //task
        //证明延期了！
        if(targetTaskObject.endtime!=taskhistorylist[i].tasktime){
            taskparams = {};
            taskparams['$set'] = {
                endtime:taskhistorylist[i].tasktime
            };
            let delayparams = {};
            delayparams.taskid = taskid;
            delayparams.userid = rData.userid;
            delayparams.groupid = rData.groupid;
            delayparams.sourcetime = targetTaskObject.endtime;
            delayparams.targettime = taskhistorylist[i].tasktime;
            delayparams.reason = '';//Todo 增加reason字段
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
    let reporttaskids = "";
    let taskhistorylist = JSON.parse(rData.taskhistorylist);

    /*add日报
     调用3表
     task
     taskhistorylist
     report*/
    /*for(var i=0,l=taskhistorylist.length;i<l;i++){
        let taskid = taskhistorylist[i].targettask;

        //task
        var taskparams = {};
        taskparams['$set'] = {
            progress:taskhistorylist[i].progress
        };
        if(!isNaN(taskhistorylist[i].elapse*1))
            taskparams['$inc']={
                totaltime:taskhistorylist[i].elapse
            }
        let mtask = yield Task.update({id:taskid},taskparams);

        console.log(mtask);
        //taskhistory
        let mtaskhistory = {};
        mtaskhistory.id = taskhistorylist[i].id;
        if(!taskhistorylist[i].id){
            //说明是编辑里新增的记录
            let newTask = new Taskhistory({
                targettask: taskid,
                taskname:taskhistorylist[i].taskname,
                elapse: taskhistorylist[i].elapse*1,    //耗时
                question: taskhistorylist[i].question,
                content: taskhistorylist[i].content,
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
                content : taskhistorylist[i].content,
                progress : taskhistorylist[i].progress
            };
            yield Taskhistory.update({id:taskhistorylist[i].id},params);
        }

        /!*mtaskhistory.targettask = taskhistorylist[i].targettask;
        mtaskhistory.elapse = taskhistorylist[i].elapse;
        mtaskhistory.question = taskhistorylist[i].questioin;
        mtaskhistory.summary = taskhistorylist[i].summary;
        time = new Date().getTime();
        mtaskhistory.progress = taskhistorylist[i].progress;
        let taskhistory = new Taskhistory(mtaskhistory);
        yield taskhistory.save();*!/
    }
    */
    for(var i=0,l=taskhistorylist.length;i<l;i++){
        let taskid = taskhistorylist[i].taskid;
        let targetTask = yield Task.findOne({id:taskid});
        var taskparams = {},targetTaskObject;
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
            mtaskhistory.progress = taskhistorylist[i].progress;
            if(targetTaskObject.progress==taskhistorylist[i].progress){
                mtaskhistory.content='';
                mtaskhistory.startprogress = targetTaskObject.progress;
            }
            else{
                taskparams['$set'] = {
                    progress:taskhistorylist[i].progress
                };
                mtaskhistory.content = taskhistorylist[i].content;
                mtaskhistory.startprogress = targetTaskObject.progress;
            }
            let taskhistory = new Taskhistory(mtaskhistory);
            yield taskhistory.save();
        }else{
            mtaskhistoryid = taskhistorylist[i].id;
            reporttaskids+=mtaskhistoryid+',';
            let taskhistory = yield Taskhistory.findOne({id:taskhistorylist[i].id});
            targetTaskObject = targetTask.toObject();
            let taskhistoryObject = taskhistory.toObject();
            targetTaskObject.totaltime-=taskhistoryObject.elapse;
            var taskhistoryparams = {};

            taskhistoryparams['$set']={
                content:taskhistorylist[i].content,
                progress:taskhistorylist[i].progress,
                elapse:taskhistorylist[i].elapse
            }

            if(targetTaskObject.progress*1!=taskhistorylist[i].progress*1){
                taskparams['$set'] = {
                    progress:taskhistorylist[i].progress*1
                };
            }
            //判断progress，elapse
            yield Taskhistory.update({id:taskhistorylist[i].id},taskhistoryparams);

        }



        if(!isNaN(taskhistorylist[i].elapse*1) && taskhistorylist[i].elapse*1>0){
            taskparams['$inc']={
                totaltime:taskhistorylist[i].elapse*1
            }
        }


        //task
        //
        if(targetTaskObject.endtime!=taskhistorylist[i].tasktime){
            /*if(target){
                taskparams = {};
                taskparams['$set'] = {
                    endtime:taskhistorylist[i].tasktime
                };
                let delayparams = {};
                delayparams.taskid = taskid;
                delayparams.userid = rData.userid;
                delayparams.groupid = rData.groupid;
                delayparams.sourcetime = targetTaskObject.endtime;
                delayparams.targettime = taskhistorylist[i].tasktime;
                delayparams.reason = '';//Todo 增加reason字段
                delayparams.taskhistoryid=mtaskhistoryid;
                let delayhistory = new DelayHistory(delayparams);
                yield delayhistory.save();
            }*/


        }else{

        }
        yield Task.update({id:taskid},taskparams);

    }
    reporttaskids = reporttaskids.substring(0,reporttaskids.length-1);



    //report
    let reportid = rData.reportid;
    var params = {};
    params["$set"] = {
        time:rData.time,
        tasks:reporttaskids,
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
    /*for(var i=0,l=taskhistorylist.length;i<l;i++){
        let taskid = taskhistorylist[i];
        let mtaskhistory = yield Taskhistory.findOne({id: taskid});
        let targettask = mtaskhistory.targettask;
        let mtask = yield  Task.findOne({id: targettask});
        //mtask.totaltime -= mtaskhistory.elapse;
        //if(mtask.totaltime<0)mtask.totaltime = 0;
        yield mtaskhistory.remove();
        let mtaskhistorys = yield Taskhistory.findOne({id:taskid});
        if(mtaskhistorys){
            mtask.progress = mtaskhistorys.progress;
        }
        mtask?yield  mtask.save():'';

    }*/

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
    let list = yield Report.find({groupid: params.groupid,status:{"$ne":3}}).sort({"time":-1});
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

module.exports = router;