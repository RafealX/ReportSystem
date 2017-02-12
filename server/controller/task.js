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
const logger = require('../lib/logger');
const auth = require('../lib/auth');
const util = require('../lib/util');
const config = require('../config');
const BusinessError = require('../error/BusinessError');
const ErrCode = BusinessError.ErrCode;

/**
 * 获取个人任务列表
 */
router.post('/get/list', auth.mustLogin(), function* () {
	let params = this.request.params;
	let tasklist = yield Task.find({userid: this.state.loginUser.id,status:{"$lte":2}});
	this.body={
		code: 200,
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
    cur+=50;
    if(cur>max)
    	return;
	let users = [
		'hf3f8o4o1hppmdh9n4n4jpdglh6nndlcjfh1dek150icfb9jd',
		'hf3f8o4o1hppmdh9n4n4jpdglh6nndlcjfh1dek6521afb9ja',
        'hf3f8o4o1hppmdh9n4n4jpdglh6nndlcjfh1dek6521afb9ja',
        'hf3f8o4o1hppmdh9n4n4jpdglh6nndlcjfh1dek6521afb9ja',
        'hf3f8o4o1hppmdh9n4n4jpdglh6nndlcjfh1dek6521afb9ja'
	];

	let reasons=[
		'涉及到其他影响',
		'策划新加了其他需求',
		'etcetcetc',
		'这是个fake数据'
	];
    let taskstatus = [
        '1',
        '2',
        '3',
        '4'
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
		var isDelay = Math.floor(Math.random()*10)%2==0?false:true;
		var reason = '';
		if(isDelay){
			reason = reasons[Math.floor(Math.random()*10)%2];
		}
		var id = util.uuid();
		var progress = Mock5();
		let userid = users[Math.floor(Math.random()*10)%5];
		let taskname ="0_0这可能是个假任务"+i;
		let task = new Task({
			id:id,
			userid:userid,
			status:taskstatus[Math.floor(Math.random()*10)%4],
            name: taskname,
			description:"这是描述-_-"+i,
			groupid:1,
            ticket:Math.floor(Math.random()*10)%2?'#125114,#631441':'#8745,#9632',
			totaltime:Math.floor(Math.random()*20),
			progress:progress,
            isdelay: isDelay,
			time:(date.setDate(date.getDate()-i-1),date.getTime()),
			delayreason:reason
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
                status: taskstatus[Math.floor(Math.random()*10)%3],
                time: date.getTime(),
                others: reports[Math.floor(Math.random()*10)%3],
                tasks: reportitmString,
                userid: userid,
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

router.get('/mock',function* () {
    MockTask();
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
	mtask.status = 1;
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
	let taskid = rData.taskid;
	let mtask = yield Task.findOne({id:taskid});
	console.log(mtask);
	let taskparams = {};
	taskparams["$set"] = {

	}
});
/**
 * 删除任务
 */
router.post('/delete', auth.mustLogin(), function* () {});

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

router.get('/history',function* (next) {


});

module.exports = router;