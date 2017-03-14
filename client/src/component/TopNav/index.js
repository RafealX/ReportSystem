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
import BugIcn from 'material-ui/svg-icons/action/bug-report';
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
    ['/m/report/my/edit', '/m/report/my/list','/m/report/team', '/m/task/my/list','/m/group','/m/privilege','/m/feedback'];


const indexMap = {0: 'list', 1: 'list'};
const innerDiv = {paddingLeft: 50};
const nestStyle = {color: '#555', fontSize: '14px'};
let isfirst = true;
export default React.createClass({
    getInitialState() {
        console.log(_.findIndex(navList, x => location.pathname.startsWith(x)));

        return {
            open: false,
            current: _.findIndex(navList, x => location.pathname.startsWith(x)),
            loginUser: window.user || {nickname:'hztest'}
        };
    },
    componentWillReceiveProps(nextProps, nextState) {
        console.log('componentWillReceiveProps',_.findIndex(navList, x => location.pathname.startsWith(x)));
        this.setState({current:_.findIndex(navList, x => location.pathname.startsWith(x))});
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
                className={style}  overlayStyle={{boxShadow:'rgba(0, 0, 0, 0.156863) 0px 3px 0px, rgba(0, 0, 0, 0.227451) 0px 3px 3px'}}
                open={this.props.forceOpen || this.props.open}
                onRequestChange={this.props.onRequestChange}>
                <div className="logo f-tc f-textvertical">
                    <div >
                        <svg viewBox="0 0 160 160" >
                            <path d="M142.666,61.867C134.133,49.6,121.334,41.333,108,39.2c-2.4-0.267-4.8-0.534-7.467-0.534c-0.8-3.2-1.6-6.4-2.4-9.333
                                c0-0.267-1.333-6.4,4.801-9.6c3.467-1.867,6.934-1.6,10.666,0.8c4,2.934,9.867,1.867,12.801-2.133
                                c2.934-4.267,1.866-9.867-2.134-12.8C114.934-1.066,104-1.6,94.4,3.733C82.133,10.4,78.4,24,80.8,33.867
                                c0.534,2.667,1.333,5.6,2.134,8.267C77.6,44.267,72.267,47.2,67.2,51.2c-14.934,11.466-22.934,34.667-10.667,53.333
                                c8.534,12.533,24.267,16.533,38.4,9.867C106.4,109.066,116,95.733,111.467,78.133c-0.267-1.867-1.334-5.6-4.267-15.733
                                c-0.534-1.6-0.8-3.2-1.333-5.066C114.4,58.667,122.4,64.267,128,72.267c6.934,9.866,10.4,31.733-3.2,48.267
                                c-9.866,12-23.466,19.467-38.399,20.801c-14.667,1.332-29.067-3.467-40.8-13.334c-11.733-10.133-18.934-26.133-18.934-42.133
                                c0-11.201,3.467-27.467,19.733-41.601c1.6-1.6,9.867-6.933,15.733-9.6c4.533-1.867,6.667-7.466,4.8-12
                                c-1.866-4.533-7.466-6.933-12-4.8c-7.2,3.2-17.066,9.333-20.8,12.8C17.333,45.067,8,64.533,8,85.867
                                c0,21.6,9.6,42.399,25.333,56.266C48.8,155.2,68,161.6,87.467,159.733c19.733-1.866,37.867-11.467,50.934-27.2
                                C157.066,109.6,154.4,79.2,142.666,61.867 M86.934,97.867C82.133,100.267,75.2,100,71.2,94.4c-6.4-9.601-1.6-22.134,6.667-28.534
                                c3.2-2.4,6.4-4.267,9.6-5.6c0.8,2.667,1.333,5.067,2.133,7.467c1.601,6.133,3.467,12.533,3.734,13.866v0.533l0.266,0.533
                                C96.267,92.267,89.867,96.533,86.934,97.867"/>
                            </svg>
                        <h3>云音乐工作日报</h3>
                    </div>
                </div>

                <div className="user">
                    <span style={{marginLeft:'20px'}}>{this.state.loginUser.name}</span>
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
                        primaryText="工作日报"
                        leftIcon={<DescIcn/>}
                        innerDivStyle={innerDiv}
                        nestedItems={[
                        <ListItem
                            style={nestStyle}
                            value={0}
                            leftIcon={<FaceIcn/>}
                            innerDivStyle={innerDiv}
                            primaryText="编写日报"/>,
                        <ListItem
                            style={nestStyle}
                            value={1}
                            innerDivStyle={innerDiv}
                            leftIcon={<DescIcn/>}
                            primaryText="我的日报"/>,
                        <ListItem
                            style={nestStyle}
                            value={2}
                            innerDivStyle={innerDiv}
                            leftIcon={<TeamateIcn/>}
                            primaryText="小组日报"/>
                    ]}/>
                    <ListItem
                        primaryTogglesNestedList                        
                        primaryText="任务"
                        leftIcon={<ContentPaste/>}
                        innerDivStyle={innerDiv}
                        nestedItems={[
                        <ListItem
                            style={nestStyle}
                            value={3}
                             leftIcon={<FaceIcn/>}
                            innerDivStyle={innerDiv}
                            primaryText="我的"/>
                    ]}/>
                    <ListItem
                        primaryTogglesNestedList
                        primaryText="权限管理"
                        leftIcon={<AdminIcn/>} style={{display:window.user.role==1?'none':''}}
                        innerDivStyle={innerDiv}
                        nestedItems={[
                        <ListItem
                            style={nestStyle}
                            value={4}
                            innerDivStyle={innerDiv}
                            leftIcon={<TeamateIcn/>}
                            primaryText="小组设置"/>,
                        <ListItem
                            style={nestStyle}
                            value={5} style={{display:window.user.role<3?'none':''}}
                            innerDivStyle={innerDiv}
                            leftIcon={<ErrorIcn/>}
                            primaryText="管理员设置"/>
                    ]}/>
                    <ListItem
                        primaryText="吐槽和建议" value={6}
                        leftIcon={<BugIcn/>}
                        innerDivStyle={innerDiv}/>
                </SelectableList>
            </Drawer>
        );
    },
    _navTo(evt, index) {
        console.log(evt,index);
        this.setState({current: index});
        browserHistory.push(navList[index]);
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