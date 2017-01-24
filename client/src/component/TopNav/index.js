/**
 * 顶级导航
 */
import React from 'react';
import {Link} from 'react-router';
import {Drawer, List, MakeSelectable, ListItem, RaisedButton,Divider} from 'material-ui';
import DescIcn from 'material-ui/svg-icons/action/description';
import ContentPaste from 'material-ui/svg-icons/content/content-paste';
import TeamIcn from 'material-ui/svg-icons/action/supervisor-account';
import AdminIcn from 'material-ui/svg-icons/action/verified-user';
import FaceIcn from 'material-ui/svg-icons/action/face';
import TeamateIcn from 'material-ui/svg-icons/Social/people';
import ErrorIcn from 'material-ui/svg-icons/Alert/error';
import {browserHistory} from 'react-router';
import _ from 'lodash';
import popup from 'cpn/popup';
import Logout from 'cpn/Logout';
import {fetch} from 'lib/util';
import {style} from './index.scss';
import pubsub from 'vanilla-pubsub';
import Avatar from 'cpn/Avatar';

const SelectableList = MakeSelectable(List);
const navList = 
    ['/m/report/my', '/m/report/team', '/m/task/my', '/m/task/team','/m/group','/m/privilege'];
const indexMap = {0: 'list', 2: 'list'};
const innerDiv = {paddingLeft: 50};
const nestStyle = {color: '#555', fontSize: '14px'};

export default React.createClass({
    getInitialState() {
        console.log(_.findIndex(navList, x => location.pathname.startsWith(x)));
        return {
            open: false,
            current: _.findIndex(navList, x => location.pathname.startsWith(x)),
            loginUser: {nickname:'hztest'} || window._user
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
                <h2>云音乐的工作日记</h2>
                <div className="user">
                    <Link to="/m/profile" style={{marginLeft:'20px'}}>
                        {this.state.loginUser.nickname}
                    </Link>
                    {this.state.loginUser ? <Logout user={this.state.loginUser} title="退出"/>:null}
                </div>
                <Divider />
                <SelectableList
                    style={{display: this.state.loginUser.groupId ? 'block': 'block'}}
                    value={this.state.current}
                    onChange={this._navTo}>
                    <ListItem
                        value={-1}
                        primaryTogglesNestedList
                        primaryText="工作日记"
                        leftIcon={<DescIcn/>}
                        innerDivStyle={innerDiv}
                        nestedItems={[
                        <ListItem
                            style={nestStyle}
                            value={0}
                            leftIcon={<FaceIcn/>}
                            innerDivStyle={innerDiv}
                            primaryText="我的"/>,
                        <ListItem
                            style={nestStyle}
                            value={1}
                            innerDivStyle={innerDiv}
                            leftIcon={<TeamateIcn/>}
                            primaryText="小组"/>
                    ]}/>
                    <ListItem
                        primaryTogglesNestedList                        
                        primaryText="任务"
                        leftIcon={<ContentPaste/>}
                        innerDivStyle={innerDiv}
                        nestedItems={[
                        <ListItem
                            style={nestStyle}
                            value={2}
                             leftIcon={<FaceIcn/>}
                            innerDivStyle={innerDiv}
                            primaryText="我的"/>,
                        <ListItem
                            style={nestStyle}
                            value={3}
                            innerDivStyle={innerDiv}
                            leftIcon={<TeamateIcn/>}
                            primaryText="小组"/>
                    ]}/>
                    <ListItem
                        primaryTogglesNestedList
                        primaryText="管理员"
                        leftIcon={<AdminIcn/>}
                        innerDivStyle={innerDiv}
                        nestedItems={[
                        <ListItem
                            style={nestStyle}
                            value={5}
                            innerDivStyle={innerDiv}
                            leftIcon={<TeamateIcn/>}
                            primaryText="小组设置"/>,
                        <ListItem
                            style={nestStyle}
                            value={6}
                            innerDivStyle={innerDiv}
                            leftIcon={<ErrorIcn/>}
                            primaryText="权限设置"/>
                    ]}/>
                </SelectableList>
            </Drawer>
        );
    },
    _navTo(evt, index) {
        let path = indexMap[index];
        console.log(evt,index);
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