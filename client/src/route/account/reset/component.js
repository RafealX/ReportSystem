/**
 * 重置密码
 */
import React from 'react';
import {RaisedButton, AppBar, IconButton, TextField, Paper, Divider, Snackbar, Dialog, FlatButton} from 'material-ui';
import BackIcon from 'material-ui/svg-icons/navigation/chevron-left';
import {browserHistory} from 'react-router';
import md5 from 'blueimp-md5';
import {fetch} from 'lib/util';
import 'sass/login_form.scss';

module.exports = React.createClass({
    getInitialState() {
        return {errors: {}};
    },
    render() {
        const actions = [
            <FlatButton
                label="知道了"
                primary={true}
                onTouchTap={this._confirmSucc}/>
        ];
        return (
            <div>
                <AppBar
                    title="设置密码"
                    iconElementLeft={<IconButton onClick={e => browserHistory.go(-1)}><BackIcon /></IconButton>}/>
                <div className="login-form">
                    <div className="inputs">
                        <TextField
                            name="password"
                            type="password"
                            onKeyPress={this._checkEnter}
                            onChange={evt=>this.setState({password: evt.target.value})}
                            fullWidth
                            underlineShow={false}
                            hintText="新密码"/>
                        <Divider/>
                        <TextField
                            name="repeatPassword"
                            type="password"
                            onKeyPress={this._checkEnter}
                            onChange={evt=>this.setState({password2: evt.target.value})}
                            fullWidth
                            underlineShow={false}
                            hintText="确认密码"/>
                    </div>
                    <RaisedButton
                        disabled={this.state.loading}
                        onClick={this._reset}
                        className="login"
                        primary
                        fullWidth
                        label={this.state.loading ? '重置中...' : '重置'}/>
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
                    onRequestClose={this._confirmSucc}>
                    {this.state.succTip}
                </Dialog>
            </div>
        );
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
        if (e.which == 13) {
            this._reset();
        }
    },
    _reset() {
        if (!this._checkPass() || !this._checkPass2()) return;
        this.setState({
            loading: true
        });
        fetch('/api/user/reset', {
            method: 'post',
            body: {password: md5(this.state.password), key: this.props.params.key}
        })
            .then(d => {
                this.setState({succTip: '密码设置成功,请用新密码登录'});
            })
            .catch(e => {
                this.setState({
                    loading: false,
                    errMsg: e.msg
                });
            });
    },
    _confirmSucc() {
        this.setState({succTip: null}, () => browserHistory.replace('/account/login'));
    }
});