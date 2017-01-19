/**
 * 统一请求参数
 */
'use strict';
module.exports = function () {
    return function*(next) {
        this.request.params = Object.assign({}, this.request.query, this.request.body);
        yield next;
    }
};