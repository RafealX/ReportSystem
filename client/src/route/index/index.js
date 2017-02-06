import {mustLogin} from 'lib/util';
module.exports = {
    path: 'index',
    onEnter(nextState, replace) {
        console.log(nextState);
    },
    getComponent(nextState, callback) {
        require.ensure([], function (require) {
            callback(null, require('./component'))
        })
    }
};