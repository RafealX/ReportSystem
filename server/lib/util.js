/**
 * 工具方法
 */
'use strict';
const config = require('../config');
const mailer = require('nodemailer');
const crypto = require('crypto');
const transporter = mailer.createTransport(config.mail);
const logger = require('./logger');
const skey = 'bLiXoEdDlsOiDl';// TODO 不要代码里写死


module.exports.sendMail = function (mail) {
    let user = config.mail.auth.user;
    !mail.from && (mail.from = `"简报" <${user}>`);
    return new Promise(function (resolve, reject) {
        transporter.sendMail(mail, err => {
            if (err) {
                reject(err);
                logger.warn('邮件发送失败', err);
            } else {
                resolve();
            }
        });
    });
};

module.exports.isMail = function (str) {
    return /^\w+@\w+/.test(str);
};
module.exports.uuid = function (){
    return Math.random().toString(26).slice(2);
}
module.exports.today = function () {
    let date = new Date();
    date = new Date(date.toLocaleDateString());
    return date.getTime();
}