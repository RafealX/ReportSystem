/**
 * server 相关配置
 */
module.exports = {
    server: {
        listenPort: 8005,
        secret: 'REPORT_U'
    },
    db: {
<<<<<<< HEAD
        url: 'mongodb://127.0.0.1:27017/report'
=======
        url: 'mongodb://163.44.167.226:27017/report',
        autoReconnect: true,
>>>>>>> a93460ff7abacda209caa1ed2f3e7aa5c620a6d9
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