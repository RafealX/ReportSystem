/**
 * 头像组件
 */
import React from 'react';
import {Avatar} from 'material-ui';

export default React.createClass({
    render() {
        let {avatarUrl, nickname} = this.props.user;
        return (<Avatar
            style={this.props.style}
            size={this.props.size}
            className={this.props.className}>
            {nickname ? nickname.charAt(nickname.length - 1) : ''}
        </Avatar>);
    }
});