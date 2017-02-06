/**
 * api controller
 */
'use strict';
const router = require('koa-router')({prefix: '/api'});
const userController = require('./user');
const groupController = require('./group');
const teamController = require('./team');
const reportController = require('./report');

module.exports.initialize = function (app) {
	router.use('/',  function*(){
		console.log(this.request);
		
	});
    router.use(userController.routes());
    router.use(groupController.routes());
    router.use(teamController.routes());
    router.use(reportController.routes());
    app.use(router.routes());
};