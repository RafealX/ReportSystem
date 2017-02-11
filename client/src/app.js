import React from 'react';
import {render} from 'react-dom';
import {Router, Route , browserHistory, IndexRedirect, IndexRoute,Link} from 'react-router';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Popup} from 'cpn/popup';
import {User} from './lib/auth.js';
import 'sass/reset.scss';
import 'sass/login_form.scss';
User.resolve();
injectTapEventPlugin();

const App = (props) => {
    return <div id="route-root">{props.children}<Popup/></div>;
};

const NoMatch = (props) => {
    return <div></div>;
};

//console.log(browserHistory);
browserHistory.listen((location, action)=>{
    //console.log(browserHistory);
    //console.log(action, location.pathname, location.state)
    if(location.pathname=='/'){
        if(!User.check()){
            browserHistory.replace('/login');
        }else{
            browserHistory.replace('/m/report/my/list');
        }
    }else if(location.pathname=='/login'){
        if(User.check()){
            //console.log('stop');
            browserHistory.replace('/m/report/my/list');
        }
    }else{

    }
});

const NoMatchRoute = {
    path: '*',
    onEnter:function(nextState, replace){
        if(!User.check()){
            browserHistory.replace('/login');
        }else{
            browserHistory.replace('/');
        }
    },
    component:NoMatch
}
const rootRoute = {
    path: '/',
    component: App,
    childRoutes: [
        require('./route/index'),
        require('./route/main'),
        NoMatchRoute
    ]
};

const customMuiTheme = getMuiTheme({
    fontFamily:'"Microsoft YaHei", "PingFang SC", "仿宋", sans-serif'
});

render(
    <MuiThemeProvider muiTheme={customMuiTheme}><Router history={browserHistory} routes={rootRoute}></Router></MuiThemeProvider>,
    document.getElementById('app-container'),
    function () {
        //console.log(this.props);
        // if(!User.check()){
        //     browserHistory.replace('/login');
        // }else{
        //     browserHistory.replace(window.location.path?window.location.path:'/m/report/my/list');
        // }
        
    });