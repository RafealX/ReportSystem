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
	first:true,
	offset:5,
	limit:10,
	data:[]
};

export let TeamReport={
	get:function(){
		if(TeamReportObj.first){
			TeamReportObj.offset = 0;	
			TeamReportObj.first = false;
		}
		TeamReportObj.offset += TeamReportObj.limit;
		return Backend.report.team.get({
			groupid:window.user.groupid,
			offset:TeamReportObj.offset
		});
	},
	formatter:function(result){
		console.log(result);
		
		//return tasklist;
		
	},
	operation:{
		get:function(){
			return TeamReportObj.data;
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
