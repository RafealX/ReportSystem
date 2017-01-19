/**
 * 小组
 */
import React from 'react';
import {browserHistory} from 'react-router';
import {FlatButton, IconButton, ListItem, Avatar, Subheader, Dialog,
    TextField, Toggle, CircularProgress} from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import SetIcon from 'material-ui/svg-icons/action/settings';
import _ from 'lodash';
import {fetch, checkEnter} from 'lib/util';
import popup from 'cpn/popup';
import Empty from 'cpn/Empty';
import {style} from './index.scss';
import pubsub from 'vanilla-pubsub';

const Teams = function (props) {
    return (
        <ul className="teams">
            {
                props.list.map(t => <li key={t.id}>
                    <h3>{t.name}</h3>
                    <div className="count">
                        <span>成员:{t.memberSize}</span>
                        <span>关注:{t.followSize}</span>
                    </div>
                    {
                        (()=> {
                            if (t.my) {
                                return t.admin ? (
                                    <div className="ops">
                                        <IconButton onTouchTap={props.onDelete.bind(null, t)}>
                                            <DeleteIcon color="#666"/>
                                        </IconButton>
                                        <IconButton onTouchTap={e => browserHistory.push('/m/team/edit/' + t.id)}>
                                            <SetIcon color="#666"/>
                                        </IconButton>
                                    </div>
                                ) : null;
                            } else {
                                return <FlatButton
                                    onClick={props.onFollowChange.bind(null, t)}
                                    primary={!t.followed}
                                    secondary={t.followed}
                                    disabled={!t.canBeFollow}
                                    className="follow"
                                    label={t.followed ? '取消关注' : '关注'}/>
                            }
                        })()
                    }
                </li>)
            }
        </ul>
    );
};

module.exports = React.createClass({
    getInitialState() {
        return {showCreate: false};
    },
    componentDidMount() {
        let barConf = {
            title: '小组',
            iconElementRight: <IconButton onTouchTap={e => this.setState({showCreate: true})}><AddIcon/></IconButton>
        };
        pubsub.publish('config.appBar', barConf);
        this.setState({fetching: true});
        fetch('/api/team/all')
            .then(d => {
                let myTeams = [];
                let otherTeams = [];
                d.teams.forEach(t => {
                    if (t.my) {
                        myTeams.push(t);
                    } else {
                        otherTeams.push(t);
                    }

                });
                this.setState({
                    fetching: false,
                    myTeams: myTeams,
                    otherTeams: otherTeams
                });
            });
    },
    render() {
        let actions = [
            <FlatButton
                label="取消"
                onTouchTap={e => this.setState({showCreate: false})}/>,
            <FlatButton
                primary
                label="确定"
                onTouchTap={this._createTeam}/>
        ];
        return (
            <div className={style}>
                {
                    this.state.fetching
                        ?
                        <CircularProgress style={{display: 'block', margin: '10px auto'}}/>
                        :
                        <div>
                            <Subheader>我所在的小组</Subheader>
                            {
                                this.state.myTeams && this.state.myTeams.length
                                    ?
                                    <Teams list={this.state.myTeams} onDelete={this._deleteTeam}/>
                                    :
                                    <Empty/>
                            }
                            <Subheader>其它小组</Subheader>
                            {
                                this.state.otherTeams && this.state.otherTeams.length
                                    ?
                                    <Teams list={this.state.otherTeams} onFollowChange={this._onFollowChange}/>
                                    :
                                    <Empty/>
                            }
                        </div>
                }
                <Dialog
                    contentStyle={{maxWidth: '450px'}}
                    title="新建小组"
                    actions={actions}
                    open={this.state.showCreate}>
                    <TextField
                        autoFocus
                        hintText="组名"
                        onKeyPress={checkEnter(this._createTeam)}
                        onChange={e => this.state.createName = e.target.value}
                        fullWidth={true}/>
                    <Toggle
                        toggle={!!this.state.createCanBeFollow}
                        onToggle={e => this.setState({createCanBeFollow: e.target.checked})}
                        style={{marginTop: '10px'}}
                        labelPosition="right"
                        label="允许关注"/>
                </Dialog>
            </div>
        );
    },
    _createTeam() {
        if (!this.state.createName) {
            popup.error('小组名不能为空');
            return;
        }
        fetch('/api/team/create', {
            method: 'post',
            body: {
                name: this.state.createName,
                canBeFollow: this.state.createCanBeFollow
            }
        })
            .then(d => {
                this.setState({
                    showCreate: false,
                    createCanBeFollow: false,
                    createName: false
                });
                popup.success('创建成功');
                browserHistory.push('/m/team/edit/' + d.group.id);
            })
            .catch(e => {
                popup.error(e.msg || '小组创建失败');
            });
    },
    _deleteTeam(t) {
        popup.confirm({
            msg: '确定删除小组?',
            onOk: () => {
                fetch('/api/team/delete?teamId=' + t.id)
                    .then(d => {
                        _.remove(this.state.myTeams, {id: t.id});
                        this.forceUpdate();
                        popup.success('删除成功');
                    })
                    .catch(e => {
                        popup.success('删除失败');
                    })
            }
        });
    },
    _onFollowChange(t) {
        let follow = !t.followed;
        let text = follow ? '关注' : '取消关注';
        let change = () => {
            fetch(`/api/team/follow?teamId=${t.id}&follow=${follow}`)
                .then(d => {
                    t.followed = follow;
                    this.forceUpdate();
                    popup.success(`${text}成功`);
                })
                .catch(e => {
                    popup.error(e.msg || `${text}失败`);
                });
        };
        if (!follow) {
            popup.confirm({
                msg: '确定取消关注?',
                onOk: change
            });
        } else {
            change();
        }

    }
});