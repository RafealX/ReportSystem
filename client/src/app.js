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

let roleBack = ()=>{
    
    const App = (props) => {
        return <div id="route-root">{props.children}<Popup/></div>;
    };

    const NoMatch = (props) => {
        return <div></div>;
    };


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
        fontFamily:' "PingFang SC","Microsoft YaHei", "仿宋", sans-serif',
        backgroundColor: '#f9f9f9'
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
    //console.log(browserHistory);
    browserHistory.listen((location, action)=>{
        //console.log(browserHistory);
        //console.log(action, location.pathname, location.state)
        if(location.pathname=='/'){
            if(!User.check()){
                browserHistory.replace('/login');
            }else{
                browserHistory.replace(window.default_route);
            }
        }else if(location.pathname=='/login'){
            if(User.check()){
                //console.log('stop');
                browserHistory.replace(window.default_route);
            }
        }else{
            if(!User.check()){
                //console.log('stop');
                console.log(window.location.pathname);
                browserHistory.replace({
                    pathname:'/login',
                    state: { nextState: window.location.pathname?window.location.pathname:window.default_route }
                })
            }
        }
    });

}
User.resolve(roleBack);
injectTapEventPlugin();


//roleBack();
