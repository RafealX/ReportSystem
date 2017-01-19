/**
 * 顶级导航
 */
import React from 'react';
import {Link} from 'react-router';
import {Drawer, List, MakeSelectable, ListItem, RaisedButton} from 'material-ui';
import DescIcn from 'material-ui/svg-icons/action/description';
import TeamIcn from 'material-ui/svg-icons/action/supervisor-account';
import AdminIcn from 'material-ui/svg-icons/action/verified-user';
import {browserHistory} from 'react-router';
import _ from 'lodash';
import popup from 'cpn/popup';
import {fetch} from 'lib/util';
import {style} from './index.scss';
import pubsub from 'vanilla-pubsub';
import Avatar from 'cpn/Avatar';

const SelectableList = MakeSelectable(List);
const navList = ['/m/report/my', '/m/report/team', '/m/team', '/m/group'];
const indexMap = {0: 'list', 2: 'list'};
const innerDiv = {paddingLeft: 50};
const nestStyle = {color: '#555', fontSize: '14px'};

export default React.createClass({
    getInitialState() {
        return {
            open: false,
            current: _.findIndex(navList, x => location.pathname.startsWith(x)),
            loginUser: window._user
        };
    },
    componentWillMount() {
        pubsub.subscribe('loginUser.change', this._upLoginUser);
    },
    componentWillUnmount() {
        pubsub.unsubscribe('loginUser.change', this._upLoginUser);
    },
    _upLoginUser(u) {
        this.setState({loginUser: u});
    },
    render() {
        return (
            <Drawer
                className={style}
                open={this.props.forceOpen || this.props.open}
                onRequestChange={this.props.onRequestChange}>
                <h1>简报</h1>
                <div className="user">
                    <Link to="/m/profile">
                        <Avatar
                            user={this.state.loginUser}
                            className="avatar"/>
                        {this.state.loginUser.nickname}
                    </Link>
                </div>
                <SelectableList
                    style={{display: this.state.loginUser.groupId ? 'block': 'none'}}
                    value={this.state.current}
                    onChange={this._navTo}>
                    <ListItem
                        value={-1}
                        primaryTogglesNestedList
                        initiallyOpen
                        primaryText="简报"
                        leftIcon={<DescIcn/>}
                        innerDivStyle={innerDiv}
                        nestedItems={[
                        <ListItem
                            style={nestStyle}
                            value={0}
                            primaryText="我的简报"/>,
                        <ListItem
                            style={nestStyle}
                            value={1}
                            primaryText="小组简报"/>
                    ]}/>
                    <ListItem
                        value={2}
                        leftIcon={<TeamIcn/>}
                        innerDivStyle={innerDiv}
                        primaryText="小组"/>
                    {this.state.loginUser.groupAdmin ?
                        <ListItem value={3} leftIcon={<AdminIcn/>} innerDivStyle={innerDiv}
                                  primaryText="管理员设置"/> : null}
                </SelectableList>
                <RaisedButton
                    disabled={this.state.loading}
                    onClick={this._logout}
                    className="logout"
                    label={this.state.loading ? '退出中...' : '退出'}
                    secondary/>
            </Drawer>
        );
    },
    _navTo(evt, index) {
        let path = indexMap[index];
        this.setState({current: index});
        browserHistory.push(navList[index] + (path ? '/' + path : ''));
    },
    _logout() {
        this.setState({
            loading: true
        });
        fetch('/api/user/logout')
            .then(d => {
                window._user = {};
                browserHistory.push('/index');
            })
            .catch(e => {
                popup.error('退出失败');
                this.setState({
                    loading: false
                });
            });
    }
});