/**
 * 
 */

import React from 'react';
import {browserHistory} from 'react-router';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {FlatButton,Paper, Dialog,SelectField, TextField, MenuItem,FontIcon, IconButton,Step,Stepper,StepLabel,StepContent,List, ListItem,Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,GridList, GridTile,
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
  tab:{
    backgroundColor:'#fd9098',
  },
  inkBarStyle:{
    backgroundColor:'#ff808a'
  }

};
const PaperStyle = {
    boxShadow:'rgba(0, 0, 0, 0.117647) 0px 0px 0px, rgba(0, 0, 0, 0.117647) 0px 0px 4px',
    backgroundColor:'#fff',
    height:'56px',
    borderRadius:0
}


module.exports = React.createClass({
	getInitialState() {
		return {unfinished:null,delay:null,list:null,labelValue:12,open:false};
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
        return (
            <div className={style} ref='TaskContainer'>
              <Paper zDepth={1} style={PaperStyle}>
                  <Grid style={{height:'100%',width:'100%'}}>
                      <Row style={{height:'100%'}}>
                          <Col xs={1} sm={1} md={2} lg={2} style={{height:'100%'}}>
                              <FlatButton labelStyle={{color:'#000'}} hoverColor="#eee"
                                label="新增任务"  onClick={this.onAdd}
                                primary={true} style={{marginLeft:'0px'}} style={{height:'100%',padding:0,margin:0}}
                                icon={<AddIcon color={'#8c8b8b'}/>}
                              />
                          </Col>
                      </Row>
                  </Grid>
              </Paper>
              
                 <ShowDetail ref="showdetailcpn" />
                <Tabs style={{margin: '10px'}} inkBarStyle={styles.inkBarStyle}
                    > 
                    <Tab label={'所有'} value={14} style={styles.tab}>
                      <div>
                      <TableView loadList={TaskModel.get.list} operations={TaskModel.opers.list} getter={TaskModel.getter.list} formatter={TaskModel.formatter.list} />
                      </div>
                    </Tab>
                    
                    <Tab label={'未完成'} value={12} style={styles.tab}>
                      {this.state.unfinished?
                      (<div>{this.renderTable(tabs['12'],this.state.unfinished,'unfinished')}</div>):(
                          <div>
                          无数据
                          </div>)
                      }
                    </Tab>
                    <Tab label={'延期'} value={13} style={styles.tab}>
                      {this.state.delay?
                      (<div>{this.renderTable(tabs['13'],this.state.delay,'delay')}</div>):(
                          <div>
                          无数据
                          </div>)
                      }
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