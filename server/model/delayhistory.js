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
    groupid: {type:String,default:1},
    time:Number,//创建时间
    id: {type:String,default:util.uuid},
    sourcetime: {type:Number,default:0},//原截止日期
    targettime: {type:Number,default:0},//延期或提前
    taskhistoryid:String,//如果在写日报的时候发生修改，就需要在此带上
    reason: {type:String,default:''}//延期或提前原因
}, {collection:'TaskDelayHistory'});

module.exports = helper.model('TaskDelayHistory', schema);