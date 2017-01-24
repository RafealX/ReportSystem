/**
 * 日报
 */
'use strict';
const _ = require('lodash');
const router = require('koa-router')({prefix: '/task'});
const User = require('../model/user');
const Group = require('../model/group');
const Report = require('../model/report');
const logger = require('../lib/logger');
const auth = require('../lib/auth');
const util = require('../lib/util');
const config = require('../config');
const BusinessError = require('../error/BusinessError');
const ErrCode = BusinessError.ErrCode;

/**
 * 获取个人任务列表
 */
router.post('/get', auth.mustLogin(), function* () {});
 /**
 * 添加任务
 */   
router.post('/add', auth.mustLogin(), function* () {});
/**
 * 编辑、修改任务
 */
router.post('/edit', auth.mustLogin(), function* () {});
/**
 * 删除任务
 */
router.post('/delete', auth.mustLogin(), function* () {});

module.exports = router;