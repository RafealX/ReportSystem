/*
	封装数据层的操作
 */

import _ from 'lodash';
import Backend from 'lib/backend';
import {uuid} from 'lib/util';
import pubsub from 'vanilla-pubsub';
/**
 * 写日报依赖数据
 * @type {[type]}
 */
let UnFinishedTask = null;
let MockUnfinish = function(){
	return _.filter(Mock.progress.my.list,(tab)=>{
		return tab.progress<100 && tab.progress>0 && tab.status==2;
	});
}
let formatter = arr =>{
	let result = [];
	_.each(arr,(itm,idx)=>{
		result.push({
			id:itm.id,
			progress:itm.progress,
			taskname:itm.name,
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
			
			UnFinishedTask = formatter(d.data);
			console.log(UnFinishedTask);
			console.log(d);
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
let editReportId = '';
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
		targettask:'',
		taskname:'',
		question:'',
		summary:'',
		progress:''
	}
};

let TaskObj = {
	time:null,
	list:{
		data:{
			result:[],
			count:0
		},
		limit:10,
		offset:-10
	},
	unfinish:{
		data:{
			result:[],
			count:0
		},
		limit:20,
		offset:-20
	},
	delay:{
		data:{
			result:[],
			count:0
		},
		limit:20,
		offset:-20
	}
};


export let TaskModel={
	get:{
		list:function(limit,offset){
			
			let params = {
				userid:window.user.id,
				limit:limit,
				offset:offset
			}
			TaskObj.list.offset = offset;
			TaskObj.list.limit = limit;
			return Backend.task.get.list(params);
		},
		unfinish:function(limit,offset){
			TaskObj.unfinish.offset+=TaskObj.unfinish.limit;
			let params = {
				userid:window.user.id,
				limit:TaskObj.unfinish.limit,
				offset:TaskObj.unfinish.offset
			}
			return Backend.task.get.unfinish(params);	
		},
		delay:function(){
			TaskObj.delay.offset+=TaskObj.delay.limit;
			let params = {
				userid:window.user.id,
				limit:TaskObj.delay.limit,
				offset:TaskObj.delay.offset
			}
			return Backend.task.get.delay(params);	
		},
		history:function(itm){
			TaskObj.delay.offset+=TaskObj.delay.limit;
			let params = {
				taskid:itm.id
			}
			return Backend.task.get.history(params);	
		}
	},
	getter:{
		list:function(data){
			return TaskObj.list;
		},
		unfinish:function(data){
			return TaskObj.list;
		},
		delay:function(data){
			
		},
	},
	formatter:{
		list:function(data){
			TaskObj.list.data.result = [];
			TaskObj.list.data.result.length = 0;
			TaskObj.list.data.result = data.list;
			TaskObj.list.data.count = data.count;
			return TaskObj.list.data;
		},
		unfinish:function(data){
			
		},
		delay:function(data){
			
		},

	},
	opers:{
		list:{
			delay:function(itm){
				_.each(TaskObj.list.data.result,item=>{
					itm.id==item.id?(item.delayreason = itm.delayreason,item.time=itm.time,item.isdelay=true):'';
				});
			},
			delete:function(itm){
				_.each(TaskObj.list.data.result,item=>{
					itm.id==item.id?(item.status=4):'';
				});
			},
			edit:function(itm){
				_.each(TaskObj.list.data.result,item=>{
					itm.id==item.id?(item.description = itm.description,item.name=itm.name,item.ticket=itm.ticket):'';
				});
			},
			detail:function(itm){
				var history = this.get.history(tm);

			}
			
		},
		delay:{

		},
		unfinish:{

		},

		
	}
}
