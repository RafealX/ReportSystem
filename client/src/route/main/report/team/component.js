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
        let itemRender = (value, k) => 
        <Step active={true} className="step">
        <StepLabel iconContainerStyle={containerStyle}>{new Date(k*1).toLocaleDateString()}</StepLabel>
        <StepContent>
          <Card initiallyExpanded key={k} className="item">
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
                <Toolbar style={{backgroundColor:'#7cccb5'}}>
                    <ToolbarGroup firstChild={true}> 
                    <FlatButton labelStyle={{color:'#fff'}} hoverColor="rgba(0,0,0,0)" disabled={true}
                      label="新增工作日记" 
                      primary={true} style={{marginLeft:'0px'}} style={{'cursor':'default',height:'100%',padding:0,margin:0}}
                    />
                    </ToolbarGroup>
                    </Toolbar>
            <Stepper orientation="vertical" linear={false} children={[]}>
                <TeamReportListView ref="listView" loadList={TeamReport.get} getter={TeamReport.operation.get} formatter={TeamReport.formatter} itemRender={itemRender}/>
            </Stepper>
            </div>
        );
    },

    _sendMail(teamReportId) {
        return fetch(`/api/report/sendMail?teamReportId=${teamReportId}`)
            .then(d => {
                alert('发送成功');
            });
    }
});