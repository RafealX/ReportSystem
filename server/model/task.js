/**
 * 任务
 */
'use strict';
let helper = require('./helper');
const util = require('../lib/util');
let schema = helper.schema({
	status: Number,
	name: String,
	userid: String,
	groupid: Number,
	ticket: String,
	progress: {type:Number,default:0},
	id: {type:String,default:util.uuid},
	totaltime: Number,
    description: {type:String,default:''},
    time:Date,
	isdelay: {type:Boolean,defaule:false},
	delayreason: {type:String,default:''}
}, {collection:'Task'});

module.exports = helper.model('Task', schema);