/**
 * 
 */

import React from 'react';
import {browserHistory} from 'react-router';
import {FlatButton, SelectField, TextField, MenuItem,FontIcon, IconButton,Step,Stepper,StepLabel,StepContent,List, ListItem,Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,GridList, GridTile,
    Card, CardTitle,CardText,CardActions, CardHeader,DatePicker,Toolbar,ToolbarGroup,ToolbarTitle, RaisedButton, ToolbarSeparator,Popover,Tabs, Tab} from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import Bulleted from 'material-ui/svg-icons/editor/format-list-bulleted';
import Numbered from 'material-ui/svg-icons/editor/format-list-numbered';
import Title from 'material-ui/svg-icons/editor/title';
import {fetch} from 'lib/util';
import popup from 'cpn/popup';
import {style} from './index.scss';
import pubsub from 'vanilla-pubsub';
import Editor from 'cpn/Editor';
import format from 'date-format';
import Mock from 'cpn/Mock';
import { ExtendTable } from 'cpn/ExtendTable';
import _ from 'lodash';
import Backend from 'lib/backend';
import {TaskDetail as ShowDetail} from './detail.js'

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

let user = window.user || {name:123,id:19283877};
let history = Mock.progress.history;
console.log('history',history);
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
    this.fetchAll();
		return {unfinished:null,delay:null,list:null,labelValue:12,open:false};
	},
  fetchAll() {
    let unfinished = this.fetchunFinished();
    unfinished.then(function(d){

    }.bind(this))
    .catch(function(e){
      let result = _.filter(Mock.progress.my.list,tab=>{
        return tab.progress<100 && tab.progress>0 && tab.status==2;
      });
      let target = {
        list:_.clone(result,true),
        count:60
      }
      this.setState({unfinished:target});
    }.bind(this));

    let delays = this.fetchDelay();
    delays.then(function(d){

    }.bind(this))
    .catch(function(e){
      let result = _.filter(Mock.progress.my.list,tab=>{
        return tab.isdelay;
      });
      let target = {
        list:_.clone(result,true),
        count:60
      }
      this.setState({delay:target});
    }.bind(this));

    let list = this.fetchList();
    list.then(function(d){

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
    this.refs.showdetailcpn.switchType(2,data);
  
  },
  onDelete(data){
    
  },
  handleOpers(row,type) {
    switch(type+''){
      case '2':
        this.onEdit(row);
        break;
      case '3':
        this.onDetail(row);
        break;
      case '5'://申请延期
        this.onDelay(row);
        break;
      case '0'://删除
        this.onDelete(row);
        break;
    }
  },
  renderTable(curTab,target) {
      let items = target.list;
      if(_.isArray(items) && items.length>0){
        let firstItm = _.first(items);
        let columns = [];
        _.forIn(firstItm,(value,key)=>{
          if(maps[key] && curTab.hiddenfields.indexOf(key)<0)
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
          columns: columns,
          opers:this.handleOpers
        };
        return <ExtendTable config={config} />
      }else
        return null;
  },
	render() {
        pubsub.subscribe('task.list.reload', this.reloadList);
        return (
            <div className={style}>
                 <ShowDetail ref="showdetailcpn" />
                <Tabs
                    >
                    <Tab label={'未完成'} value={12}>
                      {this.state.unfinished?
                      (<div>{this.renderTable(tabs['12'],this.state.unfinished)}</div>):(
                          <div>
                          无数据
                          </div>)
                      }
                    </Tab>
                    <Tab label={'延期'} value={13}>
                      {this.state.delay?
                      (<div>{this.renderTable(tabs['13'],this.state.delay)}</div>):(
                          <div>
                          无数据
                          </div>)
                      }
                    </Tab>
                    <Tab label={'所有'} value={14}>
                      {this.state.list?
                      (<div>{this.renderTable(tabs['14'],this.state.list)}</div>):(
                          <div>
                          无数据
                          </div>)
                      }
                    </Tab>
                    </Tabs>
            </div>
        );
    }
});