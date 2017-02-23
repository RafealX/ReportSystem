/**
 * 任务
 */
'use strict';
const _ = require('lodash');
const router = require('koa-router')({prefix: '/task'});
const User = require('../model/user');
const Group = require('../model/group');
const Report = require('../model/report');
const Task = require('../model/task');
const TaskHistory = require('../model/taskhistory');
const TaskDelayHistory = require('../model/delayhistory');
const logger = require('../lib/logger');
const auth = require('../lib/auth');
const util = require('../lib/util');
const config = require('../config');
const BusinessError = require('../error/BusinessError');
const ErrCode = BusinessError.ErrCode;

/**
 * 获取个人任务列表
 * limit
 * offset
 */
router.post('/get/list', auth.mustLogin(), function* () {
    let params = this.request.params;
    let taskalllist = yield Task.find({userid: this.state.loginUser.id});
    let count = taskalllist.length;
    let tasklist = yield Task.find({userid: this.state.loginUser.id})
        .skip(parseInt(params.offset) || 0)
        .limit(parseInt(params.limit) || 15);
    this.body={
        code: 200,
        count:count,
        list: tasklist
    };
});

let i = 0;
let max = 1000;
let cur = 0;
let Mock5 = function () {
	let i = parseInt(Math.random()*99 + 1);
	while(i%5!=0){
        i = parseInt(Math.random()*99 + 1);
	}
	return i;
}
let MockTask = function () {
    cur+=80;
    if(cur>max)
    	return;
	let users = [
		'hf3f8o4o1hppmdh9n4n4jpdglh6nndlcjfh1dek6521afb9ja',
        'hf3f8o4o1hppmdh9n4n4jpdglh6nndlcjfh1dek6521afb9ja',
        'hf3f8o4o1hppmdh9n4n4jpdglh6nndlcjfh1dek6521afb9ja',
		'hf3fdsffd231dh9n4n4jpdglh6nndlcjfh1dek6521afb9ja',
		'hf3fdsffd231dh9n4n4jpdglh6nndlcjfh1dek6521afb9ja',
        'hf3fdsffd231dh9n4n4jpdglh6nndlcjfh1dek6521afb9ja'
	];

    let usersnames = [
    	'项方念',
        '项方念',
        '项方念',
        '曹偲',
        '曹偲',
        '曹偲',
    ];

	let reasons=[
		'涉及到其他影响',
		'策划新加了其他需求',
		'etcetcetc',
		'这是个fake数据'
	];
    let reportstatus = [
        2,
		2,
        3,
    ];
    let taskstatus = [
        3,
        3,
        3,
        3,
        3,
        4
    ];

    let reports = [
        '今天完成了啥啥啥内容,3,#98652;研究了react,5,;做完了日志系统,6,#98541',
        '今天完成了啥啥啥内容,3,#98652;研究了react,5,;做完了日志系统,6,#98541',
        '今天完成了啥啥啥内容,3,#98652;研究了react,5,;做完了日志系统,6,#98541'
	]

    let reportstaskitems = [];

	for(;i<cur;i++){
        let date = new Date();
        date = new Date(date.toLocaleDateString());
		var isDelay = false;//Math.floor(Math.random()*10)%2==0?false:true;
		var reason = '';
		if(isDelay){
			reason = reasons[Math.floor(Math.random()*10)%2];
		}
		var id = util.uuid();
		var progress = Mock5();
		let userradom = Math.floor(Math.random()*100)%12;
		let userid = users[userradom];
		let username = usersnames[userradom];
		let taskname ="0_0这可能是个假任务"+i;
		let task = new Task({
			id:id,
			userid:userid,
			status:3,
            name: taskname,
			description:"这是描述-_-"+i,
			groupid:1,
            ticket:Math.floor(Math.random()*10)%2?'#125114,#631441':'#8745,#9632',
			totaltime:Math.floor(Math.random()*20),
			progress:progress,
            isdelay: false,
			time:(date.setDate(date.getDate()-i-1),date.getTime()),
			delayCount:0,
			delayreason:''
		});

        /*let newDate = new Date(date);
        var taskhistory = [];
        for(let j=5;j>0;j--){
            let hisid = util.uuid();
            let history = new TaskHistory({
                id:hisid,
                targettask:id,
                elapse: Math.floor(Math.random()*10),
                question: '遇到了下面的问题',
                summary: '简单总结下',
                time: date.setDate(newDate.getDate()-j),
                progress:parseInt(progress/j),
            });
            history.save();
            taskhistory.push(id);
        }*/
		let taskhistory = MockTaskHistoty(id,date,progress,taskname);
		if(reportstaskitems.length==3){
			let reportitmString = '';
			reportstaskitems.forEach(itm=>{
                reportitmString+=itm+',';
			})
			reportitmString = reportitmString.substring(0,reportitmString.length-1);
			let report = new Report({
                status: reportstatus[Math.floor(Math.random()*10)%3],
                time: date.getTime(),
                others: reports[Math.floor(Math.random()*10)%3],
                tasks: reportitmString,
                userid: userid,
				username:username,
                groupid: 1
			});
			report.save();
            reportstaskitems = [];
            reportstaskitems.length = 0;
		}else{
            reportstaskitems.push(taskhistory[0]);
		}


		task.save();


	}
}

let MockTaskHistoty = function (taskid,currentDay,progress,taskname) {
	let date = currentDay;
	var taskhistory = [];
	for(let j=5;j>0;j--){
        progress-5>0?(progress-=5):'';
		let id = util.uuid();
        let history = new TaskHistory({
            id:id,
            targettask:taskid,
			taskname:taskname,
            elapse: Math.floor(Math.random()*10),
            question: '遇到了下面的问题',
            summary: '简单总结下',
            time: (date.setDate(date.getDate()-j),date.getTime()),
            progress:progress,
		});
		history.save();
		taskhistory.push(id);
	}
	return taskhistory;
};

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

let MakeOptions = function* () {
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
    let users = yield User.find({});
    if(users.length>0){
        for(var i=1;i<users.length;i++){
            let user = users[i].toObject();
            if(user){
                let ops = _.clone(option,true);
                ops.userid = user.id;
                ops.username = user.name;
                ops.groupid = user.groupid;
                arrs.push(ops);
            }
        }
    }
	var options = [{
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
		},
		userid:'hf3f8o4o1hppmdh9n4n4jpdglh6nndlcjfh1dek6521afb9ja',
		username:'项方念',
		groupid:1,
	},{
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
        },
        userid:'hf3fdsffd231dh9n4n4jpdglh6nndlcjfh1dek6521afb9ja',
        username:'曹偲',
        groupid:1,
    },{
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
        },
        userid:'hf3f8o4dsdfdfa4jpdglh6nndlcjfh1dek150icfb9jd',
        username:'郑海波',
        groupid:1,
    }];
	return arrs;
}
router.get('/mock',function* () {
    yield Report.remove({});
    yield Task.remove({});
    yield TaskHistory.remove({});
    yield TaskDelayHistory.remove({});
    var options = yield MakeOptions();
    /*options.forEach(itm=>{
        Mock(itm);
    })*/

    this.body = {
        code:200
    };
    return ;
})


 /**
 * 添加任务
  * para   name
  * para   ticket
  * para   totaltime
  * para   description
 */   
router.post('/add',auth.mustLogin(), function* () {
	let rData = this.request.params;
	let mtask = {};
	if(!rData){
		throw new BusinessError(ErrCode.ABSENCE_PARAM);
	};
	mtask.status = 2;
	mtask.userid = this.state.loginUser.id;
	mtask.groupid = this.state.loginUser.groupid;
	mtask.time = rData.time;
    mtask.isdelay = false;
    mtask.delayreason = '';
    mtask.name = rData.name;
    mtask.ticket = rData.ticket;
    mtask.totaltime = 0;
	mtask.description = rData.description;
	mtask.progress = 0;
    let task = new Task(mtask);
    yield task.save();

	this.body = {
		code:200,
		task: task
	};
});
/**
 * 编辑、修改任务
 * taskid
 * name
 * description
 */
router.post('/edit', auth.mustLogin(), function* () {
	let rData = this.request.params;
	let taskid = rData.id;
	let taskparams = {};
	taskparams["$set"] = {
		name: rData.name,
		description: rData.description,
        status: rData.status,
        userid: rData.userid,
        groupid: rData.groupid,
        ticket: rData.ticket,
        progress: rData.progress,
        totaltime: rData.totaltime,
        time: rData.time,
        isdelay:  rData.isdelay,
        delayreason: rData.delayreason
	}
    let mtask = yield Task.update({id:taskid},taskparams);
	this.body = {
		code: 200
	}
});
/**
 * 删除任务
 * taskid
 */
router.post('/delete', auth.mustLogin(), function* () {
	let rData = this.request.params;
	let taskid = rData.taskid;
	let mtask = yield Task.findOne({id: taskid});
	mtask.status = 4;
	yield mtask.save();
	this.body = {
		code: 200,
		task: mtask
	}
});

router.get('/get/unfinished',auth.mustLogin(), function* (next) {
    let rData = this.request.params;
    let mtask = {};
    if(!rData){
        throw new BusinessError(ErrCode.ABSENCE_PARAM);
    };
    let unfinish = yield Task.where({userid:rData.userid,status:2})
						.where('progress').lt(100);
    let result = [];
    unfinish.forEach(itm=>{
    	result.push(itm.toObject());
	})
    console.log(unfinish);
	this.body = {
		code:200,
		data:result
	}
});

router.get('/history',auth.mustLogin(),function* (next) {

});

module.exports = router;