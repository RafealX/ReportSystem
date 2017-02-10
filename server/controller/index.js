/**
 * api controller
 */

'use strict';
const router = require('koa-router')({prefix: '/api'});
const userController = require('./user');
const groupController = require('./group');
const teamController = require('./team');
const reportController = require('./report');
const roleController = require("./role");
const auth = require("../lib/auth.js");

module.exports.initialize = function (app) {
    router.use(userController.routes());
    router.use(groupController.routes());
    router.use(teamController.routes());
    router.use(reportController.routes());
    router.use(roleController.routes());
    app.use(function* (next){
        var path = this.path;
        yield next;
    });
    app.use(router.routes());
};