/**
 * 注册
 */
import React from 'react';
import {RaisedButton, AppBar, IconButton, TextField, Paper, Divider, Snackbar} from 'material-ui';
import BackIcon from 'material-ui/svg-icons/navigation/chevron-left';
import {browserHistory} from 'react-router';
import md5 from 'blueimp-md5';
import 'sass/login_form.scss';
import {isMail, fetch} from 'lib/util';

module.exports = React.createClass({
    getInitialState() {
        return {errors: {}};
    },
    render() {
        return (
            <div>
                <AppBar
                    title="注册"
                    iconElementLeft={<IconButton onClick={e => browserHistory.go(-1)}><BackIcon /></IconButton>}/>
                <div className="login-form">
                    <div className="inputs">
                        <TextField
                            autoFocus
                            name="username"
                            type="mail"
                            onChange={evt=>this.setState({username: evt.target.value})}
                            fullWidth
                            underlineShow={false}
                            onKeyPress={this._checkEnter}
                            hintText="邮箱"/>
                        <Divider/>
                        <TextField
                            name="name"
                            type="text"
                            onChange={evt=>this.setState({nickname: evt.target.value})}
                            fullWidth
                            underlineShow={false}
                            onKeyPress={this._checkEnter}
                            hintText="昵称"/>
                        <Divider/>
                        <TextField
                            name="password"
                            type="password"
                            onChange={evt=>this.setState({password: evt.target.value})}
                            fullWidth
                            underlineShow={false}
                            onKeyPress={this._checkEnter}
                            hintText="密码"/>
                        <Divider/>
                        <TextField
                            name="repeatPassword"
                            type="password"
                            onChange={evt=>this.setState({password2: evt.target.value})}
                            fullWidth
                            underlineShow={false}
                            onKeyPress={this._checkEnter}
                            hintText="确认密码"/>
                    </div>
                    <RaisedButton
                        disabled={this.state.loading}
                        onClick={this._register}
                        className="login"
                        primary
                        fullWidth
                        label={this.state.loading ? '注册中...' : '注册'}/>
                </div>
                <Snackbar open={!!this.state.errMsg}
                          message={this.state.errMsg || ''}
                          autoHideDuration={2000}
                          onRequestClose={e => this.setState({errMsg: ''})}/>
            </div>
        );
    },
    _checkMail() {
        if (!this.state.username) {
            this.state.errMsg = '请输入邮箱';
        } else if (!isMail(this.state.username)) {
            this.state.errMsg = '邮箱格式不正确';
        }
        this.forceUpdate();
        return !this.state.errMsg;
    },
    _checkNick() {
        if (!this.state.nickname) {
            this.state.errMsg = '请输入昵称';
        }
        this.forceUpdate();
        return !this.state.errMsg;
    },
    _checkPass() {
        if (!this.state.password) {
            this.state.errMsg = '请输入密码';
        } else if (this.state.password.length < 6) {
            this.state.errMsg = '密码长度不能少于6位';
        }
        this.forceUpdate();
        return !this.state.errMsg;
    },
    _checkPass2() {
        if (!this.state.password2) {
            this.state.errMsg = '请再次确认密码';
        } else if (this.state.password !== this.state.password2) {
            this.state.errMsg = '密码输入不一致';
        }
        this.forceUpdate();
        return !this.state.errMsg;
    },
    _checkEnter(e) {
        if(e.which == 13) {
            this._register();
        }
    },
    _register() {
        if (this._checkMail()
            && this._checkNick()
            && this._checkPass()
            && this._checkPass2()) {
            this.setState({loading: true});
            fetch('/api/user/register', {
                method: 'post',
                body: {
                    username: this.state.username,
                    nickname: this.state.nickname,
                    password: md5(this.state.password)
                }
            })
                .then(data => {
                    this.setState({loading: false});
                    window._user = data.user;
                    browserHistory.replace('/index');
                })
                .catch(e=> {
                    this.setState({loading: false});
                });
        }
    }
});