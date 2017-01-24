/**
 * 用户model
 */
// 'use strict';
// let helper = require('./helper');
// let passportLocalMongoose = require('passport-local-mongoose');
// let schema = helper.schema({
//     nickname: String,
//     workMail: String,
//     groupId: String,
//     avatar: String
// }, {
//     ignores: ['salt', 'hash']
// });

// schema.set('collection', 'users');
// schema.plugin(passportLocalMongoose);
// module.exports = helper.model('User', schema);

'use strict';
let helper = require('./helper');
let passportLocalMongoose = require('passport-local-mongoose');
let schema = helper.schema({
    id: Number,
    name: String,
    groupid: Number,
    role: Number
}, {
    ignores: ['salt', 'hash']
});

schema.set('collection', 'users');
schema.plugin(passportLocalMongoose);
module.exports = helper.model('User', schema);