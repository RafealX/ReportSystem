/**
 * 创建群组
 */
import React from 'react';
import {Dialog, FlatButton, TextField} from 'material-ui';
import {browserHistory} from 'react-router';
import {fetch} from 'lib/util';
import pubsub from 'vanilla-pubsub';
import popup from 'cpn/popup';

export default React.createClass({
    getInitialState() {
        return {open: false, dataSource: []};
    },
    render() {
        let actions = [
            <FlatButton
                label="取消"
                onTouchTap={this._handleClose}/>,
            <FlatButton
                primary
                label="确定"
                onTouchTap={this._handleOk}/>
        ];
        return (
            <Dialog
                contentStyle={{maxWidth: '450px'}}
                title="创建组织"
                actions={actions}
                open={this.state.open}>
                <TextField
                    fullWidth
                    autoFocus
                    onKeyPress={e => e.which == 13 && this._handleOk()}
                    onChange={e => this.state.name = e.target.value}
                    hintText="组织名称"
                    name="name"/>
            </Dialog>
        );
    },
    toggle(open) {
        this.setState({
            open: open
        });
    },
    _handleClose() {
        this.toggle(false);
    },
    _handleOk() {
        if (!this.state.name) {
            popup.error('请输入组织名称');
            return;
        }
        fetch('/api/group/create', {method: 'post', body: {name: this.state.name}})
            .then(data => {
                window._user.groupId = data.group.id;
                window._user.groupAdmin = true;
                pubsub.publish('loginUser.change', window._user);
                this.toggle(false);
                browserHistory.replace('/m/group');
            })
            .catch(e => {
                popup.error(e.msg || '创建失败');
            });
    }
});