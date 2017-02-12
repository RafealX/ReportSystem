/**
 * 任务历史
 */
'use strict';
const _ = require('lodash');
const router = require('koa-router')({prefix: '/taskhistory'});
const User = require('../model/user');
const Group = require('../model/group');
const Report = require('../model/report');
const Task = require('../model/task');
const TaskHistory = require('../model/taskhistory');
const logger = require('../lib/logger');
const auth = require('../lib/auth');
const util = require('../lib/util');
const config = require('../config');
const BusinessError = require('../error/BusinessError');
const ErrCode = BusinessError.ErrCode;

/**
 * 获取任务历史
 * taskid
 * limit
 * offset
 */
router.post('/get', auth.mustLogin(), function* () {
	let params = this.request.params;
	let TaskHistory = yield TaskHistory.find({taskid: params.taskid})
	.skip(parseInt(params.offset) || 0)
    .limit(parseInt(params.limit) || 15);
	this.body={
		code: 200,
		taskhistory: TaskHistory
	};
});


module.exports = router;