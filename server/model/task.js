/**
 * 任务
 */
'use strict';
let helper = require('./helper');
let schema = helper.schema({
	status: Number,
	userid: Number,
	groupid: Number,
	ticket: String,
	progress: Number,
	id: Number,
	totaltime: Number,
	isdelay: Boolean,
	delayreason: String
}, {});

schema.set('collection', 'tasks');
module.exports = helper.model('Task', schema);