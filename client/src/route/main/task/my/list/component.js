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
import { MuiDataTable } from 'mui-data-table';
import _ from 'lodash';
import Backend from 'lib/backend';

let user = window.user || {name:123,id:19283877};
const cardStyle = {
  height:'100%'
}
const data = [
  { id: 1, name: 'Chikwa Eligson', age: 24, location: 'Lagos', level: 'stage-1', mood: 'happy' },
  { id: 2, name: 'Bamidele Johnson', age: 18, location: 'Anambra', level: 'stage-4', mood: 'anxious' },
  { id: 3, name: 'John Lee', age: 20, location: 'Abuja', level: 'stage-2', mood: 'indifferent' },
  { id: 4, name: 'Binta Pelumi', age: 22, location: 'Jos', level: 'stage-3', mood: 'sad' },
  { id: 5, name: 'Cassidy Ferangamo', age: 30, location: 'Lagos', level: 'stage-4', mood: 'angry' },
  { id: 6, name: 'Damian Swaggbag', age: 35, location: 'PortHarcourt', level: 'stage-1', mood: 'bitter' },
  { id: 7, name: 'Loveth Sweetstick', age: 20, location: 'Imo', level: 'stage-3', mood: 'happy' },
  { id: 8, name: 'Zzaz Zuzzi', age: 19, location: 'Bayelsa', level: 'stage-2', mood: 'party-mood' },
  { id: 9, name: 'Ian Sweetmouth', age: 18, location: 'Enugu', level: 'stage-4', mood: 'happy' },
  { id: 10, name: 'Elekun Bayo', age: 21, location: 'Zamfara', level: 'stage-4', mood: 'anxious' },
];

const config = {
  paginated: true,
  search: 'name',   
  data: data,
  columns: [
    { property: 'id', title: 'S/N'},
    { property: 'name', title: 'Name' },
    { property: 'age', title: 'Age' },
    { property: 'location', title: 'Location' },
    { property: 'level', title: 'level' },
    { title: 'Mood', renderAs: function (data) {
      return `${data.name} is in a ${data.mood} mood.`;
    }},
  ]
};

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
};
let tabs = [{
    id:12,
    name:'未完成',
    items:[]
  },{
    id:13,
    name:'延期',
    items:[]
  },{
    id:14,
    name:'所有任务',
    items:[]
  }
];



module.exports = React.createClass({
	getInitialState() {
    this.fetchAll();
		return {tabdata:{'12':[],'13':[],'14':[]},labelValue:12};
	},
  fetchAll() {
    let unfinished = this.fetchunFinished();
    unfinished.then(function(d){

    }.bind(this))
    .catch(function(e){
      let result = _.filter(tabs,tab=>{
        return tab.progress<100 && tab.progress>0;
      });
      this.setState({tabdata:{'12':result}});
    }.bind(this));

    let delays = this.fetchDelay();
    delays.then(function(d){

    }.bind(this))
    .catch(function(e){
      let result = _.filter(tabs,tab=>{
        return tab.isdelay;
      });
      this.setState({tabdata:{'13':result}});
    }.bind(this));

    let list = this.fetchList();
    list.then(function(d){

    }.bind(this))
    .catch(function(e){
      
      this.setState({tabdata:{'14':result}});
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
	componentDidMount() {
		let barConf = {
            title: '新增任务',
            titleStyle:{
                fontSize:'16px',
                marginLeft:'-20px'
            },
            iconElementLeft:<IconButton title="新增任务" onClick={this._create}><AddIcon color={'#fff'}/></IconButton>
        };
        pubsub.publish('config.appBar', barConf);
	},
	_create() {
    //弹窗出来进行编辑或创建
		//browserHistory.push('/m/task/my/edit');
	},

  handleChange(value) {
    this.setState({
      labelValue: value,
    });
  },

	componentWillUnMount() {

	},
	_loadList(data) {
        return Backend.task.get(data);
        //return fetch('/api/report/my?limit=${limit}&offset=${offset}');
  },

	render() {
        return (
            <div className={style}>
                <Card initiallyExpanded style={cardStyle}>
                  <CardText>
                   <Tabs
                      value={this.state.labelValue}
                      onChange={this.handleChange}
                    >
                    {tabs.map((tab)=>(
                      <Tab label={tab.name} value={tab.id}>
                        {this.state.tabdata[tab.id]&&this.state.tabdata[tab.id].length>0?(<div>
                          
                          </div>):(
                          <div>
                          无数据
                          </div>)}
                      </Tab>
                    ))}
                    </Tabs>
                  </CardText>
                </Card>
            </div>
        );
    }
});