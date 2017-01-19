/**
 * 报告
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

const types = [
    <MenuItem key="day" value="day" primaryText="日报"/>,
    <MenuItem key="week" value="week" primaryText="周报"/>,
    <MenuItem key="month" value="month" primaryText="月报"/>
];

const iconStyle = {fontSize: '16px', fontWeight: 'bold', marginTop: '4px'};
const style = {
    margin: '30px',
    height: 'calc(100% - 60px)',
    boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px'
};


module.exports = React.createClass({
    getInitialState() {
        return {rp: this.props.location.state || {}};
    },
    componentDidMount() {
        let barConf = {
            title: (this.props.params.id ? '编辑' : '新建') + '简报'
        };
        pubsub.publish('config.appBar', barConf);
    },
    render() {
        let rp = this.state.rp;
        return (
            <div style={style}>
                <Toolbar>
                    <ToolbarGroup firstChild>
                        <SelectField
                            value={rp.type}
                            style={{width: '80px', margin: '4px 20px'}}
                            onChange={(e, k, v) => {this.state.rp.type = v;this.forceUpdate();}}
                            hintText="类型">
                            {types}
                        </SelectField>
                        <DatePicker
                            autoOk
                            locale="zh-Hans-CN"
                            DateTimeFormat={Intl.DateTimeFormat}
                            cancelLabel="取消"
                            formatDate={this._formatTime}
                            value={rp.periodTime ? new Date(rp.periodTime) : null}
                            onChange={(e, date) => {this.state.rp.periodTime = date.getTime();this.forceUpdate();}}
                            style={{width: '120px', marginTop: '4px'}}
                            textFieldStyle={{width: '120px'}}
                            hintText="日期"/>
                    </ToolbarGroup>
                    <ToolbarGroup lastChild>
                        <IconButton
                            disabled={this._iconDisabled('h2')}
                            style={iconStyle}
                            onTouchTap={this._toggleHeading}>
                            <Title color={this._iconColor('h2')}/>
                        </IconButton>
                        <IconButton
                            disabled={this._iconDisabled('ul')}
                            style={iconStyle}
                            onTouchTap={this._toggleUl}>
                            <Bulleted color={this._iconColor('ul')}/>
                        </IconButton>
                        <IconButton
                            disabled={this._iconDisabled('ol')}
                            style={iconStyle}
                            onTouchTap={this._toggleOl}>
                            <Numbered color={this._iconColor('ol')}/>
                        </IconButton>
                        <ToolbarSeparator/>
                        <RaisedButton
                            primary
                            disabled={this.state.saving}
                            label={this.state.saving ? '保存中...': '保存'}
                            onTouchTap={this._handleSave}/>
                    </ToolbarGroup>
                </Toolbar>
                <Editor ref="editor" initContent={this.state.rp.content} onSelectionChange={this._onSelectionChange}/>
            </div>
        );
    },
    _toggleHeading() {
        let editor = this.refs.editor;
        this.state.formatType == 'h2' ? editor.removeFormat() : editor.heading('h2');
    },
    _toggleUl() {
        let editor = this.refs.editor;
        this.state.formatType == 'ul' ? editor.removeFormat() : editor.insertUnorderedList();
    },
    _toggleOl() {
        let editor = this.refs.editor;
        this.state.formatType == 'ol' ? editor.removeFormat() : editor.insertOrderedList();
    },
    _iconDisabled(type) {
        return !!(this.state.formatType && this.state.formatType != type);
    },
    _iconColor(type) {
        return this.state.formatType == type ? 'rgb(0, 188, 212)' : '';
    },
    _onSelectionChange(type) {
        this.setState({
            formatType: type
        });
    },
    _onTypeChange(e, index, value) {
        this.setState({
            type: value
        });
    },
    _formatTime(time) {
        let dayMs = 24 * 3600 * 1000;
        let type = this.state.rp.type || 'day';
        if (type == 'day') {
            return `${format('yyyy.MM.dd', time)}`;
        } else if (type == 'week') {
            let day = time.getDay();
            let normalDay = (!day ? 7 : day);
            let beg = new Date(time.getTime() - dayMs * (normalDay - 1));
            let end = new Date(time.getTime() + dayMs * (7 - normalDay));
            return `${format('MM.dd', beg)}~${format('MM.dd', end)}`;
        } else {
            return `${format('yyyy.MM', time)}`;
        }
    },
    _handleSave() {
        let rp = this.state.rp;
        if (!rp.type) {
            popup.error('请选择类型');
            return;
        }
        if (!rp.periodTime) {
            popup.error('请选择日期');
            return;
        }
        rp.content = this.refs.editor.getContent();
        if (!rp.content) {
            popup.error('请输入内容');
            return;
        }
        this.setState({saving: true});
        fetch('/api/report/' + (rp.id ? 'update' : 'create'), {
            method: 'post',
            body: {
                report: rp
            }
        })
            .then(d => {
                popup.success('保存成功');
                this.state.saving = false;
                browserHistory.go(-1);
            })
            .catch(e => {
                popup.success(e.msg || '保存失败');
                this.setState({saving: false});
            });
    }
});