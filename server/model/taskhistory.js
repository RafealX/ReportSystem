/**
 * 任务历史
 */
'use strict';
let helper = require('./helper');
let schema = helper.schema({
    id: Number,
    taskid: Number,
    elapse: Number,    //耗时
    question: String,
    summary: String,
    time: Date,
    progress: Number
}, {});

schema.set('collection', 'taskhistorys');
module.exports = helper.model('Taskhistory', schema);