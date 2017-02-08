import {mustLogin} from 'lib/util';
module.exports = {
    path: 'team',
    component: props => props.children,
    onEnter:mustLogin,
    childRoutes: [
        require('./list'),
        require('./edit')
    ]
};