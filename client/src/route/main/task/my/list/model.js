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
		data:[],
		limit:20,
		offset:-20
	},
	unfinish:{
		data:[],
		limit:20,
		offset:-20
	},
	delay:{
		data:[],
		limit:20,
		offset:-20
	}
};


export let TaskModel={
	get:{
		list:function(){
			TaskObj.list.offset+=TaskObj.list.limit;
			let params = {
				userid:window.user.id,
				limit:TaskObj.list.limit,
				offset:TaskObj.list.offset
			}
			return Backend.task.get.list(params);
		},
		unfinish:function(){
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
	formatter:{
		list:function(data){
			
		},
		unfinish:function(data){
			
		},
		delay:function(data){
			
		},

	},
	opers:{
		delay:function(itm){

		},
		delete:function(itm){

		},
		edit:function(itm){

		},
		detail:function(itm){
			var history = this.get.history(tm);

		}
	}
}
