module.exports = {
    path: 'report',
    component: props => props.children,
    childRoutes: [
        require('./my'),
        require('./team')
    ]
};