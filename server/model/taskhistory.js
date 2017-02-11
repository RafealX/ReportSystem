/**
 * 任务历史
 */
'use strict';
let helper = require('./helper');
let passportLocalMongoose = require('passport-local-mongoose');
let schema = helper.schema({
    _id: String,
    taskid: String,
    elapse: Number,    //耗时
    question: String,
    summary: String,
    time: Date,
    progress: Number
}, {
    collection:'Taskhistory'
});

schema.plugin(passportLocalMongoose);
module.exports = helper.model('Taskhistory', schema);