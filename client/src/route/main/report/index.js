import {mustLogin} from 'lib/util';
module.exports = {
    path: 'report',
    onEnter:mustLogin,
    component: props => props.children,
    childRoutes: [
        require('./my'),
        require('./team')
    ]
};