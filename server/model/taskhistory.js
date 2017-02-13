/**
 * 任务历史
 */
'use strict';
let helper = require('./helper');
let util = require('../lib/util');
let schema = helper.schema({
    id: {type:String,default:util.uuid()},
    targettask: String,
    taskname:String,
    elapse: Number,    //耗时
    question: String,
    summary: String,
    time: {type:Number,default:0},
    progress: Number,
    description:String//本日无进度时会进行填写
}, {
    collection:'TaskHistory'
});
module.exports = helper.model('TaskHistory', schema);