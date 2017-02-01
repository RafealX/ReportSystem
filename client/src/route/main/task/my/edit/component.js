/**
 * 我的任务
 */

import React from 'react';
import {browserHistory} from 'react-router';
import {FlatButton, SelectField, TextField, MenuItem,FontIcon, IconButton,
    DatePicker, Toolbar, ToolbarGroup, RaisedButton, ToolbarSeparator} from 'material-ui';
import BackIcn from 'material-ui/svg-icons/Hardware/keyboard-backspace';
import Bulleted from 'material-ui/svg-icons/editor/format-list-bulleted';
import Numbered from 'material-ui/svg-icons/editor/format-list-numbered';
import Title from 'material-ui/svg-icons/editor/title';
import {fetch} from 'lib/util';
import popup from 'cpn/popup';
import pubsub from 'vanilla-pubsub';
import Editor from 'cpn/Editor';
import format from 'date-format';

module.exports = React.createClass({
	getInitialState() {
		return null;
	},
	componentDidMount() {
        let barConf = {
            title: (this.props.params.id ? '编辑' : '新建')+"任务",
            titleStyle:{
                fontSize:'16px',
                marginLeft:'-10px'
            },
            iconElementLeft:<IconButton title="新建任务" onClick={this.BackUrl}><BackIcn color={'#fff'}/></IconButton>
        };
        pubsub.publish('config.appBar', barConf);
	},
	BackUrl() {
		console.log(browserHistory);
        browserHistory.goBack();
	},
	componentWillUnMount() {

	},
	render() {
		return (
			<div>新增任务</div>
		);
	}
});