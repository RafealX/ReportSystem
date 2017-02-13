import React from 'react';
import {browserHistory} from 'react-router';
import {FlatButton,Dialog,DatePicker,TextField,
	Card, CardActions, CardHeader, CardMedia, CardTitle, CardText,
	Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn
} from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import Bulleted from 'material-ui/svg-icons/editor/format-list-bulleted';
import Numbered from 'material-ui/svg-icons/editor/format-list-numbered';
import Title from 'material-ui/svg-icons/editor/title';
import popup from 'cpn/popup';
import pubsub from 'vanilla-pubsub';
import Mock from 'cpn/Mock';
import _ from 'lodash';
import Backend from 'lib/backend';
import {style} from './index.scss';

export class TaskDetail extends React.Component {
	//需要展示数据：
	//查看详情   
	//所有信息 包括taskhistory
	//编辑  新建
	//任务名 任务关联ticket 任务描述
	constructor(porps){
		super();
		this.fakedata = {
			name:'新建任务',
			progress:0,
			totaltime:0,
			ticket:'',
			description:'',
			time:new Date,
			status:2,
			isdelay:false,
			delayreason:'',
			id:-1
		}
		this.title = {
			'1':'新建任务',
			'2':'编辑任务',
			'3':'详情'
		}
		this.state={
			open:false
		};
		this.taskstatus = {
			'1':'未开始',
			'2':'进行中',
			'3':'已完成',
			'4':'已删除'
		}
		// this.state={
		// 	open:false,
		// 	type:1,//新建1 编辑2 查看详情3
		// 	data:props.data || fakedata,
		// 	history:null,
		// 	title:title[props.type || 1]
		// };
		// if(this.state.type==3){
		// 	this.fetchTaskHistory(this.state.data.id)
		// }
	};
	fetchTaskHistory(id) {
		return Backend.task.get.history({taskid:id,limit:50});
	};
	handleClose() {
		console.log(this);
		let data,params;
		switch(this.state.type+''){
			case '1':
				data = _.clone(this.state.data,true);
				console.log('params',data);
				data.time = new Date((new Date(data.time).toLocaleDateString())).getTime();
				Backend.task.add(data).then(d=>{
					popup.success('添加成功');
					if(this.callback){
						this.callback(d.task);
					}
					pubsub.publish('task.list.reload');
				}).catch(e=>{
					popup.error('添加失败');
				});
				break;
			case '2':
				data = _.clone(this.state.data,true);
				if(this.callback){
					this.callback(data);
				}
				break;
			case '3':
				break;
		}
		this.setState({open:false});
	};
	handleShow(isshow) {
		this.setState({open:isshow||false});
	};
	switchType(type,data,callback) {
		if(_.isFunction(callback)){
			this.callback = callback;
		}else{
			this.callback = null;
		}
		if(type+''=='3'){
			this.fetchTaskHistory(data.id).then(d=>{
				this.setState({history:d.taskhistory,type:type,data:data,title:this.title[type]||'新增任务'});	
				this.setState({open:true});
			}).catch(e=>{
				// this.setState({history:Mock.progress.history});
				// console.log('history',this.state);
				// this.setState({history:Mock.progress.history,type:type,data:data||this.fakedata,title:this.title[type]||'新增任务'});	
				// this.setState({open:true});
			});
		}else{
			this.setState({type:type,data:data||this.fakedata,title:this.title[type]||'新增任务'});	
			this.setState({open:true});
		}
	};
	close() {
		this.setState({open:false});
	}
	render() {
		 const actions = [
          <FlatButton
            label="确定"
            primary={true}
            onTouchTap={this.handleClose.bind(this)}
          />,
          <FlatButton
            label="取消" style={{display:(this.state.type+''!='3')?'inline-block':'none'}}
            onTouchTap={this.close.bind(this)}
          />
        ];
		return (
			<Dialog title={this.state.title||'新增任务'} 
					actions={actions}
					modal={true}
					open={this.state.open} autoDetectWindowHeight={false}
					onRequestClose={this.close.bind(this)} className={style}>
				{this.state.type+''=='1'?(
					<div>
					<TextField
				      floatingLabelText="任务名称"
				      disabled={this.state.type+''=='3'}
				      defaultValue={this.state.data.name||''}
				      onChange={event=>{
				      	let data = _.clone(this.state.data,true);
				      	data.name = event.target.value;
				      	this.setState({data: data})
				      }}
				    />
				    <TextField
				      disabled={this.state.type+''=='3'}
				      floatingLabelText="任务描述"
				      defaultValue={this.state.data.description||''} 
				      onChange={event=>{
				      	let data = _.clone(this.state.data,true);
				      	data.description = event.target.value;
				      	this.setState({data: data})
				      }}
				    />
				     <TextField				      
				      floatingLabelText="任务关联ticket"
				      disabled={this.state.type+''=='3'}
				      defaultValue={this.state.data.ticket||''}
				      onChange={event=>{
				      	let data = _.clone(this.state.data,true);
				      	data.ticket = event.target.value;
				      	this.setState({data: data})
				      }}
				    />
				    <DatePicker 
                          locale="zh-Hans-CN"
                          DateTimeFormat={Intl.DateTimeFormat}
                          cancelLabel="取消" okLabel="确定"
                          style={{width: '120px', marginTop: '4px'}}
                          textFieldStyle={{width: '120px'}}
                          hintText="任务截止时间" minDate={new Date} 
                          onChange={(event,date)=>{
					      	let data = _.clone(this.state.data,true);
					      	data.time =date;
					      	this.setState({data: data})
					      }}
				      />
				    </div>
				):
				(this.state.type+''=='2'?(
					<div>
					<TextField
				      floatingLabelText="任务名称"
				      disabled={this.state.type+''=='3'}
				      defaultValue={this.state.data.name||''}
				      onChange={event=>{
				      	let data = _.clone(this.state.data,true);
				      	data.name = event.target.value;
				      	this.setState({data: data})
				      }}
				    />
				    <TextField
				      disabled={this.state.type+''=='3'}
				      floatingLabelText="任务描述"
				      defaultValue={this.state.data.description||''} 
				      onChange={event=>{
				      	let data = _.clone(this.state.data,true);
				      	data.description = event.target.value;
				      	this.setState({data: data})
				      }}
				    />
				     <TextField				      
				      floatingLabelText="任务关联ticket"
				      disabled={this.state.type+''=='3'}
				      defaultValue={this.state.data.ticket||''}
				      onChange={event=>{
				      	let data = _.clone(this.state.data,true);
				      	data.ticket = event.target.value;
				      	this.setState({data: data})
				      }}
				    />
				    
				    </div>
				):
				(this.state.type+''=='3'?(
				<div className={"fordetail"}>
					<TextField
				      floatingLabelText="任务名称"
				      disabled={this.state.type+''=='3'}
				      defaultValue={this.state.data.name||''}
				      onChange={event=>{
				      	let data = _.clone(this.state.data,true);
				      	data.name = event.target.value;
				      	this.setState({data: data})
				      }}
				    />
				    <TextField
				      disabled={this.state.type+''=='3'}
				      floatingLabelText="任务描述"
				      defaultValue={this.state.data.description||''} 
				      onChange={event=>{
				      	let data = _.clone(this.state.data,true);
				      	data.description = event.target.value;
				      	this.setState({data: data})
				      }}
				    />
				     <TextField				      
				      floatingLabelText="任务关联ticket"
				      disabled={this.state.type+''=='3'}
				      defaultValue={this.state.data.ticket||''}
				      onChange={event=>{
				      	let data = _.clone(this.state.data,true);
				      	data.ticket = event.target.value;
				      	this.setState({data: data})
				      }}
				    />
				    <TextField				      
				      floatingLabelText="任务进度"
				      disabled={this.state.type+''=='3'}
				      defaultValue={this.state.data.progress||''}
				    />
				    <TextField				      
				      floatingLabelText="任务总耗时"
				      disabled={this.state.type+''=='3'}
				      defaultValue={this.state.data.totaltime||''}
				    />
				    <TextField				      
				      floatingLabelText="任务状态"
				      disabled={this.state.type+''=='3'}
				      defaultValue={this.state.data.status?this.taskstatus[this.state.data.status]:''}
				    />
				    <DatePicker 
                          locale="zh-Hans-CN" 
                          DateTimeFormat={Intl.DateTimeFormat}
                          cancelLabel="取消"  okLabel="确定"
                          style={{width: '120px', marginTop: '4px'}}
                          textFieldStyle={{width: '120px'}}
                          hintText="任务截止时间" defaultDate={this.state.data.time?(new Date(this.state.data.time)):null}  disabled={true}
				      />
				      <Card style={{display:this.state.history&&this.state.history.length>0?'block':'none'}}>
				      	<CardHeader  subtitle="任务历史" />
				      	<CardText>
				      		<Table >
						    <TableHeader>
						      <TableRow>
						        <TableHeaderColumn>时间</TableHeaderColumn>
						        <TableHeaderColumn>耗时</TableHeaderColumn>
						        <TableHeaderColumn>概要</TableHeaderColumn>
						        <TableHeaderColumn>碰到问题</TableHeaderColumn>
						      </TableRow>
						    </TableHeader>
						    <TableBody>
						    	{this.state.history&&this.state.history.length>0&&this.state.history.map((row,index)=>(
									<TableRow key={index} selected={row.selected}>
						                <TableRowColumn>{(new Date(row.time)).toLocaleDateString()}</TableRowColumn>
						                <TableRowColumn>{row.elapse+'h'}</TableRowColumn>
						                <TableRowColumn>{row.summary}</TableRowColumn>
						                <TableRowColumn>{row.question}</TableRowColumn>
						              </TableRow>
								))}
						    </TableBody>
						    </Table>
				      		
				      	</CardText>
				      </Card>
					
				</div>
				):
				(<span style={{display: 'none'}}></span>)))}
				
				</Dialog>
		);
	};
}