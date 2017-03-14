/**
 * Created by hzxiangfangnian on 2017/2/24.
 * 权限表，记录每个人的权限
 */
'use strict';
let helper = require('./helper');
let util = require('../lib/util');
let schema = helper.schema({
    id: {type:String,default:util.uuid},
    userid:String,
    role:{type:Number,default:1}
}, {ignores: 'members'});

schema.set('collection', 'Role');
module.exports = helper.model('Role', schema);