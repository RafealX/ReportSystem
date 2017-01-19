module.exports = {
    path: 'index',
    onEnter(nextState, replace) {
        if(_user.id) {
            if(_user.groupId) {
                replace('/m/report/my/list');
            } else {
                replace('/m/guide');
            }
        }
    },
    getComponent(nextState, callback) {
        require.ensure([], function (require) {
            callback(null, require('./component'))
        })
    }
};