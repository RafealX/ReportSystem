/**
 * 组织
 */
// 'use strict';
// let helper = require('./helper');
// let schema = helper.schema({
//     name: String,
//     members: [{userId: String, admin: Boolean}]
// }, {ignores: 'members'});

// schema.set('collection', 'groups');
// module.exports = helper.model('Group', schema);

'use strict';
let helper = require('./helper');
let util = require('../lib/util');
let schema = helper.schema({
	id: {type:String,default:util.uuid},
    name: String,
    members: String,//以id，名字保存。分号间隔
    adminid: String,
        copyto:''//抄送用户邮箱
}, {ignores: 'members'});

schema.set('collection', 'Group');
module.exports = helper.model('Group', schema);