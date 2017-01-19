/**
 * 用户查找组件
 */
import React from 'react';
import {Dialog, FlatButton, AutoComplete, Chip} from 'material-ui';
import _ from 'lodash';
import {fetch} from 'lib/util';

const sourceConf = {text: 'nickname', value: 'id'};
const wrapStyle = {display: 'flex', flexWrap: 'wrap'};
const chipStyle = {marginRight: '10px', marginBottom: '6px'};

export default React.createClass({
    getInitialState() {
        return {open: false, dataSource: [], users: []};
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
                title="选择用户"
                actions={actions}
                open={this.state.open}>
                <div style={wrapStyle}>
                    {
                        this.state.users.map((u, i) => <Chip key={u.id}
                                                             style={chipStyle}
                                                             onRequestDelete={this._delUser.bind(this, i)}>
                            {u.nickname}
                        </Chip>)
                    }
                </div>
                <AutoComplete
                    openOnFocus
                    searchText={this.state.searchText || ''}
                    maxSearchResults={6}
                    hintText="输入姓名查找"
                    floatingLabelText="搜索用户"
                    dataSourceConfig={sourceConf}
                    dataSource={this.state.dataSource}
                    onNewRequest={this._handleRequest}
                    onUpdateInput={this._handleUpdateInput}
                    fullWidth={true}/>
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
        this.toggle(false);
        if(this.props.onOk) {
            this.props.onOk(this.state.users);
        }
    },
    _handleUpdateInput(value) {
        this.setState({
            searchText: value
        });
        fetch('/api/user/search?name=' + value)
            .then(d => {
                this.setState({
                    dataSource: d.list
                });
            });
    },
    _handleRequest(value) {
        if (typeof value == 'object' && !_.find(this.state.users, {id: value.id})) {
            this.state.users.push(value);
            this.state.searchText = '';
            this.forceUpdate();
        }
    },
    _delUser(index) {
        this.state.users.splice(index, 1);
        this.forceUpdate();
    }
});