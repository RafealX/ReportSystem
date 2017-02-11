/*
	封装数据层的操作
 */

import _ from 'lodash';
import Backend from 'lib/backend';
import {uuid} from 'lib/util';
import pubsub from 'vanilla-pubsub';

/**
 * 日报实体相关数据
 * @type {Object}
 */
let TeamReportObj = {
	offset:-2,
	limit:2,
	data:[]
};

export let TeamReport={
	get:function(){
		TeamReportObj.offset+=TeamReportObj.limit;
		return Backend.report.team.get({
			groupid:window.user.groupid,
			limit:TeamReportObj.limit,
			offset:TeamReportObj.offset
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
			TeamReportObj.data = TeamReportObj.data.concat(tasklist);
			TeamReportObj.data = TeamReportObj.data.sort((x,y)=>{
				return y.time-x.time;
			});

		}
		return tasklist;
		
	},
	operation:{
		get:function(){
			return TeamReportObj.data;
		},
		delete:function(item){
			_.each(TeamReportObj.data,itm=>{
				item.id==itm.id?(item.status=3):'';
			})
		},
		update:function(item){
			_.each(TeamReportObj.data,itm=>{
				item.id==itm.id?(item.status=2):'';
			})
		}
	},
	set:{
		limit:function(data){
			_.isNumber(data)?(TeamReportObj.limit=data):'';
		}
	},
	reset:function(){
		TeamReportObj.offset = TeamReportObj.limit*-1;
		TeamReportObj.data = [];
		TeamReportObj.data.length = [];
	}
}
