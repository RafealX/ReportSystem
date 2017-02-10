import {User} from 'lib/auth';
import {browserHistory} from 'react-router';
module.exports = {
    path: 'login',
    onEnter(nextState, replace) {
    	// if(!User.check()){
    	// 	User.login(nextState, replace);
    	// }else{
    	// 	if(!nextState.location.state || nextState.location.state=='/login'){
    	// 		browserHistory.replace('/m/report/my/list');
    	// 	}else{
    	// 		browserHistory.replace(nextState.location.state);
    	// 	}
    	// }
    	// console.log(replace);
    	// if(window.user && nextState&&nextState.location&&nextState.location.state){
    	// 	browserHistory.replace(nextState.location.state);
    	// }else{
    	// 	//mustLogin(nextState, replace);
    	// }
    	// console.log('cookie',document.cookie);
    },
    getComponent(nextState, callback) {
        require.ensure([], function (require) {
            callback(null, require('./component'))
        })
    }
};