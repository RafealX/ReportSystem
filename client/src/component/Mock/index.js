/**
 * Mock数据集合
 * @type {Object}
 */

//个人日报
let myTask = {
	"code": 200,
	"list": [{
		//日报时间，作为title用
		time:'2017-01-18T12:36:39.387Z',
		//日报内容
		report:'今天完成了啥啥啥内容,3,#98652;研究了react,5,;做完了日志系统,6,#98541',
		//日报状态 1未发送 2已发送 3已删除
		status:1,
		tasks:[{
			name:'完成D3.js集成',
			progress:65,
			elapse:3,
			question:'兼容性哟普问题,是不是改变方向？;有些API表现形式怪异，不合预期',
			summary:'这个是个坑',
			totaltime:4
		},{
			name:'完成D3.js集成',
			progress:30,
			elapse:2,
			totaltime:5,
			question:'兼容性哟普问题,是不是改变方向？;有些API表现形式怪异，不合预期',
			summary:'这个是个坑',
			totaltime:4
		}],
		"userId": "58442c1ac32a8d204e44cd89",
		"id": "587f6157ae2f814e9feac2c7"
	}, {
		//日报时间，作为title用
		time:'2017-01-17T12:36:39.387Z',
		//日报内容
		report:'今天完成了啥啥啥内容,3,#98652;研究了react,5,;做完了日志系统,6,#98541',
		//日报状态
		status:2,
		tasks:[{
			name:'完成D3.js集成',
			progress:65,
			elapse:3,
			question:'兼容性哟普问题,是不是改变方向？;有些API表现形式怪异，不合预期',
			summary:'这个是个坑',
			totaltime:4
		},{
			name:'完成D3.js集成',
			progress:30,
			elapse:2,
			totaltime:5,
			question:'兼容性哟普问题,是不是改变方向？;有些API表现形式怪异，不合预期',
			summary:'这个是个坑',
			totaltime:4
		}],
		"userId": "58442c1ac32a8d204e44cd89",
		"id": "587f6157ae2f814e9feac2c7"
	}, {
		//日报时间，作为title用
		time:'2017-01-12T12:36:39.387Z',
		//日报内容
		report:'今天完成了啥啥啥内容,3,#98652;研究了react,5,;做完了日志系统,6,#98541',
		//日报状态
		status:3,
		tasks:[{
			name:'完成D3.js集成',
			progress:65,
			elapse:3,
			question:'兼容性哟普问题,是不是改变方向？;有些API表现形式怪异，不合预期',
			summary:'这个是个坑',
			totaltime:4
		},{
			name:'完成D3.js集成',
			progress:30,
			totaltime:5,
			elapse:2,
			question:'兼容性哟普问题,是不是改变方向？;有些API表现形式怪异，不合预期',
			summary:'这个是个坑',
			totaltime:4
		}],
		"userId": "58442c1ac32a8d204e44cd89",
		"id": "587f6157ae2f814e9feac2c7"
	}, {
		//日报时间，作为title用
		time:'2017-01-14T12:36:39.387Z',
		//日报内容
		report:'今天完成了啥啥啥内容,3,#98652;研究了react,5,;做完了日志系统,6,#98541',
		//日报状态
		status:2,
		tasks:[{
			name:'完成D3.js集成',
			progress:65,
			elapse:3,

			question:'兼容性哟普问题,是不是改变方向？;有些API表现形式怪异，不合预期',
			summary:'这个是个坑',
			totaltime:4
		},{
			name:'完成D3.js集成',
			progress:30,
			elapse:2,
			totaltime:5,
			question:'兼容性哟普问题,是不是改变方向？;有些API表现形式怪异，不合预期',
			summary:'这个是个坑',
			totaltime:4
		}],
		"userId": "58442c1ac32a8d204e44cd89",
		"id": "587f6157ae2f814e9feac2c7"
	}]
};

myTask.list = myTask.list.sort((x,y)=>{
	console.log(new Date(x.time)-new Date(y.time));
	return new Date(y.time)-new Date(x.time);
});
console.log(myTask.list);

//小组日报
let teamTask = {

};

let myProgress = {
	"code": 200,
	"count":70,
	"list": [{
		name:'任务一',
		isdelay:false,
		delayreason:'',
		progress:45,
		totaltime:4,
		time:'2016-7-15',
		status:1,
		ticket:'#98545,#65412',
		description:'兼容D3.js',
	},{
		name:'任务二',
		progress:12,
		totaltime:4,
		ticket:'#98545,#65412',
		description:'兼容D3.js',
		time:'2016-7-15',
		status:1,
		isdelay:true,
		delayreason:'在IE下表现特别诡异，难以处理'
	},{
		name:'任务三',
		progress:100,
		totaltime:7,
		ticket:'#98545,#65412',
		description:'兼容D3.js',
		time:'2016-7-18',
		status:3,
		isdelay:false,
		delayreason:''
	},{
		name:'任务四',
		progress:65,
		totaltime:4,
		ticket:'#98545,#65412',
		description:'兼容D3.js',
		time:'2016-8-22',
		status:1,
		isdelay:true,
		delayreason:'在IE下表现特别诡异，难以处理'
	},{
		name:'任务五',
		progress:33,
		totaltime:4,
		ticket:'#98545,#65412',
		description:'兼容D4.js',
		time:'2016-7-15',
		status:2,
		isdelay:false,
		delayreason:''
	},{
		name:'任务六',
		progress:100,
		totaltime:4,
		ticket:'#98545,#65412',
		description:'兼容WebGL啊',
		time:'2016-12-25',
		status:4,
		isdelay:true,
		delayreason:'延期了啊'
	},{
		name:'任务七',
		progress:22,
		totaltime:4,
		ticket:'#98545,#65412',
		description:'兼容D3.js',
		time:'2016-7-15',
		status:2,
		isdelay:true,
		delayreason:'这是任务器'
	}]
};
for(let i=0;i<2;i++){
	myProgress.list = myProgress.list.concat(_.clone(myProgress.list,true));	
}

myProgress.list.forEach(function(itm,idx){
	itm.id = idx+1;
});
console.log(myProgress.list);

let taskHistory = {
	taskid:1,
	historys:[{
		time:'2017-1-1',
		elapse:4,
		summary:'做了水水水水的',
		question:'碰到了这个问题',

	},{
		time:'2016-12-30',
		elapse:2,
		summary:'做了水水水水的',
		question:'碰到了这个问题',

	},{
		time:'2016-10-2',
		elapse:8,
		summary:'做了水水水水的',
		question:'碰到了这个问题',

	}]
}
let Result = {
	task:{
		my:myTask,
		team:teamTask,

	},
	progress:{
		my:myProgress,
		history:taskHistory
	}
}
export default Result;