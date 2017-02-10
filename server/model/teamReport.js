/**
 * 小组报告
 */
'use strict';
let helper = require('./helper');
let schema = helper.schema({
    teamId: String,
    createTime: Date,
    updateTime: Date,
    type: String,
    periodDesc: String,
    list: [{userId: String, reportId: String, content: String}]
}, {
    timestamps: {createdAt: 'createTime', updatedAt: 'updateTime'}
});

schema.set('collection', 'team_reports');
module.exports = helper.model('TeamReport', schema);
