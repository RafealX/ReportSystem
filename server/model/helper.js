/**
 * 基础scheme,注入通用配置
 */
'use strict';
const mongoose = require('mongoose');
const toOptions = {
    getters: true, virtuals: true
};
const defaultOptions = {
    id: true,
    toObject: toOptions,
    toJSON: toOptions,
    timestamps: {createdAt: 'createTime', updatedAt: 'updateTime'}
};

const defaultSchema = {
    createTime: Date,
    updateTime: Date
};

mongoose.Promise = global.Promise;

module.exports.schema = function (def, options) {
    toOptions.transform = function (doc, ret) {
        let ignores = options && options.ignores || [];
        let rst = {};
        Object.keys(ret)
            .filter(key => ignores.indexOf(key) == -1 && key[0] != '_')
            .forEach(key => {
                rst[key] = ret[key];
            });
        return rst;
    };
    return new mongoose.Schema(Object.assign({}, defaultSchema, def),
        Object.assign({}, defaultOptions, options));

};

module.exports.model = function (name, schema) {
    return mongoose.model(name, schema);
};