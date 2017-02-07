/**
 * 首页
 */
import React from 'react';
import {RaisedButton} from 'material-ui';
import {browserHistory} from 'react-router';
import {style} from './index.scss';

const labelColor = '#00bcd4';
const btnStyle = {marginRight: '20px'};

module.exports = React.createClass({
    getInitialState() {
        let next = this.props.location.state;
        let defaultState = {continue:next&&next.nextState?next.nextState:'/m/report/my/list'};
        console.log(defaultState);
        return defaultState;
    },
    render() {
        return (
            <div className={style}>
                <div className="banner">
                    <h1>云音乐工作日报</h1>
                    <p>基于任务的日报系统</p>
                    <div className="btn">
                        <form action="/api/user/login/openid" method="POST">
                            <input ref="login" type="hidden" name="last"  value={this.state.continue}/>
                            <RaisedButton type="submit" label="OpenID登录" labelColor={labelColor} style={btnStyle}/>
                        </form>
                        
                    </div>
                </div>
            </div>
        );
    }
});