/**
 * 登录
 */
import React from 'react';
import {RaisedButton, AppBar, IconButton, TextField, Paper, Divider, Snackbar} from 'material-ui';
import {browserHistory, Link} from 'react-router';
import BackIcon from 'material-ui/svg-icons/navigation/chevron-left';
import md5 from 'blueimp-md5';
import {isMail} from 'lib/util';
import 'sass/login_form.scss';
import {fetch} from 'lib/util';
import pubsub from 'vanilla-pubsub';

module.exports = React.createClass({
    getInitialState() {
        return {errors: {}};
    },
    render() {
        return (
            <div>
                <AppBar
                    title="登录"
                    iconElementLeft={<IconButton onClick={e => browserHistory.go(-1)}><BackIcon /></IconButton>}/>
                <div className="login-form">
                    <div className="inputs">
                        <TextField
                            autoFocus
                            onKeyPress={this._checkEnter}
                            onChange={evt=>this.setState({username: evt.target.value})}
                            name="username"
                            type="mail"
                            fullWidth
                            underlineShow={false}
                            hintText="邮箱"/>
                        <Divider/>
                        <TextField
                            onKeyPress={this._checkEnter}
                            onChange={evt=>this.setState({password: evt.target.value})}
                            name="password"
                            type="password"
                            fullWidth
                            underlineShow={false}
                            hintText="密码"/>
                    </div>
                    <p className="err">{this.state.err}&nbsp;</p>
                    <RaisedButton
                        disabled={this.state.loading}
                        onClick={this._login}
                        className="login"
                        primary
                        fullWidth
                        label={this.state.loading ? '登录中...' : '登录'}/>
                    <p className="find"><Link to="/account/find">找回密码</Link></p>
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
    _checkPass() {
        if (!this.state.password) {
            this.state.errMsg = '请输入密码';
        } else if (this.state.password.length < 6) {
            this.state.errMsg = '密码不能少于6位';
        }
        this.forceUpdate();
        return !this.state.errMsg;
    },
    _getData() {
        return {
            username: this.state.username,
            password: md5(this.state.password)
        }
    },
    _checkEnter(e) {
        if (e.which == 13) {
            this._login();
        }
    },
    _login() {
        if (this._checkMail() && this._checkPass()) {
            this.setState({
                loading: true
            });
            fetch('/api/user/login', {method: 'post', body: this._getData()})
                .then(data => {
                    let next = this.props.location.state && this.props.location.state.nextPathname;
                    window._user = data.user;
                    pubsub.publish('loginUser.change');
                    browserHistory.replace(next ? next : '/index');
                })
                .catch(e => {
                    this.setState({
                        loading: false,
                        errMsg: e.msg
                    });
                });
        }
    }
});