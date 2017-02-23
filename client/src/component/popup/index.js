/**
 * 弹层组件,alert,confirm,tip
 */
import React from 'react';
import {Snackbar, FlatButton, Dialog} from 'material-ui';


let hook;

function success(msg) {
    invoke({msg: msg, type: 'tip'});
}

function error(msg) {
    invoke({msg: msg, type: 'tip'});
}

function alert(options) {
    options.type = 'alert';
    invoke(options);
}

function confirm(options) {
    options.type = 'confirm';
    invoke(options);
}

function invoke(options) {
    if(hook) {
        options.open = true;
        hook(options);
    }
}

const Popup = React.createClass({
    getInitialState() {
        return {open: false};
    },
    componentDidMount() {
        hook = this._onMessage
    },
    render() {
        if (this.state.type == 'alert' || this.state.type == 'confirm') {
            let actions = [
                <FlatButton
                    label="取消"
                    onTouchTap={this._handleClose}/>,
                <FlatButton
                    primary
                    label={this.state.type == 'alert' ? '知道了' : '确定'}
                    onTouchTap={this._handleOk}/>
            ];
            if (this.state.type == 'alert') {
                actions.shift();
            }
            return (
                <Dialog
                    contentStyle={{maxWidth: '450px'}}
                    title={this.state.title || '提示'}
                    actions={actions}
                    open={this.state.open}>
                    {this.state.msg}
                </Dialog>
            );
        } else {
            return <Snackbar
                autoHideDuration={2000}
                onRequestClose={e => this.setState({open: false})}
                open={this.state.open}
                message={this.state.msg || ''}/>
        }
    },
    _onMessage(options) {
        this.setState(options);
    },
    _handleClose() {
        this.setState({
            open: false
        });
        if (this.state.onCc) {
            this.state.onCc({
                action: 'close'
            });
            this.state.onCC = null;
        }
    },
    _handleOk() {
        this.setState({
            open: false
        });
        if (this.state.onOk) {
            this.state.onOk({
                action: 'close'
            });
            this.state.onOk = null;
        }
    }
});

export default {success, error, alert, confirm};
export {Popup};