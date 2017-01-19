/**
 * 报告
 */
import React from 'react';
import {FlatButton, Card, CardActions, CardHeader, IconButton,
    CardText, List, ListItem, Divider, Popover, Menu, MenuItem} from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import {fetch} from 'lib/util';
import popup from 'cpn/popup';
import {style} from '../index.scss';
import pubsub from 'vanilla-pubsub';
import ListView from 'cpn/ListView';
import Avatar from 'cpn/Avatar';

module.exports = React.createClass({
    getInitialState() {
        return {rps: [], teamMap: {}, userMap: {}};
    },
    componentDidMount() {
        let barConf = {
            title: '小组简报'
        };
        pubsub.publish('config.appBar', barConf);
    },
    render() {
        let itemRender = (x, i) => <Card initiallyExpanded key={i} className="item">
            <CardHeader
                showExpandableButton
                title={this.state.teamMap[x.teamId].name}
                subtitle={x.periodDesc}/>
            <CardText expandable className="team">
                {
                    x.list.map(y => <div key={y._id} className="inner-item">
                        <Avatar
                            user={this.state.userMap[y.userId]}
                            className="avatar"/>
                        <h3 className="name">{this.state.userMap[y.userId].nickname}</h3>
                        <div className="content" dangerouslySetInnerHTML={{__html: y.content}}></div>
                    </div>)
                }
            </CardText>
            <CardActions>
                <FlatButton onTouchTap={this._sendMail.bind(this, x.id)} disabled={!x.admin} primary label="邮件抄送"/>
                {
                    x.notSend && x.notSend.length
                        ?
                        <div className="not">
                            <label>暂未收到:</label>
                            {x.notSend.map(uid => <Avatar key={uid} size={30} user={this.state.userMap[uid]}/>)}
                        </div>
                        :
                        null
                }
            </CardActions>
        </Card>;
        return (
            <div className={style}>
                <ListView loadList={this._loadList} itemRender={itemRender}/>
            </div>
        );
    },
    _loadList(limit, offset) {
        return fetch(`/api/report/team?limit=${limit}&offset=${offset}`)
            .then(d => {
                Object.assign(this.state.teamMap, d.teamMap);
                Object.assign(this.state.userMap, d.userMap);
                return {
                    list: d.list
                };
            });
    },
    _sendMail(teamReportId) {
        return fetch(`/api/report/sendMail?teamReportId=${teamReportId}`)
            .then(d => {
                alert('发送成功');
            });
    }
});