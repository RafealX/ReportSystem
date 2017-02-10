/*
	封装数据层的操作
 */

import _ from 'lodash';
import Backend from 'lib/backend';
import {uuid} from 'lib/util';
import pubsub from 'vanilla-pubsub';
import Mock from 'cpn/Mock';
/**
 * 写日报依赖数据
 * @type {[type]}
 */
let UnFinishedTask = null;
let user = window.user || {name:123,id:19283877};
let MockUnfinish = function(){
	return _.filter(Mock.progress.my.list,(tab)=>{
		return tab.progress<100 && tab.progress>0 && tab.status==2;
	});
}
let formatter = arr =>{
	let result = [];
	_.each(arr,(itm,idx)=>{
		result.push({
			id:idx++,
			progress:itm.progress,
			name:itm.name,
			status:1//表示还没被选
		});
	});
	return result;
}

export let UnFinish = {
	get:function(){
		return UnFinishedTask;
	},
	listen:function(callback){
		pubsub.subscribe('Task.Unfinished.load',callback);
	},
	init:function(){
		Backend.task.get.unfinished(user.id).then(d=>{
			pubsub.publish('Task.Unfinished.load');
		}).catch(e=>{
			UnFinishedTask = formatter(MockUnfinish());
			pubsub.publish('Task.Unfinished.load');
		});
	},
	clear:function(){
		UnFinishedTask = [];
		UnFinishedTask.length = 0;
		UnFinishedTask = null;
	}
}

/**
 * 日报实体相关数据
 * @type {Object}
 */
let fakeid = 1;
let fakeTask = {
	report:{
		content:'',
		ticket:'',
		id:'',
		elapse:null
	},
	task:{
		elapse:null,
		id:'',
		name:'',
		question:'',
		summary:'',
		progress:''
	}
};

let TaskObj = {
	time:null,
	report:[],
	task:[]
};
_.each(TaskObj.report,itm=>{
	itm.status=1;
});
_.each(TaskObj.task,itm=>{
	itm.status=1;
});

export let Report={
	send:function(){
		let result = TaskObj;
		//格式化数据
		let data = {
			time:result.time,
		}
		let report = '';
		_.each(result.report,itm=>{
			report+=itm.content+','+itm.elapse+','+itm.ticket+';';
		});
		report = report.substring(0,report.length-1);
		data.report = report;

		_.each(result.task,itm=>{
			delete result.status;
		});
		data.tasks = result.task;
		//是否要格式化时间
		let sendData = {
			userid:user.id,
			content:JSON.stringify(data)
		}
		
		return Backend.report.add(sendData);
	},
	get:function(){
		return TaskObj;
	},
	set:{
		report:function(data){
			data.status=1;
			fakeid++;
			data.id = fakeid;
			TaskObj.report.unshift(data);
		},
		task:function(data){
			data.status=1;
			TaskObj.task.unshift(data);
		}
	},
	delete:{
		report:function(data){
			_.remove(TaskObj.report,(itm)=>{return data.id==itm.id});
		},
		task:function(data){
			_.remove(TaskObj.task,(itm)=>{return data.id==itm.id});
		}
	},
	clear:function(){
		TaskObj.report = [];
		TaskObj.report.length = 0;
		TaskObj.task = [];
		TaskObj.task.length = 0;
		TaskObj.time = null;
	},
	fake:{
		report:function(){
			let result = _.clone(fakeTask.report,true);
			result.id = uuid();
			return result;
		},
		task:function(){
			return _.clone(fakeTask.task,true);
		},
	},
	//被编辑调起
	init:{
		edit:function(data,cb){
			//需要初始化数据并且对Unfinished数据进行操作，基本是要等待Unfinished载入完成才能做动作的。
			let callback = function(){
				TaskObj.report = data.reports || [];
				TaskObj.task = data.tasks || [];
				TaskObj.time = data.time || null;
				_.each(TaskObj.report,itm=>{
					itm.status=1;
				});
				_.each(TaskObj.task,itm=>{
					itm.status=1;
					_.each(UnFinish.get(),item=>{
						item.id==itm.id?item.status=0:'';
					})
				});
				if(_.isFunction(cb)){
					cb();
				}
			}
			if(!UnFinishedTask){
				UnFinish.listen(callback);
			}else{
				callback();
			}
		},
		
	}
}
