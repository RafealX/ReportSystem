/**
 * 我的任务
 */

import React from 'react';
import {browserHistory} from 'react-router';
import {FlatButton, SelectField, TextField, MenuItem,FontIcon, IconButton,
    DatePicker, Toolbar, ToolbarGroup, RaisedButton, ToolbarSeparator} from 'material-ui';
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

	},
	componentWillUnMount() {

	},
	render() {
		return (
			<div>12334565</div>
		);
	}
});