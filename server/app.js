/**
 * server 入口
 */
 
'use strict';
const bodyParser = require('koa-bodyparser');
const mongoose = require('mongoose');
const Koa = require('koa');
const app = new Koa();
const auth = require('./lib/auth');
const controller = require('./controller');
const config = require('./config');
const logger = require('./lib/logger');
const paramsMiddleware = require('./middleware/params');
const apiMiddleware = require('./middleware/api');
const render = require('koa-ejs');
const path = require('path');
console.log(encodeURI('http://'));
app.proxy = true;

app.use(bodyParser());
app.use(paramsMiddleware());
app.use(auth.resolveUser());
app.use(apiMiddleware.errorToJson());
render(app, {
    root: path.join(__dirname, 'view'),
    viewExt: 'html',
    layout: false,
    cache: false
});

controller.initialize(app);

mongoose.connect(config.db.url);

mongoose.connection.once('open', function () {
    logger.info('Mongo opened');
    app.listen(config.server.listenPort, () => logger.info('Server listening on', config.server.listenPort));
});

mongoose.connection.once('error', err => logger.error('Mongo connect error ', err.message));
