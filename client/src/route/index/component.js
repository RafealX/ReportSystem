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
    render() {
        return (
            <div className={style}>
                <div className="banner">
                    <h1>简报</h1>
                    <p>简单好用的日报、周报、月报管理系统</p>
                    <p>免费的信息同步工具</p>
                    <div className="btn">
                        <RaisedButton onClick={e => browserHistory.push('/account/login')} label="登录" labelColor={labelColor} style={btnStyle}/>
                    </div>
                </div>
            </div>
        );
    }
});