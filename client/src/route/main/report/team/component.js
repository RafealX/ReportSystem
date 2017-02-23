/**
 * 报告
 */
import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {FlatButton,Paper,TextField,RaisedButton, Toolbar,ToolbarGroup,ToolbarTitle,Card, CardActions, CardHeader, IconButton,Dialog,DatePicker,Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,GridList, GridTile,
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
const PaperStyle = {
    boxShadow:'rgba(0, 0, 0, 0.117647) 0px 0px 0px, rgba(0, 0, 0, 0.117647) 0px 0px 4px',
    backgroundColor:'#fff',
    height:'56px',
    borderRadius:0
}
let groupid = 12;
let isfirstLoad = true;
module.exports = React.createClass({
    getInitialState() {
        TeamReport.reset();
        return {rps: [], teamMap: {}, userMap: {},memberload:false,saving:false,team:TeamReport};
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
        if(isfirstLoad){
            TeamReport.init(function(){
                //console.log('111');
                this.setState({memberload:true});
            }.bind(this));
            isfirstLoad = false;
        }
        let reportRender = (x,i)=>
            <tr key={i}>
            
            <td>{x.content}&nbsp;&nbsp;</td>
            <td>{x.elapse?x.elapse+'小时  ':''}</td>
            <td>{x.ticket}&nbsp;&nbsp;</td>
            </tr>;
            
        let taskRender = (x,i)=>
            <tr>
                <td>{x.taskname}&nbsp;&nbsp;</td>
                <td>{x.progress?x.progress+'%  ':''}</td>
                <td>{x.elapse?x.elapse+'小时':''}</td>
                <td>{x.content && x.content!=''?x.content:(<span className={"noprogress"}>本日没进度</span>)}</td>
                <td>{x.delay&&x.delaytotime?(x.delay>0?(<span className={"isdelay"}>{'延期至'+(new Date(x.delaytotime).toLocaleDateString())}{}</span>):(<span className={"isndelay"}>{'提前至'+(new Date(x.delaytotime).toLocaleDateString())}{}</span>)):''}</td>
            </tr>
        ;
        let itemRender = (value, k) => 
        <Step active={true} className="step">
        <StepLabel iconContainerStyle={containerStyle}>{new Date(k*1).toLocaleDateString()}</StepLabel>
        <StepContent>
          <Card initiallyExpanded key={k} className="item" style={{boxShadow:'rgba(0, 0, 0, 0.117647) 0px 0px 1px, rgba(0, 0, 0, 0.117647) 0px 0px 1px'}}>
            <CardText expandable>
                <Grid fluid>
                    
                    {value.map((x,i)=>
                        <Row >
                            <Col xs={1} sm={1} md={1} lg={1}>
                            <p className={'f-textvertical f-tc'}><span className={'username'}>{x.username}</span></p>
                            </Col>
                            <Col xs={11} sm={11} md={11} lg={11}>
                                <Row>

                                     <Col xs={1} sm={1} md={2} lg={2}>
                                     <p style={{display:x.taskhistorylist&&x.taskhistorylist.length>0?'':'none'}} className={'f-textvertical f-tc borderleft'}><span className={'tasktitle'}>任务事项</span></p>
                                    </Col>
                                    <Col xs={11} sm={11} md={9} lg={9}>
                                    {x.taskhistorylist&&x.taskhistorylist.length>0?(
                                        <table className={'ui celled small table'} style={{margin:'1em',width:'100%'}}>
                                            <thead>
                                                <tr >
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
                                        ):(null)}
                                        
                                    </Col>
                                    <Col xs={1} sm={1} md={2} lg={2}>
                                        <p style={{display:x.reports&&x.reports.length>0?'':'none'}} className={'f-textvertical f-tc borderleft'}><span className={'reporttitle'}>普通事项</span></p>
                                    </Col>
                                    <Col xs={11} sm={11} md={9} lg={9}>
                                        {x.reports&&x.reports.length>0?(
                                            <table className={'ui celled small table'} style={{margin:'1em'}}>
                                        <thead>
                                            <tr >
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
                                            ):(null)}
                                        
                                    </Col>
                                    {x.withnullconent?(
                                        <Col xs={12} sm={12} md={12} lg={12} style={{marginTop:'1em',width:'100%'}}>
                                            <Row>
                                                <Col xs={9} sm={9} md={10} lg={10}>
                                                    <TextField key={x.id}
                                                      fullWidth={true}
                                                      name="currentprogress"
                                                      hintText={'今日还未写日报，组长可在此写明原因'}
                                                      onChange={(e,n)=>{x.others = n;this.forceUpdate();}} />
                                                </Col>
                                                <Col xs={3} sm={3} md={2} lg={2}>
                                                     <RaisedButton style={{marginRight:'0'}} disabled={x.others&&!this.state.saving?false:true}
                                                        label={'保存'} onClick={e=>{this.save(x);}}/>
                                                </Col>
                                            </Row>
                                        </Col>
                                    ):null}
                                    
                                </Row>
                            </Col>
                            <Divider style={{display:i==value.length-1?'none':'block',width:'100%'}}/>
                         </Row>
                            
                    )}


                </Grid>

            </CardText>
            
        </Card>
        </StepContent>
        </Step>
        ;
        return (this.state.memberload?
            <div className={style}>
                <Paper zDepth={1} style={PaperStyle}>
                    <Grid fluid style={{height:'100%'}}>
                        <Row style={{height:'100%'}}>
                            <Col xs={1} sm={1} md={2} lg={2} style={{height:'100%'}}>
                                <p style={{fontSize:'18px',display: 'flex','align-items': 'center','margin-right': '9px',height:'100%'}}>小组日报</p>
                            </Col>
                        </Row>
                    </Grid>
                </Paper>
            <Stepper orientation="vertical" linear={false} children={[]}>
                <TeamReportListView ref="listView" loadList={TeamReport.get} getter={TeamReport.operation.get} formatter={TeamReport.formatter} itemRender={itemRender}/>
            </Stepper>
            </div>:null
        );
    },
    save(itm) {
        this.setState({saving:true});
        TeamReport.saveReport(itm,this.saveCb.bind(this));
    },
    saveCb(result) {
        this.setState({saving:false});
    },
    componentWillUnmount() {
         isfirstLoad = true;
        console.log('team report unloaded');
    }
});