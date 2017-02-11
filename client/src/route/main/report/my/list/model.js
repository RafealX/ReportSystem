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
let ReportObj = {
	offset:-2,
	limit:2,
	data:[]
};

export let Report={
	get:function(){
		ReportObj.offset+=ReportObj.limit;
		return Backend.report.get({
			userid:window.user.id,
			limit:ReportObj.limit,
			offset:ReportObj.offset
		});
	},
	formatter:function(result){
		console.log(result);
		let tasklist = [];
		if(_.isArray(result) && result.length>0){
			
			tasklist= _.map(result,(itm)=>{
			    let arr;
			    itm.time = new Date(itm.time);
			    if(itm.others){
			        arr = itm.others.split(';');
			        if(_.isArray(arr) && arr.length>0){
			            itm.reports = [];
			            _.each(arr,(item)=>{
			                let reportitm = item.split(','),tmp;
			                 tmp= {
			                    content:reportitm[0],
			                    elapse:reportitm[1]*1,
			                    ticket:reportitm[2]
			                };
			                itm.reports.push(tmp);
			            })
			        }
			    }
			    return itm;
			});
			ReportObj.data = ReportObj.data.concat(tasklist);
			ReportObj.data = ReportObj.data.sort((x,y)=>{
				return y.time-x.time;
			});

		}
		return tasklist;
		
	},
	operation:{
		get:function(){
			return ReportObj.data;
		},
		delete:function(item){
			_.each(ReportObj.data,itm=>{
				item.id==itm.id?(item.status=3):'';
			})
		},
		update:function(item){
			_.each(ReportObj.data,itm=>{
				item.id==itm.id?(item.status=2):'';
			})
		}
	},
	set:{
		limit:function(data){
			_.isNumber(data)?(ReportObj.limit=data):'';
		}
	},
	reset:function(){
		ReportObj.offset = ReportObj.limit*-1;
		ReportObj.data = [];
		ReportObj.data.length = [];
	}
}
