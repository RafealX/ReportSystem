/**
 * Created by hzxiangfangnian on 2017/2/24.
 */
'use strict';
let helper = require('./helper');
const util = require('../lib/util');
let schema = helper.schema({
    userid: String,
    username:String,
    content:{type:String,default:''},
    time:Number,//创建时间
    id: {type:String,default:util.uuid}
}, {collection:'Feedback'});

module.exports = helper.model('Feedback', schema);