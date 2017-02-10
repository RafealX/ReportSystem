import {mustLogin} from 'lib/util';

module.exports = {
	path:'task',
	component:props => props.children,
	childRoutes:[
		require('./my'),
		require('./team')
	]
}