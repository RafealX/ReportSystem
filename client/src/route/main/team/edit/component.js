/**
 * 群组
 */
import React from 'react';
import {FlatButton, IconButton, TextField, Toggle, Avatar, Table, Card,
    TableHeader, TableRow, TableRowColumn, TableHeaderColumn, TableBody,
    CardHeader, CardText, CardActions, Checkbox} from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import SetIcon from 'material-ui/svg-icons/action/settings';
import _ from 'lodash';
import UserSearch from 'cpn/UserSearch';
import popup from 'cpn/popup';
import {fetch} from 'lib/util';
import {style} from './index.scss';
import pubsub from 'vanilla-pubsub';

module.exports = React.createClass({
    getInitialState() {
        return {info: {}, members: [], follows: []};
    },
    componentDidMount() {
        let barConf = {
            title: '小组设置'
        };
        pubsub.publish('config.appBar', barConf);
        fetch('/api/team/get?teamId=' + this.props.params.id)
            .then(d => {
                this.setState({
                    info: d.info,
                    name: d.info.name,
                    mails: d.info.mails,
                    follows: d.follows,
                    members: d.members
                });
            });
    },
    render() {
        let barConf = {
            title: '编辑小组'
        };
        return (
            <div className={style} barConf={barConf}>
                <div className="box">
                    <Card className="card">
                        <CardHeader title="基本信息" style={{paddingBottom: 0}}/>
                        <CardText style={{paddingTop: 0}}>
                            <TextField
                                value={this.state.name || ''}
                                onChange={e => this.setState({name: e.target.value})}
                                className="text"
                                hintText="请输入名称"
                                floatingLabelText="组名"/>
                            <br/>
                            <TextField
                                multiLine
                                value={this.state.mails || ''}
                                onChange={e => this.setState({mails: e.target.value})}
                                className="text"
                                hintText="请输入,多个用分号分割"
                                rowsMax={2}
                                floatingLabelText="邮件列表"/>
                        </CardText>
                        <CardActions>
                            <FlatButton
                                disabled={this._disableEdit()}
                                primary
                                onClick={this._saveInfo}
                                label="保存"/>
                        </CardActions>
                    </Card>
                    <Card className="card">
                        <CardHeader title="小组成员" style={{paddingBottom: 0}}>
                            <IconButton
                                style={{position: 'absolute', right: 0,top:0}}
                                onTouchTap={this._addMember}>
                                <AddIcon/>
                            </IconButton>
                        </CardHeader>
                        <CardText>
                            <Table>
                                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                                    <TableRow>
                                        <TableHeaderColumn>序号</TableHeaderColumn>
                                        <TableHeaderColumn>姓名</TableHeaderColumn>
                                        <TableHeaderColumn>小组管理员</TableHeaderColumn>
                                        <TableHeaderColumn>操作</TableHeaderColumn>
                                    </TableRow>
                                </TableHeader>
                                <TableBody displayRowCheckbox={false}>
                                    {
                                        this.state.members.map((m, i) => <TableRow key={m.id} selectable={false}>
                                            <TableRowColumn>{i + 1}</TableRowColumn>
                                            <TableRowColumn>{m.nickname}</TableRowColumn>
                                            <TableRowColumn>
                                                <Checkbox
                                                    disabled={m.id == _user.id}
                                                    onCheck={this._updateRole.bind(this, m)}
                                                    checked={!!m.admin}/>
                                            </TableRowColumn>
                                            <TableRowColumn>
                                                <FlatButton
                                                    secondary
                                                    onTouchTap={this._delMember.bind(this, m,i)}
                                                    label="删除"/>
                                            </TableRowColumn>
                                        </TableRow>)
                                    }
                                </TableBody>
                            </Table>
                        </CardText>
                    </Card>
                    <Card className="card">
                        <CardHeader title="关注设置" style={{paddingBottom: 0}}/>
                        <CardText>
                            <Toggle
                                toggled={!!this.state.info.canBeFollow}
                                onToggle={this._followSetChange}
                                labelPosition="right"
                                label="允许关注"/>
                            {
                                this.state.follows.length && this.state.info.canBeFollow
                                    ?
                                    <div className="avatars">
                                        {
                                            this.state.follows.map(u => <Avatar>{u.nickname[u.nickname.length-1]}</Avatar>)
                                        }
                                    </div>
                                    :
                                    null
                            }
                        </CardText>
                    </Card>
                </div>
                <UserSearch ref="search" onOk={this._memberResult}/>
            </div>
        );
    },
    _disableEdit() {
        return !this.state.name
            || (this.state.name == this.state.info.name
            && this.state.mails == this.state.info.mails);
    },
    _addMember() {
        this.refs.search.toggle(true);
    },
    _saveInfo() {
        fetch('/api/team/update', {
            method: 'post', body: {
                teamId: this.props.params.id,
                name: this.state.name,
                mails: this.state.mails
            }
        })
            .then(data => {
                this.state.info.name = this.state.name;
                this.state.info.mails = this.state.mails;
                this.forceUpdate();
                popup.success('保存成功');
            });
    },
    _memberResult(users) {
        if (!users.length) {
            popup.error('请选择用户');
            return;
        }
        let newMembers = users.filter(u => !_.find(this.state.members, {id: u.id}));
        if (!newMembers.length) return;
        fetch('/api/team/addMember', {
            method: 'post',
            body: {
                teamId: this.props.params.id,
                ids: newMembers.map(u => u.id)
            }
        })
            .then(d => {
                Array.prototype.push.apply(this.state.members, newMembers);
                this.forceUpdate();
                popup.success('添加成功');
            })
            .catch(e => {
                popup.error('添加失败');
            });
    },
    _delMember(user, index) {
        popup.confirm({
            msg: '确定删除?', onOk: () => {
                fetch('/api/team/delMember', {
                    method: 'post',
                    body: {
                        teamId: this.props.params.id,
                        userId: user.id
                    }
                })
                    .then(d => {
                        this.state.members.splice(index, 1);
                        this.forceUpdate();
                        popup.success('删除成功');
                    })
                    .catch(e => {
                        popup.error('删除失败');
                    });
            }
        });
    },
    _updateRole(m, e) {
        let checked = e.target.checked;
        fetch('/api/team/updateRole', {
            method: 'post',
            body: {
                teamId: this.props.params.id,
                userId: m.id, admin: checked
            }
        })
            .then(d => {
                m.admin = checked;
                this.forceUpdate();
                popup.success('操作成功');
            })
            .catch(e => {
                popup.error(e.msg);
            });
    },
    _followSetChange(e) {
        let canBeFollow = e.target.checked;
        fetch('/api/team/update', {
            method: 'post',
            body: {
                teamId: this.props.params.id,
                canBeFollow: canBeFollow
            }
        })
            .then(d => {
                this.state.info.canBeFollow = canBeFollow;
                this.forceUpdate();
                popup.success('操作成功');
            })
            .catch(e => {
                popup.error(e.msg);
            });
    }
});