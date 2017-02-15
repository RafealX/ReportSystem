/**
 * 报告
 */
import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {browserHistory} from 'react-router';
import {Paper,FlatButton, CircularProgress,SelectField, TextField, MenuItem,FontIcon, IconButton,GridList, GridTile,
    Card, CardActions, CardHeader,CardText,Divider,DropDownMenu,Slider,
    DatePicker, Toolbar, ToolbarGroup, RaisedButton, ToolbarSeparator} from 'material-ui';
//colors
import {red300,red200,lightBlue300,cyan300} from 'material-ui/styles/colors';
//icons
import Bulleted from 'material-ui/svg-icons/editor/format-list-bulleted';
import Numbered from 'material-ui/svg-icons/editor/format-list-numbered';
import Title from 'material-ui/svg-icons/editor/title';
import BackIcn from 'material-ui/svg-icons/Hardware/keyboard-backspace';
import AddIcn from 'material-ui/svg-icons/Content/add';
import {fetch,uuid} from 'lib/util';
import popup from 'cpn/popup';
import pubsub from 'vanilla-pubsub';
import Editor from 'cpn/Editor';
import format from 'date-format';
import {TaskDetail as ShowDetail} from '../../../task/my/list/detail.js';
import {Report,UnFinish} from './model.js';
import {style} from './style.scss';



const types = [
    <MenuItem key="day" value="day" primaryText="日报"/>,
    <MenuItem key="week" value="week" primaryText="周报"/>,
    <MenuItem key="month" value="month" primaryText="月报"/>
];

const iconStyle = {fontSize: '16px', fontWeight: 'bold', marginTop: '4px'};
const mystyle = {
    margin: '10px',
    height: 'calc(100% - 60px)'
};
const DatePickerStyle ={
    textField:{
        color:'#fff'
    }
}

//发送日报模板
let targetReport = {
        //日报时间，作为title用
        time:'2017-01-18T12:36:39.387Z',
        //日报内容
        report:'',
        reports:[],
        //日报状态 1未发送 2已发送 3已删除
        status:1,
        tasks:[],
        userId: "58442c1ac32a8d204e44cd89"
};

let today = new Date();
let theDayBeforeYester = new Date(today.setDate(today.getDate()-2));

let firstLoad = true;
module.exports = React.createClass({
    getInitialState() {
        console.log(Report.get().time);
        return {loading:true,isEdit:false,saving:false,report:Report.get().report,task:Report.get().task,fakereport:Report.fake.report(),faketask:Report.fake.task(),time:Report.get().time,unfinishtask:null,selectedtask:null}
    },
    componentDidMount() {
        var _self = this;
        let barConf = {
            title: '',
            titleStyle:{
                fontSize:'16px',
                marginLeft:'-20px'
            },
            iconElementLeft:null,
            iconElementRight:null
        };
        pubsub.publish('config.appBar', barConf);
    },
    BackUrl() {
        console.log(browserHistory);
        browserHistory.goBack();
    },
    handleTime() {

    },
    handle:{
        unfinish:function(){
            
            if(UnFinish.get().length==0){
                popup.success('当前没有未完成的任务');
            }
            this.setState({'unfinishtask':UnFinish.get(),loading:false,task:Report.get().task});
            console.log(this.state.task);
            console.log('unfinishtask',this.state.unfinishtask);
        },
        add(type) {
            let addedData;
            switch(type){
                case 'report':
                    addedData = this.state.fakereport;
                    if(!addedData.elapse || !addedData.ticket || !addedData.content){
                        popup.error('有东西没写，还不能添加');
                        return;
                    }
                    Report.set.report(addedData);
                    this.setState({report:Report.get().report,fakereport:Report.fake.report()});
                    break;
                case 'task':
                    let selectedtask = this.state.selectedtask;
                    addedData = this.state.faketask;
                    if(!addedData.elapse || (!addedData.summary && !addedData.question)){
                        popup.error('有东西没写，还不能添加');
                        return;
                    }
                    if(addedData.progress<=selectedtask.progress){
                        popup.error('没进度？');
                        return;   
                    }
                    console.log(addedData);
                    //1.设置task日志
                    //2.去除已写日志的task
                    
                    let unfinishtask = this.state.unfinishtask.slice(0);
                    
                    _.each(unfinishtask,(itm)=>{
                        if(itm.id===selectedtask.id){
                            console.log(itm);
                            itm.status=0;
                        }
                    });
                    Report.set.task(addedData);
                    this.setState({task:Report.get().task,faketask:Report.fake.task(),unfinishtask:unfinishtask,selectedtask:null});
                    break;
            }
        },
        report:{
            edit(itm) {
                itm.status=0;
                this.setState({report:Report.get().report});
            },
            confirm(itm) {
                itm.status=1;
                this.setState({report:Report.get().report});
            },
            cancel(target,itm) {
                itm.status=1;
                target = _.merge(target,itm);
                this.setState({report:[]});
                setTimeout(()=>{
                    this.setState({report:Report.get().report});
                },200);
            },
            delete(itm) {
                popup.confirm({
                    msg: '确定删除这条普通事项?',
                    onOk: () => {
                        Report.delete.report(itm);
                        this.setState({report:Report.get().report});
                    }
                });
                
            },
        },
        task:{
            add() {
               this.refs.showdetailcpn.switchType(1,{},this.handle.task.callback.bind(this));
            },
            callback(data) {
                console.log(data);
                let result = Report.fake.task();
                console.log(result,data);
                result.targettask = data.id;
                result.taskname = data.name;
                result.progress = 0;
                Report.set.task(result);
                this.setState({task:Report.get().task});
                //result.
            },
            edit(itm) {
                itm.status=0;
                this.setState({task:Report.get().task});
            },
            confirm(itm) {
                itm.status=1;
                this.setState({task:Report.get().task});
            },
            cancel(target,itm) {
                //itm.status=1;
                itm.status=1;
                target = _.merge(target,itm);
                this.setState({task:[]});
                setTimeout(()=>{
                    this.setState({task:Report.get().task});
                },200);
            },
            delete(itm) {
                popup.confirm({
                    msg: '确定删除这条任务事项?',
                    onOk: () => {
                        Report.delete.task(itm);
                        let unfinishtask = this.state.unfinishtask;
                        _.each(unfinishtask,(item)=>{
                            item.targettask===itm.targettask?(item.status=1):'';
                        });
                        this.setState({task:Report.get().task,unfinishtask:unfinishtask});

                    }
                });
            },
        },
        save() {
            this.setState({saving:true});
            Report.send().then(d=>{
                popup.success('保存成功');
                browserHistory.replace('/m/report/my/list');
            })
            .catch(e=>{
                popup.success('保存失败');
                browserHistory.replace('/m/report/my/list');
            });
        },
        time(n,newdata) {
            Report.set.time(newdata);
            this.setState({time:newdata});
        }
    },
    componentWillUnmount() {
        UnFinish.clear();
        Report.clear();
        firstLoad = true;
    },
    render() {
        if(firstLoad){
            UnFinish.listen(this.handle.unfinish.bind(this));
            if(this.props.location.state){

                Report.init.edit(this.props.location.state,()=>{
                    console.log(Report.get().time);
                    this.setState({report:Report.get().report,task:Report.get().task,time:Report.get().time,unfinishtask:UnFinish.get(),isEdit:true});
                });
            }
            UnFinish.init();   
            firstLoad = false;
        }
        

        return (
            <div className={style}>
                <ShowDetail ref="showdetailcpn" />
                <Toolbar style={{backgroundColor:'#7cccb5'}}>
                <ToolbarGroup firstChild={true}>
                    <DatePicker textFieldStyle={DatePickerStyle.textField}
                          locale="zh-Hans-CN" disabled={this.state.isEdit}
                          DateTimeFormat={Intl.DateTimeFormat}
                          cancelLabel="取消" okLabel="确定" value={this.state.time}
                          style={{width: '120px', marginTop: '4px',marginLeft: '15px'}}
                          textFieldStyle={{width: '120px'}} onChange={(n,newdate)=>{let date = new Date(newdate.toLocaleDateString());console.log(this.handle.time);this.handle.time.call(this,n,date)}}
                          hintText="选择日期" minDate={theDayBeforeYester} maxDate={new Date}/>
                </ToolbarGroup>
                <ToolbarGroup lastChild={true}>
                    <RaisedButton
                            primary
                            disabled={this.state.saving || (!this.state.time || this.state.report.length==0 && this.state.task.length==0)}
                            label={this.state.saving ? '保存中...': '保存'}
                            onTouchTap={this.handle.save.bind(this)}/>
                </ToolbarGroup>
                </Toolbar>
                {this.state.loading?(<div className="loadingStage">
                    <CircularProgress color="#FF9800" className="loading"/>
                </div>):(
                    <Grid fluid>

                            <Row>
                                <Col xs={1} sm={1} md={1} lg={1}></Col>
                                <Col xs={10} sm={10} md={4} lg={4}>
                                    <Row>
                                        <Col xs={12} sm={12} md={12} lg={12}>
                                            <div style={{margin:'0 6px'}}>
                                             <h2 style={{fontSize:'26px',fontWeight:'normal',textAlign:'center',margin:'15px',color:'#a5a5a5'}}>普通事项</h2>
                                             <Divider style={{marginTop:'10px',marginBottom:'10px'}}/>
                                            <Card style={{margin:'10px 6px'}}>
                                                <CardText>
                                                    <TextField                                  
                                                      floatingLabelText="耗时"
                                                      type='number'
                                                      value={this.state.fakereport.elapse}
                                                      onChange={(e,news)=>{let report=this.state.fakereport;report.elapse = news;this.setState({fakereport:report})}}
                                                    />
                                                    <TextField              
                                                      floatingLabelText="ticket"
                                                      value={this.state.fakereport.ticket}
                                                      onChange={(e,news)=>{let report=this.state.fakereport;report.ticket = news;this.setState({fakereport:report})}}
                                                    />
                                                    <TextField                                  
                                                      floatingLabelText="内容"
                                                      type='textarea' multiLine={true}
                                                      value={this.state.fakereport.content}
                                                      rows={4}
                                                      rowsMax={10} fullWidth={true}
                                                      onChange={(e,news)=>{let report=this.state.fakereport;report.content = news;this.setState({fakereport:report})}}
                                                    />

                                                </CardText>
                                                 <CardActions>
                                                  <RaisedButton label="新增普通事项" onClick={this.handle.add.bind(this,'report')}/>
                                                </CardActions>
                                            </Card>
                                            {this.state.report&&this.state.report.length>0&&<Divider style={{marginTop:'10px'}}/>}
                                            {this.state.report&&this.state.report.length>0&&this.state.report.map((itm,idx)=>{
                                                return (
                                                     <Card style={{margin:'10px 6px'}} key={idx}>
                                                <CardText >
                                                    <TextField                                  
                                                      floatingLabelText="耗时"
                                                      type='number' disabled={itm.status==1?true:false}
                                                      defaultValue={itm.elapse}
                                                      onChange={(e,news)=>{itm.elapse = news}}
                                                    />
                                                    <TextField  style={{marginLeft:'5px'}}                              
                                                      floatingLabelText="ticket" disabled={itm.status==1?true:false}
                                                      defaultValue={itm.ticket}
                                                      onChange={(e,news)=>{itm.ticket = news}}
                                                    />
                                                    <TextField                                  
                                                      floatingLabelText="内容" disabled={itm.status==1?true:false}
                                                      type='textarea' multiLine={true}
                                                      defaultValue={itm.content}
                                                      rows={4}
                                                      rowsMax={10} fullWidth={true}
                                                      onChange={(e,news)=>{itm.content = news}}
                                                    />

                                                    </CardText>
                                                     <CardActions>
                                                     {itm.status==1?(
                                                        <div>
                                                        <RaisedButton label="编辑" labelColor={'#fff'} backgroundColor={lightBlue300} onClick={this.handle.report.edit.bind(this,itm)} />
                                                        <RaisedButton label="删除" labelColor={'#fff'}  style={{marginLeft:'10px'}} backgroundColor={red300} onClick={this.handle.report.delete.bind(this,itm)} />
                                                        </div>
                                                        ):(
                                                        <div>
                                                        <RaisedButton label="确定" labelColor={'#fff'}  style={{marginRight:'10px'}} backgroundColor={cyan300} onClick={this.handle.report.confirm.bind(this,itm)} />
                                                        <RaisedButton label="取消" onClick={this.handle.report.cancel.bind(this,itm,_.clone(itm,true))} />
                                                        </div>
                                                     )}
                                                      
                                                    </CardActions>
                                                </Card>
                                                );
                                            })}
                                             </div>
                                        </Col>
                                       
                                    </Row>
                                  </Col>
                                <Col xs={1} sm={1} md={1} lg={1}></Col>
                                <Col xs={1} sm={1} md={1} lg={1}></Col>
                                <Col xs={10} sm={10} md={4} lg={4}>
                                    <Row>
                                        <Col xs={12} sm={12} md={12} lg={12}>
                                            <div style={{margin:'0 6px'}}>
                                            <h2 style={{fontSize:'26px',fontWeight:'normal',textAlign:'center',margin:'15px',color:'#a5a5a5'}}>
                                                <div style={{position:'relative'}}>
                                                <span>任务事项</span>
                                                <IconButton tooltip="点我新增任务！" onClick={this.handle.task.add.bind(this)} style={{position:'absolute',right:'0',top:'0',width: '30',height: '30',padding:'0'}}><AddIcn color={'rgba(0,0,0,0.6)'}/></IconButton>
                                                </div>
                                            </h2>
                                            {this.state.task&&this.state.task.length>0&&<Divider style={{marginTop:'10px',marginBottom:'10px'}}/>}
                                            {this.state.task&&this.state.task.length>0&&this.state.task.map((itm,idx)=>{
                                                return (
                                                     <Card style={{margin:'10px 6px'}} key={idx}>
                                                    <CardText >
                                                    <TextField 
                                                          name="progressname"
                                                          value={itm.taskname} disabled={true}
                                                        />
                                                     <TextField 
                                                          type="number"
                                                          name="currentprogress"
                                                          min={Math.floor(itm.progress/10)*10}
                                                          max={100}
                                                          hintText="进度"
                                                          floatingLabelText="进度选择"
                                                          step={5} disabled={itm.status==1?true:false}
                                                          defaultValue={itm.progress}
                                                          onChange={(e,n)=>{itm.progress = n;}}
                                                        />
                                                        <TextField
                                                            type="number"
                                                            name="elapse"
                                                            hintText="耗时"
                                                            floatingLabelText="耗时"
                                                            min={0}
                                                            defaultValue={itm.elapse} disabled={itm.status==1?true:false}
                                                            onChange={(e,n)=>{itm.elapse=n}}
                                                        />
                                                        <TextField 
                                                            type="textarea"
                                                            fullWidth={true}
                                                            rows={2}
                                                            name="summary"
                                                            hintText="内容概要"
                                                            floatingLabelText="内容概要"
                                                            defaultValue={itm.summary} disabled={itm.status==1?true:false}
                                                            onChange={(e,n)=>{itm.summary=n;}}
                                                        />
                                                        <TextField 
                                                            type="textarea"
                                                            rows={2}
                                                            fullWidth={true}
                                                            rowsMax={6}
                                                            name="question"
                                                            hintText="遇到的问题"
                                                            floatingLabelText="遇到的问题"
                                                            defaultValue={itm.question} disabled={itm.status==1?true:false}
                                                            onChange={(e,n)=>{itm.question=n;}}
                                                        />
                                                    </CardText>
                                                     <CardActions>
                                                     {itm.status==1?(
                                                        <div>
                                                        <RaisedButton label="编辑" labelColor={'#fff'} backgroundColor={lightBlue300} onClick={this.handle.task.edit.bind(this,itm)} />
                                                        </div>
                                                        ):(
                                                        <div>
                                                        <RaisedButton label="确定" labelColor={'#fff'}  style={{marginRight:'10px'}} backgroundColor={cyan300} onClick={this.handle.task.confirm.bind(this,itm)} />
                                                        <RaisedButton label="取消" onClick={this.handle.task.cancel.bind(this,itm,_.clone(itm,true))} />
                                                        </div>
                                                     )}
                                                      
                                                    </CardActions>
                                                </Card>
                                                );
                                            })}
                                            {!this.state.loading&&this.state.unfinishtask&&this.state.unfinishtask.length==0?(<h3>当前没有未完成的任务，可以点击右上角按钮新增任务</h3>):(null)}
                                            </div>
                                        </Col>
                                    </Row>
                                  </Col>
                                <Col xs={1} sm={1} md={1} lg={1}></Col>
                            </Row>
                      </Grid>
                )}
                
            </div>
        );
    },
    _toggleHeading() {
        let editor = this.refs.editor;
        this.state.formatType == 'h2' ? editor.removeFormat() : editor.heading('h2');
    },
    _toggleUl() {
        let editor = this.refs.editor;
        this.state.formatType == 'ul' ? editor.removeFormat() : editor.insertUnorderedList();
    },
    _toggleOl() {
        let editor = this.refs.editor;
        this.state.formatType == 'ol' ? editor.removeFormat() : editor.insertOrderedList();
    },
    _iconDisabled(type) {
        return !!(this.state.formatType && this.state.formatType != type);
    },
    _iconColor(type) {
        return this.state.formatType == type ? 'rgb(0, 188, 212)' : '';
    },
    _onSelectionChange(type) {
        this.setState({
            formatType: type
        });
    },
    _onTypeChange(e, index, value) {
        this.setState({
            type: value
        });
    },
    _formatTime(time) {
        let dayMs = 24 * 3600 * 1000;
        let type = this.state.rp.type || 'day';
        if (type == 'day') {
            return `${format('yyyy.MM.dd', time)}`;
        } else if (type == 'week') {
            let day = time.getDay();
            let normalDay = (!day ? 7 : day);
            let beg = new Date(time.getTime() - dayMs * (normalDay - 1));
            let end = new Date(time.getTime() + dayMs * (7 - normalDay));
            return `${format('MM.dd', beg)}~${format('MM.dd', end)}`;
        } else {
            return `${format('yyyy.MM', time)}`;
        }
    },
    _handleSave() {
        let rp = this.state.rp;
        if (!rp.type) {
            popup.error('请选择类型');
            return;
        }
        if (!rp.periodTime) {
            popup.error('请选择日期');
            return;
        }
        rp.content = this.refs.editor.getContent();
        if (!rp.content) {
            popup.error('请输入内容');
            return;
        }
        this.setState({saving: true});
        fetch('/api/report/' + (rp.id ? 'update' : 'create'), {
            method: 'post',
            body: {
                report: rp
            }
        })
            .then(d => {
                popup.success('保存成功');
                this.state.saving = false;
                browserHistory.go(-1);
            })
            .catch(e => {
                popup.success(e.msg || '保存失败');
                this.setState({saving: false});
            });
    }
});