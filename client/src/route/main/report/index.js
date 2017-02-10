import {mustLogin} from 'lib/util';
module.exports = {
    path: 'report',
    component: props => props.children,
    childRoutes: [
        require('./my'),
        require('./team')
    ]
};