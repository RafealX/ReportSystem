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
router.post('/get', auth.mustLogin(), function* () {
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
let MockTask = function () {
    cur+=50;
    if(cur>max)
    	return;
	let users = [
		'hf3f8o4o1hppmdh9n4n4jpdglh6nndlcjfh1dek150icfb9jd',
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
        let date = new Date;
		var isDelay = Math.floor(Math.random()*10)%2==0?false:true;
		var reason = '';
		if(isDelay){
			reason = reasons[Math.floor(Math.random()*10)%2];
		}
		var id = util.uuid();
		var progress = parseInt(Math.random()*99 + 1);
		let userid = users[Math.floor(Math.random()*10)%2];
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
			time:date.setDate(date.getDate()-i-1),
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
                time: date,
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
		let id = util.uuid();
        let history = new TaskHistory({
            id:id,
            targettask:taskid,
			taskname:taskname,
            elapse: Math.floor(Math.random()*10),
            question: '遇到了下面的问题',
            summary: '简单总结下',
            time: date.setDate(date.getDate()-j),
            progress:parseInt(progress/j),
		});
		history.save();
		taskhistory.push(id);
	}
	return taskhistory;
};


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
	mtask.time = new Date().getTime();
    mtask.isdelay = false;
    mtask.delayreason = '';
    mtask.name = rData.name;
    mtask.ticket = rData.ticket;
    mtask.totaltime = rData.totaltime;
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
 */
router.post('/edit', auth.mustLogin(), function* () {});
/**
 * 删除任务
 */
router.post('/delete', auth.mustLogin(), function* () {});

router.get('/history',function* (next) {


});

module.exports = router;