module.exports = {
    path: 'account',
    component: props => props.children,
    childRoutes: [
        require('./find'),
        require('./login'),
        require('./register'),
        require('./reset')
    ]
};