/**
 * 报告
 */
import React from 'react';
import {FlatButton, Toolbar,ToolbarGroup,ToolbarTitle,Card, CardActions, CardHeader, IconButton,Dialog,DatePicker,Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,GridList, GridTile,
    CardText, List, ListItem, Divider, Popover, Menu, MenuItem,Step,Stepper,StepLabel,StepContent} from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import {fetch} from 'lib/util';
import popup from 'cpn/popup';
import {style} from '../index.scss';
import pubsub from 'vanilla-pubsub';
import Avatar from 'cpn/Avatar';
import _ from 'lodash';
import Backend from 'lib/backend';
import ListView from 'cpn/ListView';
import {TeamReport} from './model';

/*
     <Stepper orientation="vertical" linear={false} children={[]}>
                    <ListView ref="listView" loadList={TeamReport.get} getter={TeamReport.operation.get} formatter={TeamReport.formatter} itemRender={itemRender}/>
                </Stepper>
 */
const containerStyle = {
    display:'none'
}
let groupid = 12;

module.exports = React.createClass({
    getInitialState() {
        return {rps: [], teamMap: {}, userMap: {}};
    },
    componentDidMount() {
        let barConf = {
            title: '小组日报',
            titleStyle:{
                fontSize:'16px',
                marginLeft:'-20px'
            },
            iconElementLeft:<IconButton style={{visibility:'hidden'}} ><AddIcon color={'#fff'}/></IconButton>,
        };
        pubsub.publish('config.appBar', barConf);
    },
    render() {
       let reportRender = (arr)=>{
            return arr.map((x,i)=>{
                return (<div>
                <span>{i+1}&nbsp;&nbsp;</span>
                <span>{x.content}&nbsp;&nbsp;</span>
                <span>{x.elapse?x.elapse+'小时  ':''}</span>
                <span>{x.ticket}&nbsp;&nbsp;</span>
                </div>);
            })
       }
            
            
        let taskRender = (arr)=>{
            return arr.map((x,i)=>{
                return (<div>
                        <span>{i+1}&nbsp;&nbsp;</span>
                        <span>{x.name}&nbsp;&nbsp;</span>
                        <span>{x.progress?x.progress+'%  ':''}</span>
                        <span>{x.elapse?x.elapse+'小时':''}</span>
                        <h4 style={{fontWeight:'normal',lineHeight:'20px',marginLeft: '18px'}}>问题：{x.question}</h4>
                        <h4 style={{fontWeight:'normal',lineHeight:'20px',marginLeft: '18px'}}>总结：{x.summary}</h4>
                        </div>);
            })
        };
        let itemRender = (x, i) => 
        <Step active={true} className="step">
        <StepLabel iconContainerStyle={containerStyle}>{new Date(x.time).toLocaleDateString()}</StepLabel>
        <StepContent>
          <Card initiallyExpanded key={i} className="item">
            <CardHeader
                showExpandableButton
                className="header" style={{'display':'none'}}
                title={x.time}/>
            <CardText expandable>
                <Table
                          height={this.state.height}
                        >
                          <TableHeader displaySelectAll={false}
                          >
                            <TableRow>
                              <TableHeaderColumn  >名字</TableHeaderColumn>
                              <TableHeaderColumn  >普通事项</TableHeaderColumn>
                              <TableHeaderColumn  >任务事项</TableHeaderColumn>
                            </TableRow>
                          </TableHeader>
                          <TableBody
                            displayRowCheckbox={false}
                            deselectOnClickaway={true}
                            showRowHover={true}
                            stripedRows={false}
                          >
                            {x.details.map( (row, index) => (
                              <TableRow key={index}  selected={row.selected}>
                                <TableRowColumn  >{row.name}</TableRowColumn>
                                <TableRowColumn  >{reportRender(row.reports)}</TableRowColumn>
                                <TableRowColumn  >{taskRender(row.tasks)}</TableRowColumn>
                              </TableRow>
                              ))}
                          </TableBody>
                        </Table>
            </CardText>
            
        </Card>
        </StepContent>
        </Step>
        ;
        return (
            <div className={style}>
               小组日报
            </div>
        );
    },
    _loadList(data) {
        return Backend.report.team.get(data);
        //return fetch('/api/report/my?limit=${limit}&offset=${offset}');
    },
    _sendMail(teamReportId) {
        return fetch(`/api/report/sendMail?teamReportId=${teamReportId}`)
            .then(d => {
                alert('发送成功');
            });
    }
});