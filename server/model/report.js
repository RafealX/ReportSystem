/**
 * 报告
 */
// 'use strict';
// const helper = require('./helper');
// const format = require('date-format');
// const dayMs = 24 * 3600 * 1000;
// const schema = helper.schema({
//     userId: String,
//     type: String,
//     periodTime: Number,
//     content: String,
//     deleted: Boolean,
//     toTeam: {teamId: String, teamName: String, teamReportId: String}
// }, {
//     timestamps: {createdAt: 'createTime', updatedAt: 'updateTime'}
// });

// schema.virtual('periodDesc').get(function () {
//     let time = new Date(this.periodTime);
//     if (this.type == 'day') {
//         return `${format('yyyy.MM.dd', time)} 日报`;
//     } else if (this.type == 'week') {
//         let day = time.getDay();
//         let normalDay = (!day ? 7 : day);
//         let beg = new Date(time.getTime() - dayMs * (normalDay - 1));
//         let end = new Date(time.getTime() + dayMs * (7 - normalDay));
//         return `${format('yyyy.MM.dd', beg)}~${format('yyyy.MM.dd', end)} 周报`;
//     } else {
//         return `${format('yyyy.MM', time)} 月报`;
//     }
// });

// schema.set('collection', 'reports');
// module.exports = helper.model('Report', schema);

/**
 * 日报
 */
'use strict';
const helper = require('./helper');
const dayMs = 24 * 3600 * 1000;
const schema = helper.schema({
    status: Number,
    _id: String,
    time: Number,
    others: String,
    tasks: String,
    taskhistorys: String,
    userid: String,
    groupid: String,
}, {
    timestamps: {createdAt: 'createTime', updatedAt: 'updateTime'}
});


schema.set('collection', 'reports');
module.exports = helper.model('Report', schema);