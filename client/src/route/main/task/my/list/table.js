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
    title:'任务名',
    width:'12%'
  },
  progress:{
    title:'进度',
    formatter:function(data){
      return data.progress? data.progress+'%' : '0%';
    }
  },
  totaltime:{
    title:'耗时',
    formatter:function(data){
      return data.totaltime? data.totaltime+'h' : '未耗时';
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
    title:'描述',
    width:'10%'
  },
};
let pagecolumns = [10,15,20];
export default React.createClass({
    getInitialState() {
        return {list: [],count:0,delayrow:null,limit:pagecolumns[0]};
    },
    componentDidMount() {
        this._loadList(this.state.limit,0);
    },
    itemRender(itm,i) {

    },
    handleOpers(row,type,refname) {
    	console.log(row,type);

	    this.refname = refname;
	    console.log(this.refname);
	    switch(type+''){
	      case 'edit':
	        this.handle.edit.call(this,row);
	        break;
	      case 'info':
	        this.handle.detail.call(this,row);
	        break;
	      case 'delay'://申请延期
	        this.setState({delayrow:row})
	        break;
	      case 'delete'://删除
	        this.handle.delete.call(this,row);
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
		      width:maps[key].width?maps[key].width:'9%',
		      title:maps[key].title,
		      renderAs:maps[key].formatter?maps[key].formatter : function(data){
		       return data[key]
		      }
		    });
		});
		columns.push({
		  title:'延期及原因',width:'20%',renderAs:function(data){
		    let result = '延期了，因为';
		    data.isdelay ? (result+=data.delayreason):(result="没有延期");
		    return result;
		  }
		});

		var rect ={};// this.refs.TaskContainer.getBoundingClientRect();
		let target = {
			list:this.state.list,
			count:this.state.count,
			limit:this.state.limit
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
		        name:'info',
		        title:'查看详情',
		        creator:function(self,row){

		          return <IconButton   onClick={this.handleCb.bind(this,row,self.name)}  title={self.title} key={self.name}><InfoIcn color={blue300}/></IconButton>
		        },
		      },
		      {
		        name:'edit',
		        title:'编辑',
		        creator:function(self,row){
		          let showorhidden = row.status!=3&&row.status!=4;
		          return <IconButton  onClick={this.handleCb.bind(this,row,self.name)}  style={{display:showorhidden?'inline-block':'none'}} title={self.title} key={self.name}><EditIcn color={cyan300}/></IconButton>
		        },
		      },
		      {
		        name:'delete',
		        title:'删除',
		        creator:function(self,row){
		          let showorhidden = row.status!=4;
		          return <IconButton  onClick={this.handleCb.bind(this,row,self.name)}  style={{display:showorhidden?'inline-block':'none'}}  title={self.title} key={self.name}><DeleteIcn color={red300}/></IconButton>
		        },
		      },
		      {
		        name:'delay',
		        title:'申请延期',
		        creator:function(self,row){
		          let showorhidden =!row.isdelay && row.status!=4 &&row.status!=3;
		          return <IconButton  onClick={this.handleCb.bind(this,row,self.name)}  title={self.title} key={self.name} style={{display:showorhidden?'inline-block':'none'}}><DelayIcn color={deepOrange300}/></IconButton>
		        },
		      }
		    ],
		    
		  },
		  toolbar:{
		    pagenation:{
		      rowsPerPage:pagecolumns,
		      curPerPage:this.state.limit?this.state.limit:pagecolumns[0],
		      foldCallback:this.props.loadList,
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
    	const delayActions = [
            <FlatButton
              label="取消"
              onTouchTap={e=>{this.setState({delayrow:null})}}
            />,
            <FlatButton
              label="确定"
              primary={true} 
              keyboardFocused={true}
              onTouchTap={e=>{if(!this.refs.delayreson.getValue() || !this.refs.delaytime.state.date){popup.error('请填写延期理由及时间');return;} this.handle.delay.call(this,this.state.delayrow,this.refs.delayreson.getValue(),this.refs.delaytime.state.date);this.setState({delayrow:null})}}
            />,
          ];
        return <div > 
        	{this.state.list&&this.state.list.length>0&&this.renderTable()}
        	{!!this.state.delayrow?
	          <Dialog title="确定延期？"
	         actions={delayActions}
	         modal={false}
	         open={!!this.state.delayrow?true:false}>
	          <TextField ref='delayreson' fullWidth={true}
	            defaultValue=""
	            floatingLabelText="请填写延期理由"
	          />
	          <TextField 
	            defaultValue={(new Date(this.state.delayrow.time)).toLocaleDateString()} disabled={true}
	            floatingLabelText="当前截止时间" style={{display:'inline-block'}}
	          />
	          <DatePicker 
	              locale="zh-Hans-CN" ref='delaytime'
	              DateTimeFormat={Intl.DateTimeFormat}
	              cancelLabel="取消" okLabel="确定" 
	              style={{width: '120px'}} defaultDate={new Date(this.state.delayrow.time)}
	              textFieldStyle={{width: '120px'}}
	              hintText="延期至？" minDate={new Date(this.state.delayrow.time)}/>
	        </Dialog>
	          :null}
	           <ShowDetail ref="showdetailcpn" />
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
    _loadList(limit,offset) {
        this.setState({status:'loading'});
        this.props.loadList(limit,offset)
            .then(d=>{
                console.log(d);
                let result = this.props.formatter(d);
               	console.log(result);
                if(result && result.result.length>0){
                    this.setState({'list':this.props.getter().data.result,count:this.props.getter().data.count});
                }
                if(result && result.length==0){
                    this.setState({'list':this.props.getter().data.result});
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
    	delete(row) {
    		var _self = this;
    		popup.confirm({
	            msg: '确定删除此条任务?',
	            onOk: () => {
	                Backend.task.delete(row.id)
	                    .then(d => {
	                        _self.props.operations.delete(row);
	                        _self.setState({list:_self.props.getter().data.result});
	                        popup.success('删除成功');
	                    })
	                    .catch(e => {
	                        popup.success('删除失败');
	                    })
	            }
	        });
	    },
		detail(data) {
		    this.refs.showdetailcpn.switchType(3,data);
		  },
		edit(row){
			var _self = this;
		    //mock
		    this.refs.showdetailcpn.switchType(2,row,function(data){
		      Backend.task.edit(data)
                .then(d => {
                    pubsub.publish('task.list.reload.current');
                    popup.success('编辑成功');
                })
                .catch(e => {
                    popup.success('编辑失败');
                })
		    }.bind(this));
		  
		  },
	    delay(row,reason,time) {
	    	var _self = this;
	    	console.log(arguments);
	    	var data = _.clone(row,true);
	    	data.delayreason = reason;
	    	let date = new Date(time);
	    	date = new Date(date.toLocaleDateString());
	    	data.time = date.getTime();
	    	data.isdelay = true;
	    	Backend.task.delay(data)
                .then(d => {
                    // Report.operation.delete(rp);
                    // this.refs.listView.delete();
                    _self.props.operations.delay(data);
                    _self.setState({list:_self.props.getter().data.result});
                    popup.success('嗯，延期了');
                })
                .catch(e => {
                    popup.success('申请延期失败');
                })
	    },
    },
   
});