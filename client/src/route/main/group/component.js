/**
 * 群组
 */
import React from 'react';
import {FlatButton, IconButton, TextField, Toggle, Avatar, Table, Card,
    TableHeader, TableRow, TableRowColumn, TableHeaderColumn, TableBody,
    CardHeader, CardText, CardActions, Checkbox, Dialog} from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import SetIcon from 'material-ui/svg-icons/action/settings';
import _ from 'lodash';
import {fetch, checkEnter} from 'lib/util';
import popup from 'cpn/popup';
import UserSearch from 'cpn/UserSearch';
import {style} from './index.scss';
import pubsub from 'vanilla-pubsub';

module.exports = React.createClass({
    getInitialState() {
        return {showAdd: false};
    },
    componentDidMount() {
        let barConf = {
            title: '组织设置'
        };
        pubsub.publish('config.appBar', barConf);
        fetch('/api/group/get?id=' + _user.groupId)
            .then(data => {
                this.setState({
                    info: data.info,
                    name: data.info.name,
                    members: data.members
                });
            })
            .catch(e => {

            });
    },
    render() {
        let disableSave = !this.state.name || this.state.info.name == this.state.name;
        let actions = [
            <FlatButton
                label="取消"
                onTouchTap={e => this.setState({showAdd: false})}/>,
            <FlatButton
                primary
                label="确定"
                onTouchTap={this._addMember}/>
        ];
        return (
            <div className={style}>
                <div className="box">
                    <Card className="card">
                        <CardHeader title="基本信息" style={{paddingBottom: 0}}/>
                        <CardText style={{paddingTop: 0}}>
                            <TextField
                                name="name"
                                value={this.state.name || ''}
                                onKeyPress={checkEnter(this._saveInfo)}
                                onChange={e => this.setState({name: e.target.value})}
                                className="text"
                                hintText="请输入名称"
                                floatingLabelText="组织名称"/>
                        </CardText>
                        <CardActions>
                            <FlatButton primary onClick={this._saveInfo} disabled={disableSave} label="保存"/>
                        </CardActions>
                    </Card>
                    <Card className="card">
                        <CardHeader title="组织成员" style={{paddingBottom: 0}}>
                            <IconButton
                                style={{position: 'absolute', right: 0,top:0}}
                                onTouchTap={e => this.setState({showAdd: true})}>
                                <AddIcon/>
                            </IconButton>
                        </CardHeader>
                        <CardText>
                            <Table>
                                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                                    <TableRow>
                                        <TableHeaderColumn>序号</TableHeaderColumn>
                                        <TableHeaderColumn>姓名</TableHeaderColumn>
                                        <TableHeaderColumn>组织管理员</TableHeaderColumn>
                                        <TableHeaderColumn>操作</TableHeaderColumn>
                                    </TableRow>
                                </TableHeader>
                                <TableBody displayRowCheckbox={false}>
                                    {
                                        this.state.members &&
                                        this.state.members.map((m, i) =>
                                            <TableRow key={m.id} selectable={false}>
                                                <TableRowColumn>{i + 1}</TableRowColumn>
                                                <TableRowColumn>{m.nickname}</TableRowColumn>
                                                <TableRowColumn>
                                                    <Checkbox
                                                        disabled={m.id == _user.id}
                                                        onCheck={this._updateRole.bind(this, m)}
                                                        checked={m.admin}/>
                                                </TableRowColumn>
                                                <TableRowColumn>
                                                    <FlatButton
                                                        secondary
                                                        disabled={m.id == _user.id}
                                                        onClick={this._delMember.bind(this, m)}
                                                        label="删除"/>
                                                </TableRowColumn>
                                            </TableRow>
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </CardText>
                    </Card>
                </div>
                <Dialog
                    contentStyle={{maxWidth: '450px'}}
                    title="添加组织成员"
                    actions={actions}
                    open={this.state.showAdd}>
                    <TextField
                        autoFocus
                        hintText="请输入用户邮箱帐号"
                        onChange={e => this.state.addMail = e.target.value}
                        onKeyPress={checkEnter(this._addMember)}
                        fullWidth={true}/>
                </Dialog>
            </div>
        );
    },
    _saveInfo() {
        fetch('/api/group/update', {method: 'post', body: {name: this.state.name}})
            .then(data => {
                this.state.info.name = this.state.name;
                this.setState({
                    info: this.state.info
                });
                popup.success('保存成功');
            });
    },
    _addMember() {
        fetch('/api/group/addMember', {method: 'post', body: {mail: this.state.addMail}})
            .then(data => {
                this.state.members.unshift(data.user);
                this.setState({members: this.state.members, showAdd: false, addMail: ''}, () => {
                    popup.success('添加成功');
                });
            })
            .catch(e => {
                popup.error(e.msg);
            });
    },
    _delMember(m) {
        if (m.id == _user.id) {
            popup.error('不能删除自己');
            return;
        }
        popup.confirm({
            msg: '确定删除?', onOk: () => {
                fetch('/api/group/delMember', {method: 'post', body: {id: m.id}})
                    .then(data => {
                        _.remove(this.state.members, {id: m.id});
                        this.setState({members: this.state.members});
                        popup.success('删除成功');
                    })
                    .catch(e => {
                        popup.error(e.msg);
                    });
            }
        });
    },
    _updateRole(m, e) {
        let checked = e.target.checked;
        fetch('/api/group/updateRole', {method: 'post', body: {userId: m.id, admin: checked}})
            .then(data => {
                m.admin = checked;
                this.setState({members: this.state.members});
            })
            .catch(e => {
                popup.error(e.msg);
            });
    }
});