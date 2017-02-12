/**
 * 
 */

import React from 'react';
import {browserHistory} from 'react-router';
import {FlatButton, Dialog,SelectField, TextField, MenuItem,FontIcon, IconButton,Step,Stepper,StepLabel,StepContent,List, ListItem,Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,GridList, GridTile,
    Card, CardTitle,CardText,CardActions, CardHeader,DatePicker,Toolbar,ToolbarGroup,ToolbarTitle, RaisedButton, ToolbarSeparator,Popover,Tabs, Tab} from 'material-ui';

import AddIcon from 'material-ui/svg-icons/content/add';
import EditIcn from 'material-ui/svg-icons/editor/mode-edit';//编辑
import DeleteIcn from 'material-ui/svg-icons/action/delete';//删除
import InfoIcn from 'material-ui/svg-icons/action/info';//查看详情
import DelayIcn from 'material-ui/svg-icons/social/mood-bad';//申请延期
import {cyan300,blue300, red300, deepOrange300} from 'material-ui/styles/colors';

import Bulleted from 'material-ui/svg-icons/editor/format-list-bulleted';
import Numbered from 'material-ui/svg-icons/editor/format-list-numbered';
import Title from 'material-ui/svg-icons/editor/title';
import {fetch} from 'lib/util';
import popup from 'cpn/popup';
import {style} from './index.scss';
import pubsub from 'vanilla-pubsub';
import Editor from 'cpn/Editor';
import format from 'date-format';
import { ExtendTable } from 'cpn/ExtendTable';
import _ from 'lodash';
import Backend from 'lib/backend';
import {TaskModel} from './model';
import {TaskDetail as ShowDetail} from './detail.js'
import TableView from './table';

const cardStyle = {
  height:'100%'
}

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
};

let maps = {
  name:{
    title:'任务名'
  },
  progress:{
    title:'进度',
    formatter:function(data){
      return data.progress? data.progress+'%' : '';
    }
  },
  totaltime:{
    title:'耗时',
    formatter:function(data){
      return data.totaltime? data.totaltime+'h' : '';
    }
  },
  ticket:{
    title:'ticket'
  },
  time:{
    title:'截止时间',
    formatter:function(data){
      return data.time? data.time : '';
    }
  },
  status:{
    title:'任务状态',
    formatter:function(data){
      let result = '';
      switch(data.status+''){
        case '1':
          result = '未开始';
          break;
        case '2':
          result='进行中';
          break;
        case '3':
          result='已完成';
          break;
        case '4':
          result='已删除';
          break;
      }
      return result;
    }
  },
  description:{
    title:'描述'
  },
};
let tabs = {'12':{
    name:'未完成',//分成今日需完成以及所有未完成
    items:[],
    hiddenfields:['ticket','totaltime'],
    renderfunc:function(target){
      let items = target.list;
      if(_.isArray(items) && items.length>0){
        let firstItm = _.first(items);
        let columns = [];
        _.forIn(firstItm,(value,key)=>{
          if(maps[key])
            columns.push({
              property:key,
              title:maps[key].title,
              renderAs:maps[key].formatter?maps[key].formatter : function(data){
               return data[key]
              }
            });
        });
        columns.push({
          title:'延期及原因',renderAs:function(data){
            let result = '延期了，因为';
            data.isdelay ? (result+=data.delayreason):(result="没有延期");
            return result;
          }
        })
        let config = {
          paginated:true,
          search: 'name',   
          data: items,
          count:target.count,
          columns: columns
        };
        return <ExtendTable config={config} />
      }else
        return null;
    }
  },'13':{
    name:'延期任务',//列出延期任务
    items:[],
    hiddenfields:['ticket','status','totaltime'],
    renderfunc:function(target){
      let items = target.list;
      if(_.isArray(items) && items.length>0){
        let firstItm = _.first(items);
        let columns = [];
        _.forIn(firstItm,(value,key)=>{
          if(maps[key])
            columns.push({
              property:key,
              title:maps[key].title,
              renderAs:maps[key].formatter?maps[key].formatter : function(data){
               return data[key]
              }
            });
        });
        columns.push({
          title:'延期及原因',renderAs:function(data){
            let result = '延期了，因为';
            data.isdelay ? (result+=data.delayreason):(result="没有延期");
            return result;
          }
        })
        let config = {
          paginated: true,
          search: 'name',   
          data: items,
          count:target.count,
          columns: columns
        };
        return <ExtendTable config={config} />
      }else
        return null;
    }
  },'14':{
    name:'所有任务',
    items:[],
    hiddenfields:['ticket','status','totaltime'],
    renderfunc:function(target){
      let items = target.list;
      if(_.isArray(items) && items.length>0){
        let firstItm = _.first(items);
        let columns = [];
        _.forIn(firstItm,(value,key)=>{
          if(maps[key] && this.hiddenfields.indexOf(key)<0)
            columns.push({
              property:key,
              title:maps[key].title,
              renderAs:maps[key].formatter?maps[key].formatter : function(data){
               return data[key]
              }
            });
        });
        columns.push({
          title:'延期及原因',renderAs:function(data){
            let result = '延期了，因为';
            data.isdelay ? (result+=data.delayreason):(result="没有延期");
            return result;
          }
        })
        let config = {
          paginated: true,
          search: 'name',   
          data: items,
          count:target.count,
          columns: columns
        };
        return <ExtendTable config={config} />
      }else
        return null;
    }
  }
};

module.exports = React.createClass({
	getInitialState() {
		return {unfinished:null,delay:null,list:null,labelValue:12,open:false};
	},
  fetchAll() {
    // let unfinished = this.fetchunFinished();
    // unfinished.then(function(d){

    // }.bind(this))
    // .catch(function(e){
    //   let result = _.filter(Mock.progress.my.list,tab=>{
    //     return tab.progress<100 && tab.progress>0 && tab.status==2;
    //   });
    //   let target = {
    //     list:_.clone(result,true),
    //     count:result.length+1000
    //   }
    //   this.setState({unfinished:target});
    // }.bind(this));

    // let delays = this.fetchDelay();
    // delays.then(function(d){

    // }.bind(this))
    // .catch(function(e){
    //   let result = _.filter(Mock.progress.my.list,tab=>{
    //     return tab.isdelay;
    //   });
    //   let target = {
    //     list:_.clone(result,true),
    //     count:60
    //   }
    //   this.setState({delay:target});
    // }.bind(this));
  
    let list = this.fetchList();
    list.then(function(d){
      console.log('list',d);
    }.bind(this))
    .catch(function(e){
      
      this.setState({list:Mock.progress.my});
    }.bind(this));
  },
  fetchList(limit,offset) {
    let params = {
      userid:user.id,
      limit:limit?limit:20,
      offset:offset?offset:0
    };
    return Backend.task.get.list(params);
  },
  fetchDelay(limit,offset) {
    let params = {
      userid:user.id,
      limit:limit?limit:20,
      offset:offset?offset:0
    };
    return Backend.task.get.delay(params);
  },
  fetchunFinished(limit,offset) {
    let params = {
      userid:user.id,
      status:2,
      limit:limit?limit:20,
      offset:offset?offset:0
    };
    return Backend.task.get.unfinished(params);
  },
  reloadList() {
    alert('reload list');
    let list = this.fetchList();
    list.then(function(d){

    }.bind(this))
    .catch(function(e){
      
      this.setState({list:Mock.progress.my.list});
    }.bind(this));
  },
	componentDidMount() {
		let barConf = {
            title: '新增任务',
            titleStyle:{
                fontSize:'16px',
                marginLeft:'-20px'
            },
            iconElementLeft:<IconButton title="新增任务" onClick={this.onAdd}><AddIcon color={'#fff'}/></IconButton>
        };
        pubsub.publish('config.appBar', barConf);
	},

  handleChange(value) {
    this.setState({
      labelValue: value,
    });
  },

	componentWillUnMount() {

	},
  onAdd() {
   this.refs.showdetailcpn.switchType(1);
  },
  onDetail(data) {
    this.refs.showdetailcpn.switchType(3,data);
  },
  onEdit(data){
    //mock
    this.refs.showdetailcpn.switchType(2,data,function(data){
      var result = _.findIndex(this.refs[this.refname].state.tableData,(itm)=>{
        return data.id==itm.id;
      });
      if(result>=0)
        this.refs[this.refname].state.tableData[result] = data;
      this.refs[this.refname].forceUpdate();
    }.bind(this));
  
  },
  onDelete(data){
    this.setState({deleterow:data});
  },
  deleteRow(data){
    var result = _.findIndex(this.refs[this.refname].state.tableData,(itm)=>{
      return data.id==itm.id;
    });
    if(result>=0)
      this.refs[this.refname].state.tableData[result].status = 4;
    this.refs[this.refname].forceUpdate();
    //this.refs[this.refname].setState({tableData:});
  },
  onDelay(data) {
    this.setState({delayrow:data})
    //Backend.task.delay(data.id);
  },
  delayRow(data,reason,time) {
    //Backend.task.delay(data.id);
    var result = _.findIndex(this.refs[this.refname].state.tableData,(itm)=>{
      return data.id==itm.id;
    });
    if(result>=0){
      this.refs[this.refname].state.tableData[result].isdelay = true;
      this.refs[this.refname].state.tableData[result].delayreason = reason;
      this.refs[this.refname].state.tableData[result].time = reason;
    }

    this.refs[this.refname].forceUpdate();
  },
  handleOpers(row,type,refname) {
    this.refname = refname;
    console.log(this.refname);
    switch(type+''){
      case 'edit':
        this.onEdit(row);
        break;
      case 'info':
        this.onDetail(row);
        break;
      case 'delay'://申请延期
        this.onDelay(row);
        break;
      case 'delete'://删除
        this.onDelete(row);
        break;
    }
  },
  renderTable(curTab,target,refname) {
      let items = target.list;
      if(_.isArray(items) && items.length>0){
        let firstItm = _.first(items);
        let columns = [];
        _.forIn(firstItm,(value,key)=>{
          if(maps[key] && curTab.hiddenfields.indexOf(key)<0)
            columns.push({
              property:key,
              width:'10%',
              title:maps[key].title,
              renderAs:maps[key].formatter?maps[key].formatter : function(data){
               return data[key]
              }
            });
        });
        columns.push({
          title:'延期及原因',width:'30%',renderAs:function(data){
            let result = '延期了，因为';
            data.isdelay ? (result+=data.delayreason):(result="没有延期");
            return result;
          }
        })
        // let config = {
        //   paginated: true,
        //   search: 'name',   
        //   data: target,
        //   count:target.count,
        //   columns: columns,
        //   opers:this.handleOpers
        // };
        var rect = this.refs.TaskContainer.getBoundingClientRect();
        let config = {
          tablemode:2,
          data:target,
          maxWidth:rect.width,
          body:{
            columns:columns,
            hasOpers:true,
            //传递需要渲染的opers，如果不传递，并且hasOpers为true，那么将会渲染出默认提供的操作方式
            handleCb:this.handleOpers,
            style:{isSelect:false},
            opers:[
              {
                name:'edit',
                title:'编辑',
                creator:function(self,row){
                  let showorhidden = row.status!=3&&row.status!=4;
                  return <IconButton onClick={this.handleCb.bind(this,row,self.name,refname)} style={{display:showorhidden?'inline-block':'none'}} title={self.title} key={self.name}><EditIcn color={cyan300}/></IconButton>
                },
              },
              {
                name:'delete',
                title:'删除',
                creator:function(self,row){
                  let showorhidden = row.status!=4;
                  return <IconButton style={{display:showorhidden?'inline-block':'none'}} onClick={this.handleCb.bind(this,row,self.name,refname)}  title={self.title} key={self.name}><DeleteIcn color={red300}/></IconButton>
                },
              },
              {
                name:'info',
                title:'查看详情',
                creator:function(self,row){

                  return <IconButton onClick={this.handleCb.bind(this,row,self.name,refname)}  title={self.title} key={self.name}><InfoIcn color={blue300}/></IconButton>
                },
              },
              {
                name:'delay',
                title:'申请延期',
                creator:function(self,row){
                  let showorhidden =!row.isdelay &&row.status!=4;
                  return <IconButton onClick={this.handleCb.bind(this,row,self.name,refname)} title={self.title} key={self.name} style={{display:showorhidden?'inline-block':'none'}}><DelayIcn color={deepOrange300}/></IconButton>
                },
              }
            ],
            
          },
          toolbar:{
            pagenation:{
              rowsPerPage:[5,10,20],
              foldCallback:Backend.task.get.list,
              locate:'top'
            },
            search:{
              field:'name',
              foldCallback:Backend.task.search,
              condition:'',
              locate:'top'
            }
          }
        }
        return <ExtendTable ref={refname} config={config} />
      }else
        return null;
  },
	render() {
        const deleteActions = [
          <FlatButton
            label="取消"
            onTouchTap={e=>{this.setState({deleterow:null})}}
          />,
          <FlatButton
            label="确定"
            primary={true}
            keyboardFocused={true}
            onTouchTap={e=>{this.deleteRow(this.state.deleterow);this.setState({deleterow:null})}}
          />,
        ];
        const delayActions = [
            <FlatButton
              label="取消"
              onTouchTap={e=>{this.setState({delayrow:null})}}
            />,
            <FlatButton
              label="确定"
              primary={true} 
              keyboardFocused={true}
              onTouchTap={e=>{if(!this.refs.delayreson.getValue() || !this.refs.delaytime.state.date){popup.error('请填写延期理由及时间');return;} this.delayRow(this.state.delayrow,this.refs.delayreson.getValue(),this.refs.delaytime.state.date);this.setState({delayrow:null})}}
            />,
          ];
        pubsub.subscribe('task.list.reload', this.reloadList);
        return (
            <div className={style} ref='TaskContainer'>
                 <ShowDetail ref="showdetailcpn" />
                <Tabs
                    >
                    <Tab label={'未完成'} value={12}>
                      {this.state.unfinished?
                      (<div>{this.renderTable(tabs['12'],this.state.unfinished,'unfinished')}</div>):(
                          <div>
                          无数据
                          </div>)
                      }
                    </Tab>
                    <Tab label={'延期'} value={13}>
                      {this.state.delay?
                      (<div>{this.renderTable(tabs['13'],this.state.delay,'delay')}</div>):(
                          <div>
                          无数据
                          </div>)
                      }
                    </Tab>
                    <Tab label={'所有'} value={14}>
                      <div>
                      <TableView loadList={TaskModel.get.list} operations={TaskModel.opers.list} getter={TaskModel.getter.list} formatter={TaskModel.formatter.list} />
                      </div>
                    </Tab>
                    </Tabs>
                    {!!this.state.deleterow?
                      <Dialog 
                      title="确定删除？"
                     actions={deleteActions}
                     modal={false}
                     open={!!this.state.deleterow?true:false}>
                     
                    </Dialog>
                      :null}
                    {!!this.state.delayrow?
                      <Dialog title="确定延期？"
                     actions={delayActions}
                     modal={false}
                     open={!!this.state.delayrow?true:false}>
                      <TextField ref='delayreson'
                        defaultValue=""
                        floatingLabelText="请填写延期理由"
                      />
                      <DatePicker 
                          locale="zh-Hans-CN" ref='delaytime'
                          DateTimeFormat={Intl.DateTimeFormat}
                          cancelLabel="取消" okLabel="确定" 
                          style={{width: '120px'}}
                          textFieldStyle={{width: '120px'}}
                          hintText="选择日期" minDate={new Date}/>
                    </Dialog>
                      :null}
            </div>
        );
    }
});