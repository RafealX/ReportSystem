/**
 * 报告
 */
import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {FlatButton,Paper, Toolbar,ToolbarGroup,ToolbarTitle,Card, CardActions, CardHeader, IconButton,Dialog,DatePicker,Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,GridList, GridTile,
    CardText, List, ListItem, Divider, Popover, Menu, MenuItem,Step,Stepper,StepLabel,StepContent} from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import {fetch} from 'lib/util';
import popup from 'cpn/popup';
import {style} from '../index.scss';
import pubsub from 'vanilla-pubsub';
import Avatar from 'cpn/Avatar';
import _ from 'lodash';
import Backend from 'lib/backend';
import TeamReportListView from 'cpn/TeamReportList';
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
        TeamReport.reset();
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
        reportRender = (x,i)=>
        <tr key={i}>
        
        <td><span>{(i+1)}</span></td>
        <td>{x.content}&nbsp;&nbsp;</td>
        <td>{x.elapse?x.elapse+'小时  ':''}</td>
        <td>{x.ticket}&nbsp;&nbsp;</td>
        </tr>;    
            
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
        taskRender = (x,i)=>
        <tr>
            <td>{(i+1)+'.'}&nbsp;&nbsp;</td>
            <td>{x.taskname}&nbsp;&nbsp;</td>
            <td>{x.progress?x.progress+'%  ':''}</td>
            <td>{x.elapse?x.elapse+'小时':''}</td>
            <td>{x.description && x.description!=''?'本日没进度':x.summary}</td>
            <td>{x.isdelay ?'延期至':''}</td>
        </tr>;
        let itemRender = (value, k) => 
        <Step active={true} className="step">
        <StepLabel iconContainerStyle={containerStyle}>{new Date(k*1).toLocaleDateString()}</StepLabel>
        <StepContent>
          <Card initiallyExpanded key={k} className="item">
            <CardText expandable>
                <Grid fluid>
                    
                    {value.map((x,i)=>
                        <Row>
                            <Col xs={1} sm={1} md={1} lg={1}>
                                <p className={'f-textvertical f-tc'}>{x.username}</p>
                            </Col>
                            <Col xs={11} sm={11} md={11} lg={11}>
                                <Row>
                                     <Col xs={1} sm={1} md={2} lg={2}>
                                     <p className={'f-textvertical f-tc borderleft'}><span className={'tasktitle'}>任务事项</span></p>
                                    </Col>
                                    <Col xs={11} sm={11} md={9} lg={9}>
                                        <table className={'ui celled small table'} style={{margin:'1em',width:'100%'}}>
                                            <thead>
                                                <tr >
                                                    <th>序号</th>
                                                    <th>任务名</th>
                                                    <th>进度</th>
                                                    <th>耗时</th>
                                                    <th>完成内容</th>
                                                    <th>备注</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {x.taskhistorylist&&x.taskhistorylist.length>0&&x.taskhistorylist.map((row, index) => (
                                                    taskRender(row,index)
                                                ))}
                                            </tbody>
                                        </table> 
                                    </Col>
                                    <Col xs={1} sm={1} md={2} lg={2}>
                                        <p className={'f-textvertical f-tc borderleft'}><span className={'reporttitle'}>普通事项</span></p>
                                    </Col>
                                    <Col xs={11} sm={11} md={9} lg={9}>
                                        <table className={'ui celled small table'} style={{margin:'1em'}}>
                                        <thead>
                                            <tr >
                                                <th>序号</th>
                                                <th>内容</th>
                                                <th>耗时</th>
                                                <th>ticket</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {x.reports&&x.reports.length>0&&x.reports.map((row, index) => (
                                                reportRender(row,index)
                                            ))}
                                        </tbody>
                                        </table>
                                    </Col>
                                </Row>
                            </Col>
                            <Divider style={{display:i==value.length-1?'none':'block',width:'100%'}}/>
                         </Row>
                            
                    )}
                   
                </Grid>
                <Table height={this.state.height} style={{display:'none'}}
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
                            deselectOnClickaway={true}
                            showRowHover={true}
                            stripedRows={false}
                          >
                          {value.map((x,i)=>
                            <TableRow key={i} selected={x.selected}>
                                <TableRowColumn  >{x.username}</TableRowColumn>
                                <TableRowColumn  >{reportRender(x.reports)}</TableRowColumn>
                                <TableRowColumn  >{taskRender(x.taskhistorylist)}</TableRowColumn>
                              </TableRow>  
                            )}
                          
                          </TableBody>
                        </Table>
            </CardText>
            
        </Card>
        </StepContent>
        </Step>
        ;
        return (
            <div className={style}>
                <Paper zDepth={1} style={{backgroundColor:'#fff',height:'56px'}}>
                    <Grid fluid style={{height:'100%'}}>
                        <Row style={{height:'100%'}}>
                            <Col xs={1} sm={1} md={2} lg={2} style={{height:'100%'}}>
                                <p style={{fontSize:'18px',display: 'flex','align-items': 'center','margin-right': '9px',color:'#666',height:'100%'}}>小组日报</p>
                            </Col>
                        </Row>
                    </Grid>
                </Paper>
            <Stepper orientation="vertical" linear={false} children={[]}>
                <TeamReportListView ref="listView" loadList={TeamReport.get} getter={TeamReport.operation.get} formatter={TeamReport.formatter} itemRender={itemRender}/>
            </Stepper>
            </div>
        );
    },
    
    componentWillUnMount() {
        console.log('team report unloaded');
    },

    _sendMail(teamReportId) {
        return fetch(`/api/report/sendMail?teamReportId=${teamReportId}`)
            .then(d => {
                alert('发送成功');
            });
    }
});