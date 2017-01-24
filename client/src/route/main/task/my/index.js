module.exports = {
	path:'my',
	getComponent(nextState,callback){
		require.ensure([],function(require){
			callback(null,require('./component'));
		})
	}
}