import {mustLogin} from 'lib/util';
module.exports = {
    path: 'team',
    component: props => props.children,
    childRoutes: [
        require('./list'),
        require('./edit')
    ]
};