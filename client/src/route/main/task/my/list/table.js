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

const maps = {
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
      return data.time? (new Date(data.time)).toLocaleDateString() : '';
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

export default React.createClass({
    getInitialState() {
        return {list: [],count:0};
    },
    componentDidMount() {
        this._loadList();
    },
    itemRender(itm,i) {

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
		let items = this.state.list;
		if(_.isArray(items) && items.length>0){
		let firstItm = _.first(items);
		let columns = [];
		_.forIn(firstItm,(value,key)=>{
		  if(maps[key])
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
		});

		var rect ={};// this.refs.TaskContainer.getBoundingClientRect();
		target = {
			list:this.state.list,
			count:this.state.count
		};
		let config = {
		  tablemode:2,
		  data:target,
		  maxWidth:rect.width||500,
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
		          return <IconButton style={{display:showorhidden?'inline-block':'none'}} title={self.title} key={self.name}><EditIcn color={cyan300}/></IconButton>
		        },
		      },
		      {
		        name:'delete',
		        title:'删除',
		        creator:function(self,row){
		          let showorhidden = row.status!=4;
		          return <IconButton style={{display:showorhidden?'inline-block':'none'}}  title={self.title} key={self.name}><DeleteIcn color={red300}/></IconButton>
		        },
		      },
		      {
		        name:'info',
		        title:'查看详情',
		        creator:function(self,row){

		          return <IconButton  title={self.title} key={self.name}><InfoIcn color={blue300}/></IconButton>
		        },
		      },
		      {
		        name:'delay',
		        title:'申请延期',
		        creator:function(self,row){
		          let showorhidden =!row.isdelay &&row.status!=4;
		          return <IconButton title={self.title} key={self.name} style={{display:showorhidden?'inline-block':'none'}}><DelayIcn color={deepOrange300}/></IconButton>
		        },
		      }
		    ],
		    
		  },
		  toolbar:{
		    pagenation:{
		      rowsPerPage:[5,10,20],
		      foldCallback:this.props.loadlist,
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
        return <div > 
        	{this.state.list&&this.state.list.length>0&&this.renderTable()}
        </div>;
    },
    _renderStatus() {
        switch (this.state.status) {
            case 'loading':
                return <CircularProgress className="loading"/>;
            case 'empty':
                return <Empty tip=""/>;
            case 'done':
                return <Empty type={1} tip="我是有底线的~"/>;
            case 'error':
                return <Empty tip="列表加载出错"/>;
        }
    },
    _loadList() {
        this.setState({status:'loading'});
        this.props.loadList()
            .then(d=>{
                console.log(d);
                let data = d.list;
                let result = this.props.formatter(data);
               	console.log(result);
                if(result && result.length>0){
                    this.setState({'list':this.props.getter()});
                }
                if(result && result.length==0){
                    this.setState({status:'done',loaded:true});
                }else{
                    this.setState({status:'loaded'});
                }
            })
            .catch(e => {
                
                //后面需要撤销注释
                this.setState({status: 'error'});
            });
    },
    handle:{
    	 delete() {
	        // this.setState({'list':this.props.getter()});
	        // var target = _.filter(this.state.list,itm=>{
	        //     return itm.status!=3;
	        // });
	        // if(target.length<=1){
	        //     this._loadList();
	        // }
	    },
	    edit() {

	    },

	    updateView() {
	        this.setState({'list':this.props.getter()});

	    }
    },
   
});