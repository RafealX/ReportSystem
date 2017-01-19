/**
 * 小组
 */
'use strict';
let helper = require('./helper');
let schema = helper.schema({
    name: String,
    groupId: String,
    mails: String,
    canBeFollow: Boolean,
    members: [{userId: String, admin: Boolean}],
    follows: [{userId: String}]
}, {ignores: 'members'});

schema.set('collection', 'teams');
module.exports = helper.model('Team', schema);