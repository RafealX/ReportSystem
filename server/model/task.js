/**
 * 任务
 */
'use strict';
let helper = require('./helper');
let schema = helper.schema({
	status: Number,
	name: String,
	userid: String,
	groupid: Number,
	ticket: String,
	progress: Number,
	_id: String,
	totaltime: Number,
	isdelay: Boolean,
	delayreason: String
}, {});

schema.set('collection', 'tasks');
module.exports = helper.model('Task', schema);