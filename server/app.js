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
const session = require('koa-session');


if(process.env.NODE_ENV=='local'){
    mongoose.set('debug',true);
    console.log(process.env.NODE_ENV);
}

app.proxy = true;
app.keys = ['reportSystem','ReactAndKOA'];
var CONFIG = {
    key: 'koa:sse', /** (string) cookie key (default is koa:sess) */
    maxAge: 86400000, /** (number) maxAge in ms (default is 1 days) */
    overwrite: true, /** (boolean) can overwrite or not (default true) */
    httpOnly: true, /** (boolean) httpOnly or not (default true) */
    signed: true, /** (boolean) signed or not (default true) */
};
app.use(session(CONFIG,app));
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
    app.listen(config.server.listenPort,'0.0.0.0', () => logger.info('Server listening on', config.server.listenPort));
});

mongoose.connection.once('error', err => logger.error('Mongo connect error ', err.message));
