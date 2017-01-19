/**
 * 找回密码
 */
import React from 'react';
import {RaisedButton, AppBar, IconButton, TextField, Paper, Divider, Snackbar, Dialog, FlatButton} from 'material-ui';
import {browserHistory} from 'react-router';
import BackIcon from 'material-ui/svg-icons/navigation/chevron-left';
import {isMail, fetch} from 'lib/util';
import 'sass/login_form.scss';

module.exports = React.createClass({
    getInitialState() {
        return {};
    },
    render() {
        const actions = [
            <FlatButton
                label="知道了"
                primary={true}
                onTouchTap={e => this.setState({succTip: null})}
            />
        ];
        return (
            <div>
                <AppBar
                    title="找回密码"
                    iconElementLeft={<IconButton onClick={e => browserHistory.go(-1)}><BackIcon /></IconButton>}/>
                <div className="login-form">
                    <div className="inputs">
                        <TextField
                            onKeyPress={this._checkEnter}
                            onChange={e => this.setState({mail: e.target.value})}
                            name="account"
                            type="mail"
                            fullWidth
                            underlineShow={false}
                            hintText="注册邮箱"/>
                    </div>
                    <RaisedButton
                        disabled={this.state.loading}
                        onClick={this._find}
                        className="login"
                        primary
                        fullWidth
                        label={this.state.loading ? '找回中...' : '找回'}/>
                </div>
                <Snackbar open={!!this.state.errMsg}
                          message={this.state.errMsg || ''}
                          autoHideDuration={2000}
                          onRequestClose={e => this.setState({errMsg: ''})}/>
                <Dialog
                    title="提示"
                    actions={actions}
                    modal={true}
                    open={!!this.state.succTip}
                    onRequestClose={e => this.setState({succTip: null})}>
                    {this.state.succTip}
                </Dialog>
            </div>
        );
    },
    _checkMail() {
        if (!this.state.mail) {
            this.state.errMsg = '请输入注册邮箱';
        } else if (!isMail(this.state.mail)) {
            this.state.errMsg = '邮箱格式不正确';
        }
        this.forceUpdate();
        return !this.state.errMsg;
    },
    _checkEnter(e) {
        if (e.which == 13) {
            this._find();
        }
    },
    _find() {
        if (!this._checkMail()) return;
        this.setState({
            loading: true
        });
        fetch('/api/user/find', {
            method: 'post',
            body: {mail: this.state.mail}
        })
            .then(d => {
                this.setState({
                    loading: false,
                    succTip: <p>密码重置邮件已发送至{this.state.mail}<br/>请尽快登录邮箱设置您的密码</p>
                });
            })
            .catch(e => {
                this.setState({
                    loading: false,
                    errMsg: e.msg
                });
            });
    }
});