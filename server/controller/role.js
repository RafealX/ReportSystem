'use strict';
const _ = require('lodash');
const router = require('koa-router')({prefix: '/role'});
const User = require('../model/user');
const Group = require('../model/group');
const logger = require('../lib/logger');
const auth = require('../lib/auth');
const util = require('../lib/util');
const BusinessError = require('../error/BusinessError');
const ErrCode = BusinessError.ErrCode;

/**
 * 设置权限
 */   
router.post('/set', auth.mustLogin(), function* () {};

module.exports = router;