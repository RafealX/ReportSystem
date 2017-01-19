import React from 'react';
import {render} from 'react-dom';
import {Router, Route , browserHistory, IndexRedirect, Link} from 'react-router';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Popup} from 'cpn/popup';
import 'sass/reset.scss';
import 'sass/login_form.scss';

injectTapEventPlugin();

const App = (props) => {
    return <div id="route-root">{props.children}<Popup/></div>;
};

const rootRoute = {
    path: '/',
    component: App,
    childRoutes: [
        require('./route/account'),
        require('./route/index'),
        require('./route/main')
    ]
};

render(
    <MuiThemeProvider><Router history={browserHistory} routes={rootRoute}/></MuiThemeProvider>,
    document.getElementById('app-container'),
    function () {
        if(!location.pathname || location.pathname == '/') {
            browserHistory.replace('/index');
        }
    });