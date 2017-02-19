/**
 * Created by hzxiangfangnian on 2017/2/18.
 */
/**
 * 任务
 */
'use strict';
let helper = require('./helper');
const util = require('../lib/util');
let schema = helper.schema({
    taskid:String,
    userid: String,
    groupid: {type:Number,default:1},
    id: {type:String,default:util.uuid},
    time: {type:Number,default:0},
    taskhistoryid:String,
    delayreason: {type:String,default:''}
}, {collection:'TaskDelayHistory'});

module.exports = helper.model('TaskDelayHistory', schema);