/**
 * 进入引导
 */
import React from 'react';
import {style} from './index.scss';
import CreateGroup from './createGroup';
import pubsub from 'vanilla-pubsub';

const barConf = {title: '欢迎加入'};

module.exports = React.createClass({
    componentDidMount() {
        pubsub.publish('config.appBar', barConf);
    },
    render() {
        return (
            <div className={style}>
                <h2>你还未找到组织哦~</h2>
                <p>请联系组织管理员或<a onClick={this._create}>创建一个新组织</a></p>
                <CreateGroup ref="dialog"/>
            </div>
        );
    },
    _create() {
        this.refs.dialog.toggle(true);
    }
});