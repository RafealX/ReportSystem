/**
 * Mock数据集合
 * @type {Object}
 */

, Ta//个人日报
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

let Result = {
	task:{
		my:myTask,
		team:teamTask
	}
}
export default Result;