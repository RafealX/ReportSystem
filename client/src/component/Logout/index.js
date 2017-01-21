/*
	退出按钮
 */
import React from 'react';
import IconButton from 'material-ui/IconButton';
import LogoutIcn from 'material-ui/svg-icons/action/power-settings-new';
import {browserHistory} from 'react-router';
import {fetch} from 'lib/util';
import {blue500, red200, greenA200} from 'material-ui/styles/colors';
import {style} from './index.scss';

const hoverStyle = {
	color:'#f00'
};
export default React.createClass({
	getInitialState() {
		return {loading:false};
	},
	render() {
		return (<IconButton 
			hoveredStyle={hoverStyle} 
			disabled={this.state.loading} 
			primary={true} 
			className={style} 
			tooltip={this.props.title} 
      		tooltipPosition="bottom-center"
			onClick={this._logout}><LogoutIcn color={red200}/></IconButton>);
	},
	_logout() {
		alert(12);
		this.setState({
            loading: true
        });
        fetch('/api/user/logout')
            .then(d => {
                window._user = {};
                browserHistory.push('/index');
            })
            .catch(e => {
                popup.error('退出失败');
                this.setState({
                    loading: false
                });
            });
	}
});