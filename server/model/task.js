/**
 * 任务
 */
'use strict';
let helper = require('./helper');
const util = require('../lib/util');
let schema = helper.schema({
	status: {type:Number,default:2},
	name: String,//任务名
	userid: String,
	username:String,
	groupid: String,
	ticket: {type:String,default:''},//任务关联ticket
	progress: {type:Number,default:0},
	id: {type:String,default:util.uuid},
	totaltime: {type:Number,default:0},//任务总耗时
    description: {type:String,default:''},//任务目的
    starttime: {type:Number,default:0},//任务创建时间
	endtime: {type:Number,default:0},//任务截止时间
	delaycount:{type:Number,default:0}//延期次数
}, {collection:'Task'});

module.exports = helper.model('Task', schema);