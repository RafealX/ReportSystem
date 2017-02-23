/**
 * 报告
 */
import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {browserHistory} from 'react-router';
import {Paper,FlatButton, CircularProgress,SelectField, TextField, MenuItem,FontIcon, IconButton,GridList, GridTile,
    Card, CardActions, CardHeader,CardText,Divider,DropDownMenu,Slider,
    DatePicker, Toolbar, ToolbarGroup, RaisedButton, ToolbarSeparator} from 'material-ui';

import { FormsyCheckbox, FormsyDate, FormsyRadio, FormsyRadioGroup, 
  FormsySelect, FormsyText, FormsyTime, FormsyToggle, FormsyAutoComplete } from 'formsy-material-ui/lib';
//colors
import {red300,red200,lightBlue300,lightBlue400,cyan300} from 'material-ui/styles/colors';
//icons
import Bulleted from 'material-ui/svg-icons/editor/format-list-bulleted';
import Numbered from 'material-ui/svg-icons/editor/format-list-numbered';
import Title from 'material-ui/svg-icons/editor/title';
import BackIcn from 'material-ui/svg-icons/Hardware/keyboard-backspace';
import AddIcn from 'material-ui/svg-icons/Content/add';
import EditIcn from 'material-ui/svg-icons/Editor/mode-edit';

import DeleteIcn from 'material-ui/svg-icons/Action/delete';
import {fetch,uuid} from 'lib/util';
import popup from 'cpn/popup';
import pubsub from 'vanilla-pubsub';
import Editor from 'cpn/Editor';
import format from 'date-format';
import {TaskDetail as ShowDetail} from '../../../task/my/list/detail.js';
import {Report,UnFinish} from './model.js';
import {style} from './style.scss';


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
const textstyle ={
    floatingLabelStyle: {
        color: "#bbb",
    },
    floatingLabelFocusStyle:{
        color:'#00bcd4'
    },
    underlineStyle:{
        borderColor:'#aaa'
    },
    hideUnderlineStyle:{
        border:'none'
    },
    underlineFocusStyle:{
        borderColor:'#aaa'
    },
    hintStyle:{
        color:'#a5a5a5'
    }
}
const PaperStyle = {
    boxShadow:'rgba(0, 0, 0, 0.117647) 0px 0px 0px, rgba(0, 0, 0, 0.117647) 0px 0px 4px',
    backgroundColor:'#fff',
    height:'56px',
    borderRadius:0
}
let today = new Date();
let theDayBeforeYester = new Date(today.setDate(today.getDate()-2));

let firstLoad = true;
module.exports = React.createClass({
    getInitialState() {
        console.log(Report.get().time);
        return {loading:true,isEdit:false,saving:false,report:Report.get().report,task:Report.get().task,fakereport:Report.fake.report(),faketask:Report.fake.task(),time:Report.get().time||today,unfinishtask:null,selectedtask:null}
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
            console.log('task',Report.get().task);
            this.setState({'unfinishtask':UnFinish.get(),loading:false,task:Report.get().task,report:Report.get().report});
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
                    if(!addedData.elapse || (!addedData.content && !addedData.question)){
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
            add() {
                let fakereport = Report.fake.report();
                Report.set.report(fakereport);
                this.setState({report:Report.get().report});
                setTimeout(()=>{
                    this.refs[fakereport.id].focus();
                },0);
            },
            save(itm) {
                console.log(itm);
            },
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
            focus(itm) {
                if(!itm.show){
                    itm.show = true;
                    this.forceUpdate();
                    setTimeout(()=>{
                        this.refs[itm.id+'content'].focus();
                    },0);
                }else{
                    this.refs[itm.id+'content'].focus();
                }
            },
            add() {
                let faketask = Report.fake.task();
                faketask.show = true;
                Report.set.task(faketask);
                this.setState({task:Report.get().task});
                setTimeout(()=>{
                    this.refs[faketask.id].focus();
                },0);
                
            },
            callback(data) {
                console.log(data);
                let result = Report.fake.task();
                console.log(result,data);
                result.taskid = data.id;
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
                },10);
            },
            delete(itm) {
                popup.confirm({
                    msg: '确定删除这条任务事项?',
                    onOk: () => {
                        Report.delete.task(itm);
                        let unfinishtask = this.state.unfinishtask;
                        _.each(unfinishtask,(item)=>{
                            item.taskid===itm.taskid?(item.status=1):'';
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
            }else{
                Report.inject.report();
            }
            UnFinish.init();   
            firstLoad = false;
        }
        return (
            <div className={style}>
                <ShowDetail ref="showdetailcpn" />
                <Paper zDepth={1} style={PaperStyle}>
                    <Grid fluid>
                        <Row>
                            <Col xs={4} sm={4} md={4} lg={4}>
                                <p style={{fontSize:'18px',display: 'flex','align-items': 'center','margin-right': '9px',height:'56px'}}>编写日报</p>
                            </Col>
                        </Row>
                    </Grid>
                    
                </Paper>
                

                {this.state.loading?(<div className="loadingStage">
                    <CircularProgress color="#FF9800" className="loading"/>
                </div>):(

                    <Grid fluid >
                            <Row>
                                <Col xs={1} sm={1} md={1} lg={1}></Col>
                                <Col xs={10} sm={10} md={10} lg={10}>
                                    <Row style={{marginTop:'30px'}}>
                                        <Col xs={3} sm={3} md={3} lg={2}>
                                        <h2 className={'unfinishtitle'}><span className={'tasktitle'}>未完成任务</span></h2>
                                        </Col>
                                        <Col xs={9} sm={9} md={8} lg={8}>
                                            <Card className={'taskcard'} style={{margin:'10px 0',}} expandable={true} showExpandableButton={true} >
                                             <CardText style={{margin:'0 -2rem',paddingTop:0,paddingBottom:0}}>
                                                <Grid fluid >
                                                    <Row >
                                                        <Col xs={12} sm={12} md={12} lg={12}>
                                                            <TextField hintStyle={textstyle.hintStyle} hintText="点击新增任务事项"  underlineShow={false} fullWidth={true} onFocus={(e)=>{this.handle.task.add.call(this);e.target.blur();}}></TextField>
                                                        </Col>
                                                    </Row>
                                                </Grid>
                                                </CardText>
                                            </Card>
                                            {this.state.task&&this.state.task.length>0&&this.state.task.map((itm,idx)=>{
                                                return (
                                                     <Card className={'taskcard'} style={{margin:'10px 0'}} key={idx} initiallyExpanded={false} >
                                                         <CardHeader style={{margin:'0 -2rem',paddingTop:0,paddingBottom:0}}>
                                                            <Grid fluid >
                                                                <Row >
                                                                    <Col xs={7} sm={7} md={6} lg={6}>
                                                                    
                                                                        <TextField   hintText="任务名" key={itm.id} ref={itm.id}
                                                                          floatingLabelText="任务名" onFocus={e=>{itm.show=true;this.forceUpdate();e&&e.stopPropagation?e.stopPropagation():'';}} 
                                                                          name="progressname" onChange={(e,n)=>{itm.taskname = n;}}
                                                                          defaultValue={itm.taskname}  style={{width:'100%'}}
                                                                        />
                                                                    </Col>
                                                                    <Col xs={1} sm={1} md={2} lg={2}>
                                                                         <TextField key={itm.id}
                                                                          type="number"  style={{width:'100%'}}
                                                                          name="currentprogress"
                                                                          min={Math.floor(itm.progress/10)*10}
                                                                          max={100}
                                                                          floatingLabelText="进度" onFocus={e=>{itm.show=true;this.forceUpdate();e&&e.stopPropagation?e.stopPropagation():'';}} 
                                                                          step={5} 
                                                                          defaultValue={itm.progress}
                                                                          onChange={(e,n)=>{itm.progress = n;}}
                                                                        />
                                                                    </Col>
                                                                    <Col xs={1} sm={1} md={2} lg={2}>
                                                                        
                                                                        <DatePicker textFieldStyle={DatePickerStyle.textField} onFocus={e=>{itm.show=true;this.forceUpdate();e&&e.stopPropagation?e.stopPropagation():'';}} 
                                                                          locale="zh-Hans-CN" autoOk floatingLabelText="截止日期" key={itm.id}
                                                                          DateTimeFormat={Intl.DateTimeFormat}
                                                                          cancelLabel="取消" okLabel="确定" defaultDate={new Date(itm.tasktime)}
                                                                          style={{width: '100%'}}
                                                                          textFieldStyle={{width: '100%'}} onChange={(n,newdate)=>{itm.tasktime = newdate.getTime();}}
                                                                          hintText="选择日期" minDate={new Date()}/>
                                                                    </Col>
                                                                    <Col xs={3} sm={3} md={2} lg={2} style={{textAlign:'center',height:'auto'}} className={'f-textvertical'}>
                                                                        <IconButton  tooltip="点击展开填写" onClick={(e)=>{ e && e.stopPropagation?e.stopPropagation():'';if(!itm.show) this.handle.task.focus.call(this,itm); else{itm.show=!itm.show;this.forceUpdate();}}}> <EditIcn color={lightBlue300}/></IconButton>
                                                                        <IconButton style={{display:itm.status==1?'inline-block':'none'}}  tooltip="点击删除" onClick={(e)=>{this.handle.task.delete.call(this,itm)}}> <DeleteIcn color={red300}/></IconButton>
                                                                    </Col>
                                                                </Row>
                                                            </Grid>
                                                            
                                                            
                                                            
                                                            </CardHeader>
                                                        <CardText className={!!itm.show?'mainctn':'mainctn hidden'} style={{margin:'0 -2rem',paddingTop:0}}>
                                                            <Grid fluid>
                                                                <Row>
                                                                    <Col xs={12} sm={12} md={12} lg={12} >
                                                                        <TextField key={itm.id}
                                                                            type="textarea" fullWidth={true}
                                                                            name="question"
                                                                            hintText="任务目的"
                                                                            floatingLabelText="任务目的"
                                                                            defaultValue={itm.description} 
                                                                            onChange={(e,n)=>{itm.description=n;}}
                                                                        />
                                                                    </Col>
                                                                    
                                                                    <Col xs={9} sm={9} md={10} lg={10}>
                                                                        <TextField fullWidth={true} key={itm.id}
                                                                            type="textarea" ref={itm.id+'content'}
                                                                            name="content" onBlur={(e,n)=>{console.log('blur', e.target.value)}}
                                                                            hintText="今日进展"
                                                                            floatingLabelText="今日进展"
                                                                            defaultValue={itm.content} 
                                                                            onChange={(e,n)=>{itm.content=n;}}
                                                                        />
                                                                    </Col>
                                                                    <Col xs={3} sm={3} md={2} lg={2}>
                                                                        <TextField key={itm.id}
                                                                            type="number" style={{width:'100%'}}
                                                                            name="elapse"
                                                                            hintText="耗时"
                                                                            floatingLabelText="耗时"
                                                                            min={0} 
                                                                            defaultValue={itm.elapse}
                                                                            onChange={(e,n)=>{itm.elapse=n}}
                                                                        />
                                                                    </Col>

                                                                </Row>
                                                            </Grid>
                                                            
                                                        </CardText>
                                                    </Card>
                                                );
                                            })}
                                        </Col>
                                        <Col xs={0} sm={0} md={1} lg={1}></Col>
                                        <Col xs={12} sm={12} md={12} lg={12}>
                                            <Divider style={{marginTop:'30px',marginBottom:'30px'}}/>
                                        </Col>

                                        <Col xs={3} sm={3} md={3} lg={2}>
                                        <h2 className={'unfinishtitle'}><span className={'reporttitle'}>一般事项</span></h2>
                                        </Col>
                                        <Col xs={9} sm={9} md={8} lg={8}>
                                            <Card className={'reportcard'} style={{margin:'10px 0',paddingTop:0}} >
                                                <CardText style={{margin:'0 -2rem',paddingTop:0,paddingBottom:0}}>
                                                <Grid fluid >
                                                    <Row >
                                                        <Col xs={12} sm={12} md={12} lg={12}>
                                                            <TextField hintStyle={textstyle.hintStyle} hintText="点击新增一般事项" underlineShow={false} fullWidth={true} onFocus={(e)=>{this.handle.report.add.call(this);e.target.blur();}}></TextField>
                                                        </Col>
                                                    </Row>
                                                </Grid>
                                                </CardText>
                                            </Card>
                                            {this.state.report&&this.state.report.length>0&&this.state.report.map((itm,idx)=>{
                                                return (
                                                     <Card className={'reportcard'} style={{margin:'10px 0',paddingTop:0}} key={idx}>
                                                <CardText style={{margin:'0 -2rem',paddingTop:0}}>
                                                    <Grid fluid >
                                                        <Row>
                                                            <Col xs={9} sm={9} md={7} lg={7}>
                                                                <TextField  
                                                                  key={itm.id}
                                                                  floatingLabelText="填写内容" ref={itm.id}
                                                                  type='textarea' multiLine={true} underlineStyle={textstyle.underlineStyle} floatingLabelStyle={textstyle.floatingLabelStyle} floatingLabelFocusStyle={textstyle.floatingLabelFocusStyle}
                                                                  defaultValue={itm.content} 
                                                                  rows={1} 
                                                                  rowsMax={2} fullWidth={true}
                                                                  onChange={(e,news)=>{itm.content = news}}
                                                                />
                                                            </Col>
                                                            <Col xs={1} sm={1} md={2} lg={2}>
                                                                <TextField  style={{width:'100%'}} key={itm.id}    underlineStyle={textstyle.underlineStyle} floatingLabelStyle={textstyle.floatingLabelStyle} floatingLabelFocusStyle={textstyle.floatingLabelFocusStyle}                            
                                                                  floatingLabelText="填写耗时"  min={1}
                                                                  type='number' 
                                                                  defaultValue={itm.elapse}
                                                                  onChange={(e,news)=>{itm.elapse = news}}
                                                                />
                                                            </Col>
                                                               
                                                            <Col xs={1} sm={1} md={2} lg={2}>
                                                                <TextField  style={{width:'100%'}} key={itm.id}     underlineStyle={textstyle.underlineStyle} floatingLabelStyle={textstyle.floatingLabelStyle} floatingLabelFocusStyle={textstyle.floatingLabelFocusStyle}
                                                                  floatingLabelText="填写ticket" 
                                                                  defaultValue={itm.ticket}
                                                                  onChange={(e,news)=>{itm.ticket = news}}
                                                                />
                                                            </Col>
                                                            <Col xs={1} sm={1} md={1} lg={1}>
                                                                <IconButton style={{position: 'relative',top: '24px'}} tooltip="删除"  onClick={this.handle.report.delete.bind(this,itm)}>
                                                                  <DeleteIcn color={red300}/>
                                                                </IconButton>
                                                            </Col>
                                                        </Row>
                                                    </Grid>
                                                    
                                                    
                                                   

                                                    </CardText>
                                                </Card>
                                                );
                                            })}
                                        </Col>
                                        <Col xs={0} sm={0} md={1} lg={1}></Col>
                                    </Row>
                                  </Col>
                                <Col xs={1} sm={1} md={1} lg={1}></Col>
                            </Row>
                      </Grid>
                )}
                <div className={'margger'}></div>
                <Grid fluid>
                    <Row>
                        <Col xs={1} sm={1} md={1} lg={1}></Col>
                        <Col xs={10} sm={10} md={10} lg={10}>
                            <Row >
                                <Col xs={1} sm={1} md={1} lg={1}></Col>
                                <Col xs={4} sm={4} md={4} lg={4}>
                                    <DatePicker textFieldStyle={DatePickerStyle.textField}
                                          locale="zh-Hans-CN" disabled={this.state.isEdit}
                                          DateTimeFormat={Intl.DateTimeFormat} floatingLabelText="选择日期" 
                                          cancelLabel="取消" okLabel="确定" value={this.state.time}
                                          style={{width: '120px',}} autoOk
                                          textFieldStyle={{width: '120px'}} onChange={(n,newdate)=>{let date = new Date(newdate.toLocaleDateString());console.log(this.handle.time);this.handle.time.call(this,n,date)}}
                                          hintText="选择日期" minDate={theDayBeforeYester} maxDate={new Date}/>
                                </Col>
                                <Col xs={3} sm={4} md={4} lg={4}>
                                </Col>
                                <Col xs={1} sm={1} md={1} lg={1}>
                                    <div className={'f-textvertical'}>
                                        <RaisedButton style={{marginRight:'0'}}
                                            backgroundColor={lightBlue300} labelColor={'#fff'}
                                            disabled={this.state.saving || (!this.state.time || this.state.report.length==0 && this.state.task.length==0)}
                                            label={this.state.saving ? '保存中...': '保存日报'}
                                            onTouchTap={this.handle.save.bind(this)}/>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={1} sm={1} md={1} lg={1}></Col>
                         <Col xs={1} sm={1} md={1} lg={1}></Col>
                          <Col xs={10} sm={10} md={10} lg={10}>

                          </Col>
                        <Col xs={1} sm={1} md={1} lg={1}></Col>
                    </Row>
                </Grid>
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