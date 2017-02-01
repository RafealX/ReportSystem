module.exports = {
    path: 'my',
    component: props => props.children,
    childRoutes: [
        require('./list'),
        require('./edit')
    ]
};