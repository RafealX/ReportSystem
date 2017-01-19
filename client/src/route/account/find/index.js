module.exports =  {
    path: 'find',
    onEnter(nextState, replace) {
        if(_user.id) {
            replace('/index');
        }
    },
    getComponent(nextState, callback) {
        require.ensure([], function (require) {
            callback(null, require('./component'))
        })
    }
};