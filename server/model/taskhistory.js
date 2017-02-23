/**
 * 任务历史
 */
'use strict';
let helper = require('./helper');
let util = require('../lib/util');
let schema = helper.schema({
    id: {type:String,default:util.uuid()},
    taskid: String,
    taskname:String,
    elapse: Number,    //耗时
    time: {type:Number,default:0},//创建时间，是跟随report创建时间
    progress: Number,
    startprogress:Number,
    userid:String,
    username:String,
    status:{type:Number,default:1},//同report的记录值，1为未发送，2为发送，3为删除
    groupid:String,
    content:String//本日无进度时会进行填写
}, {
    collection:'TaskHistory'
});
module.exports = helper.model('TaskHistory', schema);