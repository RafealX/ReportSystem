/**
 * 个人设置
 */
import React from 'react';
import {FlatButton, IconButton, TextField, Toggle, Table, Card,
    TableHeader, TableRow, TableRowColumn, TableHeaderColumn, TableBody,
    CardHeader, CardText, CardActions, Checkbox, Dialog} from 'material-ui';
import _ from 'lodash';
import {fetch, checkEnter} from 'lib/util';
import popup from 'cpn/popup';
import pubsub from 'vanilla-pubsub';
import Avatar from 'cpn/Avatar';
import scss from './index.scss';
import md5 from 'blueimp-md5';

module.exports = React.createClass({
    getInitialState() {
        return {user: Object.assign({}, window._user), oldPass: '', newPass: ''};
    },
    componentDidMount() {
        let barConf = {
            title: '个人设置'
        };
        pubsub.publish('config.appBar', barConf);
    },
    render() {
        let user = this.state.user;
        return (
            <div className={scss.style}>
                <div style={{maxWidth: '500px', margin: '0 auto 20px', paddingTop: '16px'}}>
                    <Card className="card">
                        <CardHeader
                            style={{paddingBottom:0, lineHeight: '40px'}}
                            avatar={<Avatar style={{marginRight: '16px'}} user={this.state.user}/>}
                            title="个人设置"/>
                        <CardText style={{paddingTop: 0}}>
                            <TextField
                                name="nickname"
                                defaultValue={user.nickname || ''}
                                onKeyPress={checkEnter(this._saveInfo)}
                                onChange={this._upInfo.bind(this, 'nickname')}
                                className="text"
                                hintText="请输入昵称"
                                floatingLabelText="昵称"/>
                            <TextField
                                name="workMail"
                                defaultValue={user.workMail || ''}
                                onKeyPress={checkEnter(this._saveInfo)}
                                onChange={this._upInfo.bind(this, 'workMail')}
                                className="text"
                                hintText="请输入邮箱"
                                floatingLabelText="工作邮箱"/>
                        </CardText>
                        <CardActions>
                            <FlatButton
                                primary
                                disabled={!this.state.canSave}
                                onClick={this._saveInfo}
                                label="保存"/>
                        </CardActions>
                    </Card>
                    <Card style={{marginTop: '16px'}} className="card">
                        <CardHeader
                            showExpandableButton
                            style={{paddingBottom:0}}
                            title="密码设置"/>
                        <CardText
                            expandable
                            style={{paddingTop: 0}}>
                            <TextField
                                type="password"
                                name="nickname"
                                onKeyPress={checkEnter(this._savePass)}
                                onChange={this._upPass.bind(this, 'oldPass')}
                                className="text"
                                hintText="请输入原密码"
                                floatingLabelText="原密码"/>
                            <TextField
                                name="workMail"
                                type="password"
                                onKeyPress={checkEnter(this._savePass)}
                                onChange={this._upPass.bind(this, 'newPass')}
                                className="text"
                                hintText="请输入新密码"
                                floatingLabelText="新密码"/>
                        </CardText>
                        <CardActions>
                            <FlatButton
                                primary
                                disabled={!this.state.canSavePass}
                                onClick={this._savePass}
                                label="保存"/>
                        </CardActions>
                    </Card>
                </div>
            </div>
        );
    },
    _upInfo(key, e) {
        this.state.user[key] = e.target.value;
        let canSave = this.state.user.nickname
            && (this.state.user.nickname != _user.nickname
            || this.state.user.workMail != _user.workMail);
        if (canSave != this.state.canSave) {
            this.setState({canSave: canSave});
        }
    },
    _upPass(key, e) {
        this.state[key] = e.target.value;
        let canSavePass = this.state.oldPass.length >= 6 && this.state.newPass.length >= 6;
        if (canSavePass != this.state.canSavePass) {
            this.setState({
                canSavePass: canSavePass
            });
        }
    },
    _saveInfo() {
        if (!this.state.canSave) return;
        let user = this.state.user;
        fetch('/api/user/upinfo', {
            method: 'post',
            body: {nickname: user.nickname, workMail: user.workMail}
        })
            .then(d => {
                Object.assign(window._user, user);
                pubsub.publish('loginUser.change', window._user);
                popup.success('保存成功');
                this.setState({
                    canSave: false
                });
            })
            .catch(e => {
                popup.error('保存失败');
            });
    },
    _savePass() {
        if (!this.state.canSavePass) return;
        fetch('/api/user/uppass', {
            method: 'post',
            body: {oldPass: md5(this.state.oldPass), newPass: md5(this.state.newPass)}
        })
            .then(d => {
                popup.success('保存成功');
                this.setState({
                    canSavePass: false
                });
            })
            .catch(e => {
                popup.error(e.msg || '保存失败');
            });
    }
});