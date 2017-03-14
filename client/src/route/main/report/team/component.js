/**
 * 报告
 */
import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {FlatButton,Paper,TextField,RaisedButton, Toolbar,ToolbarGroup,ToolbarTitle,Card, CardActions, CardHeader, IconButton,Dialog,DatePicker,Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,GridList, GridTile,
    CardText, List, ListItem, Divider, Popover, Menu, MenuItem,Step,Stepper,StepLabel,StepContent} from 'material-ui';
    import {red300,red200,lightBlue500,cyan300} from 'material-ui/styles/colors';
import AddIcon from 'material-ui/svg-icons/content/add';
import {uuid,fetch} from 'lib/util';
import popup from 'cpn/popup';
import {style} from '../index.scss';
import pubsub from 'vanilla-pubsub';
import Avatar from 'cpn/Avatar';
import _ from 'lodash';
import Backend from 'lib/backend';
import TeamReportListView from 'cpn/TeamReportList';
import {TeamReport,Members} from './model';
import InfoDialog from './infodialog.js';
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
        return {rps: [], teamMap: {}, userMap: {},infodata:null,showinfo:false,infodialogkey:uuid(),memberload:false,saving:false,team:TeamReport,backing:false,sendmail:false};
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
    mouseEnter(e,itm) {
        /*if(TeamReport.task.getter(itm.taskid)){
            this.setState({infodata:TeamReport.task.getter(itm.taskid),infodialogkey:uuid()});
            this.renderInfoDialog();
        }else{
            TeamReport.task.get(itm.taskid,(data)=>{
              this.renderInfoDialog();
              this.setState({showinfo:true,infodata:data,infodialogkey:uuid()});
             
            });
        }*/
        this.refs.infoDialog.mouseEnterCb(e,itm);
    },
    renderInfoDialog(task) {
        //计算位置
        
        //this.setState({});
    },
    mouseMove(e,itm){
        this.refs.infoDialog.mouseMoveCb(e,itm);
    },
    mouseExit(e,itm) {
        this.refs.infoDialog.mouseExitCb(e,itm);
        /*this.setState({showinfo:false});
        this.setState({infodata:null});*/
    },
    render() {
        if(isfirstLoad){
            TeamReport.init(function(){
                //console.log('111');
                this.setState({memberload:true});
            }.bind(this));
            isfirstLoad = false;
        }
        let contentformatter =(r,i) =>
        r!=''?<p>{r}</p>:''
        
        let reportRender = (x,i)=>
            <tr key={i}>
            
            <td>{x.content.split('\n').map((r,index)=>contentformatter(r,index))}</td>
            <td >{x.elapse?x.elapse+'h  ':''}</td>
            <td>{x.ticket}&nbsp;&nbsp;</td>
            </tr>;
            
        let taskRender = (x,i)=>
            <tr onMouseEnter={e=>{this.mouseEnter.call(this,e,x)}} onMouseMove={e=>{this.mouseMove.call(this,e,x)}} onMouseLeave={e=>{this.mouseExit.call(this,e,x)}}>
                <td>{x.taskname}&nbsp;&nbsp;</td>
                <td>{x.content && x.content!=''?x.content:(<span className={"noprogress"}>本日没进度</span>)}</td>
                <td>{x.progress?x.progress+'%  ':''}</td>
                <td>{x.elapse?x.elapse+'h':''}</td>
                <td>{x.delay&&x.delaytotime?(x.delay>0?(<span className={"isdelay"}>{'延至'+(new Date(x.delaytotime).toLocaleDateString())}{}</span>):(<span className={"isndelay"}>{'提前至'+(new Date(x.delaytotime).toLocaleDateString())}{}</span>)):''}</td>
            </tr>
        ;
        let itemRender = (value, k) => 
        <Step active={true} className="step">
        <StepLabel iconContainerStyle={containerStyle}>{new Date(k*1).toLocaleDateString()}</StepLabel>
        <StepContent>
          <Card initiallyExpanded key={k} className="item" style={{boxShadow:'rgba(0, 0, 0, 0.117647) 0px 0px 1px, rgba(0, 0, 0, 0.117647) 0px 0px 1px'}}>
            <CardText expandable >
                <Grid fluid style={{padding:'0 5px'}}>
                    
                    {value.map((x,i)=>
                        <Row >
                            <Col style={{display:'none'}}  xs={1} sm={1} md={1} lg={1}>
                                <p className={'f-textvertical f-tc'}><span className={'username'}>{x.username}</span></p>
                            </Col>

                            <Col style={{display:'none'}}  xs={window.user.role!=2||x.withnullconent?11:10} sm={window.user.role!=2||x.withnullconent?11:10} md={window.user.role!=2||x.withnullconent?11:10} lg={window.user.role!=2||x.withnullconent?11:10}>
                                <Row>

                                     <Col xs={1} sm={1} md={1} lg={1}>
                                     <p style={{display:x.taskhistorylist&&x.taskhistorylist.length>0?'':'none'}} className={'f-textvertical f-tc'}><span className={'tasktitle'}>任务事项</span></p>
                                    </Col>
                                    <Col xs={11} sm={11} md={11} lg={11}>
                                    {x.taskhistorylist&&x.taskhistorylist.length>0?(
                                        <table className={'ui celled small table'} style={{margin:'1em',width:'100%'}}>
                                            <thead>
                                                <tr >
                                                    <th className={"three wide"}>任务名</th>
                                                    <th>完成内容</th>
                                                    <th className={"one wide"}>进度</th>
                                                    <th className={"one wide"}>耗时</th>
                                                    <th className={"three wide"}>备注</th>
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
                                    <Col xs={1} sm={1} md={1} lg={1}>
                                        <p style={{display:x.reports&&x.reports.length>0?'':'none'}} className={'f-textvertical f-tc'}><span className={'reporttitle'}>普通事项</span></p>
                                    </Col>
                                    <Col xs={11} sm={11} md={11} lg={11}>
                                        {x.reports&&x.reports.length>0?(
                                            <table className={'ui celled small table'} style={{margin:'1em'}}>
                                        <thead>
                                            <tr >
                                                <th>内容</th>
                                                <th className={"one wide"}>耗时</th>
                                                <th className={"one wide"}>ticket</th>
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

                            <Col xs={window.user.role!=2||x.withnullconent?12:11} sm={window.user.role!=2||x.withnullconent?12:11} md={window.user.role!=2||x.withnullconent?12:11} lg={window.user.role!=2||x.withnullconent?12:11}>
                                <Row >
                                    
                                    <Col xs={4} sm={4} md={4} lg={2}>
                                        <p className={'f-flexalignleft'}><span className={'username'}>{x.username}</span></p>
                                    </Col>
                                    <Col xs={8} sm={8} md={8} lg={10}>
                                        {x.withnullconent?(
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
                                    ):null}
                                    </Col>
                                    <Col xs={6} sm={6} md={3} lg={3}>
                                        <p style={{display:x.taskhistorylist&&x.taskhistorylist.length>0?'':'none'}} className={'f-textvertical f-tc'}><span className={'tasktitle'}>任务事项</span></p>
                                    </Col>
                                    <Col xs={6} sm={6} md={9} lg={9}>
                                    </Col>

                                    <Col xs={1} sm={1} md={1} lg={1}></Col>
                                    <Col xs={11} sm={11} md={11} lg={11}>
                                    {x.taskhistorylist&&x.taskhistorylist.length>0?(
                                        <table className={'ui celled small table'} style={{margin:'1em 0',width:'100%'}}>
                                            <thead>
                                                <tr >
                                                    <th className={"three wide"}>任务名</th>
                                                    <th>完成内容</th>
                                                    <th className={"one wide"}>进度</th>
                                                    <th className={"one wide"}>耗时</th>
                                                    <th className={"four wide"}>备注</th>
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
                                    <Col xs={6} sm={6} md={3} lg={3}>
                                        <p style={{display:x.reports&&x.reports.length>0?'':'none'}} className={'f-textvertical f-tc'}><span className={'reporttitle'}>普通事项</span></p>
                                    </Col>
                                    <Col xs={6} sm={6} md={9} lg={9}>
                                    </Col>

                                    <Col xs={1} sm={1} md={1} lg={1}></Col>
                                    <Col xs={11} sm={11} md={11} lg={11}>
                                        {x.reports&&x.reports.length>0?(
                                            <table className={'ui celled small table'} style={{margin:'1em 0'}}>
                                        <thead>
                                            <tr >
                                                <th>内容</th>
                                                <th className={"one wide"}>耗时</th>
                                                <th className={"one wide"}>ticket</th>
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
                                    
                                </Row>
                            </Col>

                            
                            <Col xs={1} sm={1} md={1} lg={1} style={{display:window.user.role!=2||x.withnullconent?'none':'',minHeight:'100%'}} >
                                <div className={'f-flextop'}>
                                    <RaisedButton disabled={this.state.backing?true:false} style={{margin:'10px 5px 0'}} onClick={this.backReport.bind(this,x)}  label="打回" backgroundColor={'#fff'} labelColor='#999'/>
                                </div>
                            </Col>
                            <Divider style={{display:i==value.length-1?'none':'block',width:'100%',marginBottom:'1em'}}/>
                         </Row>
                            
                    )}
                    

                </Grid>

            </CardText>
            <CardActions style={{display:value.length==Members.get().length&&_model.Members.get().length>0&&value.length>0&&window.user.role!=2||value.issend?'none':'',display:'none'}}>
            <Divider/>
                 <RaisedButton style={{margin:'10px 5px 0'}} disabled={this.state.sendmail?true:false} label={value.issend?"邮件已发送":"发送邮件"} onClick={this.sendMail.bind(this,value,k)} backgroundColor={lightBlue500} labelColor='#fff'
                />
            </CardActions>
        </Card>
        </StepContent>
        </Step>
        ;
        return (this.state.memberload?
            <div className={style} key={this.state.infodialogkey}>
                <Paper zDepth={1} style={PaperStyle}>
                    <Grid fluid style={{height:'100%'}}>
                        <Row style={{height:'100%'}}>
                            <Col xs={1} sm={1} md={2} lg={2} style={{height:'100%'}}>
                                <p style={{fontSize:'18px',display: 'flex','align-items': 'center','margin-right': '9px',height:'100%'}}>小组日报</p>
                            </Col>
                        </Row>
                    </Grid>
                </Paper>
            <Stepper orientation="vertical" linear={false} children={[]}  key={this.state.infodialogkey}>
                <TeamReportListView ref="listView" loadList={TeamReport.get} getter={TeamReport.operation.get} formatter={TeamReport.formatter} itemRender={itemRender}/>
            </Stepper>
            <InfoDialog ref={'infoDialog'} />
              
            </div>:null
        );
    },
    sendMail(value,key) {
        this.setState({sendmail:true});
        TeamReport.sendMail(value,key,this.sendMailCb.bind(this));
    },
    sendMailCb(result) {
        this.setState({sendmail:false});
    },
    backReport(itm) {
        this.setState({backing:true});
        TeamReport.backReport(itm,this.backReportCb.bind(this));
    },
    backReportCb(result) {
        this.setState({backing:true});
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
         TeamReport.reset();
        console.log('team report unloaded');
    }
});