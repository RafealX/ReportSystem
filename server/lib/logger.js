/**
 * 日志工具
 */
var log4js = require('log4js');
log4js.configure({
    appenders: [
        {type: 'console'},
        {type: 'file', filename: 'log/default.log'}
    ]
});
module.exports = log4js.getLogger();