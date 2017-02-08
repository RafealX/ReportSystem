import {mustLogin} from 'lib/util';

module.exports = {
	path:'task',
    onEnter:mustLogin,
	component:props => props.children,
	childRoutes:[
		require('./my'),
		require('./team')
	]
}