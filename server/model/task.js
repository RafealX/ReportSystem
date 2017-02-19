/**
 * 任务
 */
'use strict';
let helper = require('./helper');
const util = require('../lib/util');
let schema = helper.schema({
	status: {type:Number,default:2},
	name: String,
	userid: String,
	groupid: Number,
	ticket: String,
	progress: {type:Number,default:0},
	id: {type:String,default:util.uuid},
	totaltime: Number,
    description: {type:String,default:''},
    time: {type:Number,default:0},
	isdelay: {type:Boolean,defaule:false},
	delayreason: {type:String,default:''},
	delaycount:{type:Number,default:0}
}, {collection:'Task'});

module.exports = helper.model('Task', schema);