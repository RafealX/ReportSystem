import {mustLogin} from 'lib/util';
module.exports = {
    path: 'guide',
    getComponent(nextState, callback) {
        require.ensure([], function (require) {
            callback(null, require('./component'))
        })
    }
};