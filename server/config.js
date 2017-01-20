/**
 * server 相关配置
 */
module.exports = {
    server: {
        listenPort: 8005,
        secret: 'REPORT_U'
    },
    db: {
        url: 'mongodb://163.44.167.226:27017/report',
        autoReconnect: true,
    },
    mail: {
        host: 'smtp.163.com',
        port: 465,
        secure: true,
        auth: {
            user: 'llwwtest2@163.com',
            pass: 'qrkleqszhqbxpipq'
        }
    }
};