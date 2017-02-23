/**
 * 报告
 */
import React from 'react';
import {browserHistory} from 'react-router';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {FlatButton,RaisedButton,FloatingActionButton, Paper,Toolbar,ToolbarGroup,ToolbarTitle,Card, CardActions, CardHeader, IconButton,Dialog,DatePicker,Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,GridList, GridTile,
    CardText, List, ListItem, Avatar, Divider, Popover, Menu, MenuItem,Step,Stepper,StepLabel,StepContent} from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import {red300,red200,lightBlue300,cyan300} from 'material-ui/styles/colors';
import IconMenu from 'material-ui/IconMenu';
import {fetch} from 'lib/util';
import popup from 'cpn/popup';
import {style} from '../../index.scss';
import pubsub from 'vanilla-pubsub';
import ListView from 'cpn/ListView';
import _ from 'lodash';
import Backend from 'lib/backend';
import {Report} from './model';


const StepperStyle = {
    fontSize:0
}
const containerStyle = {
    display:'none'
}
const conststyle = {
    floatingButton:{
        position:'fixed',
        right:'40px',
        bottom:'20px'
    }
};
const PaperStyle = {
    boxShadow:'rgba(0, 0, 0, 0.117647) 0px 0px 0px, rgba(0, 0, 0, 0.117647) 0px 0px 4px',
    backgroundColor:'#fff',
    height:'56px',
    borderRadius:0
}
const CardStyle = {
    
}

module.exports = React.createClass({
    getInitialState() {
        Report.reset();
        return {rps: [], myTeams: [],stepIndex:0, finished: false,show:false};
    },
    componentDidMount() {

        let barConf = {
            title: '新增工作日记',
            titleStyle:{
                fontSize:'16px',
                marginLeft:'-20px'
            },
            iconElementLeft:<IconButton title="新增工作日记" onClick={this._create}><AddIcon color={'#fff'}/></IconButton>
        };
        pubsub.publish('config.appBar', barConf);

    },
    componentWillUnmount() {
        //unlisten();
        Report.reset();
    },
    handleChange(e,c) {
        switch(c.props.value*1){
            case 1:
               this.setState({
                open:true
               });
               break;
            case 2:
               
        }
    },
    render() {
        let reportRender = (x,i)=>
            <tr key={i}>
            
            <td>{x.content}&nbsp;&nbsp;</td>
            <td>{x.elapse?x.elapse+'小时  ':''}</td>
            <td>{x.ticket}&nbsp;&nbsp;</td>
            </tr>;
        let taskRender = (x,i)=>
            <tr key={i}>
                <td>{x.taskname}&nbsp;&nbsp;</td>
                <td>{x.progress?x.progress+'%  ':''}</td>
                <td>{x.elapse?x.elapse+'小时':''}</td>
                <td>{x.content && x.content!=''?x.content:(<span className={"noprogress"}>本日没进度</span>)}</td>
                <td>{x.delay&&x.delaytotime?(x.delay>0?(<span className={"isdelay"}>{'延期至'+(new Date(x.delaytotime).toLocaleDateString())}{}</span>):(<span className={"isndelay"}>{'提前至'+(new Date(x.delaytotime).toLocaleDateString())}{}</span>)):''}</td>
            </tr>
        ;
        let itemRender = (x, i) => 
        <Step active={true} className="step" style={{display:x.status!=3?'block':'none'}} key={i*3}>
        <StepLabel iconContainerStyle={containerStyle}>{new Date(x.time).toLocaleDateString()}</StepLabel>
        <StepContent>
            <div className="clearfix">
            <Card initiallyExpanded key={i*2} className="item" style={{display:x.taskhistorylist&&x.taskhistorylist.length>0?'block':'none',width:'auto',display:'block',boxShadow:'rgba(0, 0, 0, 0.117647) 0px 0px 1px, rgba(0, 0, 0, 0.117647) 0px 0px 1px'}}>
                <CardText expandable style={{paddingTop:0,paddingBottom:0}}>
                    <Toolbar style={{backgroundColor:'#7dbcda',display:'none'}}>
                        <ToolbarGroup style={{textAlign:'center',width:'100%'}}>
                            <ToolbarTitle text="任务事项" style={{color:'#fff',textAlign:'center',width:'100%'}}/>
                        </ToolbarGroup>
                    </Toolbar>
                        <List style={{display:x.taskhistorylist&&x.taskhistorylist.length>0?'block':'none'}}>
                            <Grid fluid className={'f-nonemargin f-fullwidth'}>
                                <Row>
                                    <Col xs={1} sm={1} md={2} lg={2}>
                                    <p className={'f-textvertical f-tc'} ><span className={'tasktitle f-fs16'}>任务事项</span></p>
                                    </Col>
                                    <Col xs={9} sm={9} md={9} lg={9}>
                                        {x.taskhistorylist&&x.taskhistorylist.length>0&&x.taskhistorylist.map( (row, index) => (
                                          <ListItem disabled={true} key={index}  selected={row.selected} style={{display:'none'}}>
                                            {taskRender(row,index)}
                                          </ListItem>
                                          ))}
                                         <table className={'ui celled  table'} style={{margin:'1em',width:'100%'}}>
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
                                    </Col>
                                </Row>
                            </Grid>
                      </List> 
                      <Divider style={{display:x.taskhistorylist&&x.taskhistorylist.length>0&&x.reports&&x.reports.length>0?'block':'none'}}/>
                      <List style={{display:x.reports&&x.reports.length>0?'block':'none'}}>
                            <Grid fluid className={'f-nonemargin f-fullwidth'}>
                                <Row>
                                    <Col xs={1} sm={1} md={2} lg={2}>
                                    <p className={'f-textvertical f-tc'} ><span className={'reporttitle f-fs16'}>普通事项</span></p>
                                    </Col>
                                    <Col xs={9} sm={9} md={9} lg={9}>
                                        <table className={'ui celled  table'} style={{margin:'1em'}}>
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
                                       
                                    </Col>
                                </Row>
                            </Grid>
                      </List>
                </CardText>
            </Card>
            <Card initiallyExpanded key={i} className="item" style={{display:x.reports&&x.reports.length>0?'block':'none',width:'45%',float:'left',display:'none'}}>
                <CardText expandable>
                    <Toolbar style={{backgroundColor:'#7dbcda'}}>
                        <ToolbarGroup style={{textAlign:'center',width:'100%'}}>
                            <ToolbarTitle text="普通事项" style={{color:'#fff',textAlign:'center',width:'100%'}}/>
                        </ToolbarGroup>
                    </Toolbar>
                      <List>
                        {x.reports&&x.reports.length>0&&x.reports.map((row, index) => (
                          <ListItem disabled={true} key={index}  selected={row.selected}>
                            {reportRender(row,index)}
                          </ListItem>
                          ))}
                      </List>  
                </CardText>
            </Card>
            </div>
            <div style={{'display':x.status==1?'block':'none',padding:'16px'}}>
            <RaisedButton style={{margin:'0 5px'}} label="删除" backgroundColor={red300} labelColor='#fff'
                  onClick={this._delete.bind(this, x)}
                />
                <RaisedButton style={{margin:'0 10px'}} label="编辑" backgroundColor={lightBlue300} labelColor='#fff'
                  onClick={this._onEdit.bind(this, x)}
                />
                <RaisedButton style={{margin:'0 10px'}} label="发送" backgroundColor={cyan300} labelColor='#fff'
                  onClick={this._onSend.bind(this, x)}
                
                />
            </div>
        </StepContent>
        </Step>
        ;
        return (
            <div className={style} ref="reportcontainer">
                <Paper zDepth={1} style={PaperStyle}>
                    <Grid fluid style={{height:'100%'}}>
                        <Row style={{height:'100%'}}>
                            <Col xs={1} sm={1} md={2} lg={2} style={{height:'100%'}}>
                                <p style={{fontSize:'18px',display: 'flex','alignItems': 'center','marginRight': '9px',height:'100%'}}>我的日报</p>
                            </Col>
                        </Row>
                    </Grid>
                </Paper>
                <Stepper orientation="vertical" linear={false} children={[]}>
                  <ListView ref="listView" loadList={Report.get} getter={Report.operation.get} formatter={Report.formatter} itemRender={itemRender}/>
                </Stepper>
                 <FloatingActionButton tooltip={'添加日报'} backgroundColor={'#ff7781'} style={conststyle.floatingButton}  onClick={this._create} >
                  <AddIcon />
                </FloatingActionButton>
                <Popover
                    open={!!this.state.currentRp}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={e => this.setState({currentRp: null})}>
                    
                </Popover>
            </div>
        );
    },
    _create() {
        browserHistory.push('/m/report/my/edit');
    },
    _delete(rp) {
        popup.confirm({
            msg: '确定删除此报告?',
            onOk: () => {
                Backend.report.delete(rp.id).then()
                    .then(d => {
                        Report.operation.delete(rp);
                        this.refs.listView.delete();
                        popup.success('删除成功');
                    })
                    .catch(e => {
                        popup.success('删除失败');
                    })
            }
        });
    },
    _onSend(rp, e) {
        e.preventDefault();
        let reportId = rp.id;
        Backend.report.send(reportId)
        .then(d => {
                Report.operation.update(rp);
                this.refs.listView.updateView();
                popup.success('发送成功');
            })
        .catch(e => {
            popup.error('发送失败');
        });
    },
    _onEdit(rp) {
        browserHistory.push({pathname: '/m/report/my/edit/' + rp.id, state: Object.assign({}, rp)});
        Report.reset();
    }
});