/**
 * 报告
 */
import React from 'react';
import {browserHistory} from 'react-router';
import {FlatButton, Toolbar,ToolbarGroup,ToolbarTitle,Card, CardActions, CardHeader, IconButton,Dialog,DatePicker,Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,GridList, GridTile,
    CardText, List, ListItem, Avatar, Divider, Popover, Menu, MenuItem,Step,Stepper,StepLabel,StepContent} from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import IconMenu from 'material-ui/IconMenu';
import {fetch} from 'lib/util';
import popup from 'cpn/popup';
import {style} from '../../index.scss';
import pubsub from 'vanilla-pubsub';
import ListView from 'cpn/ListView';
import Mock from 'cpn/Mock';
import _ from 'lodash';
import Backend from 'lib/backend';
const StepperStyle = {
    fontSize:0
}
const containerStyle = {
    display:'none'
}


module.exports = React.createClass({
    getInitialState() {
        return {rps: [], myTeams: [],stepIndex:0, finished: false,show:false,list:Mock.task.my.list,
        fixedHeader: true,
      fixedFooter: true,
      stripedRows: false,
      showRowHover: false,
      selectable: true,
      multiSelectable: false,
      enableSelectAll: false,
      deselectOnClickaway: true,
      showCheckboxes: true,
      height: '300px'};
    },
    componentDidMount() {
        let barConf = {
            title: '新增工作日记',
            titleStyle:{
                fontSize:'16px',
                marginLeft:'-20px'
            },
            iconElementLeft:<IconButton title="新增工作日记" onClick={this._create}><AddIcon color={'#fff'}/></IconButton>
        };
        pubsub.publish('config.appBar', barConf);
        fetch('/api/team/myList')
            .then(d => {
                this.setState({
                    myTeams: d.teams
                });
            })
    },
    handleChange(e,c) {
        switch(c.props.value*1){
            case 1:
               this.setState({
                open:true
               });
               break;
            case 2:
               
        }
    },
    render() {
        let reportRender = (x,i)=>
            <div>
            <span>{i+1}&nbsp;&nbsp;</span>
            <span>{x.content}&nbsp;&nbsp;</span>
            <span>{x.elapse?x.elapse+'小时  ':''}</span>
            <span>{x.ticket}&nbsp;&nbsp;</span>
            </div>;
        let taskRender = (x,i)=><div>
            <span>{i+1}&nbsp;&nbsp;</span>
            <span>{x.name}&nbsp;&nbsp;</span>
            <span>{x.progress?x.progress+'%  ':''}</span>
            <span>{x.elapse?x.elapse+'小时':''}</span>
            <h4 style={{fontWeight:'normal',lineHeight:'20px',marginLeft: '18px'}}>问题：{x.question}</h4>
            <h4 style={{fontWeight:'normal',lineHeight:'20px',marginLeft: '18px'}}>总结：{x.summary}</h4>
            </div>;
        let itemRender = (x, i) => 
        <Step active={true} className="step">
        <StepLabel iconContainerStyle={containerStyle}>{new Date(x.time).toLocaleDateString()}</StepLabel>
        <StepContent>
          <Card initiallyExpanded key={i} className="item">
            <CardHeader
                showExpandableButton
                className="header" style={{'display':'none'}}
                title={x.time}/>
            <CardText expandable>
                <GridList cellHeight={300}>
                    <GridTile >
                        <Toolbar>
                            <ToolbarGroup style={{textAlign:'center',width:'100%'}}>
                                <ToolbarTitle text="普通事项" style={{textAlign:'center',width:'100%'}}/>
                            </ToolbarGroup>
                        </Toolbar>
                          <List>
                            {x.reports.map( (row, index) => (
                              <ListItem key={index}  selected={row.selected}>
                                {reportRender(row,index)}
                                
                              </ListItem>
                              ))}
                          </List>  
                          
                    </GridTile>
                    <GridTile>
                        <Toolbar>
                            <ToolbarGroup style={{textAlign:'center',width:'100%'}}>
                                <ToolbarTitle text="任务事项" style={{textAlign:'center',width:'100%'}}/>
                            </ToolbarGroup>
                        </Toolbar>
                            <List>
                            {x.tasks.map( (row, index) => (
                              <ListItem key={index}  selected={row.selected}>
                                {taskRender(row,index)}
                              </ListItem>
                              ))}
                          </List>  
                          <Table
                          height={this.state.height} style={{display:'none'}}
                        >
                          <TableHeader displaySelectAll={false}
                          >
                            <TableRow>
                              <TableHeaderColumn  style={{textAlign: 'center'}}>任务名</TableHeaderColumn>
                              <TableHeaderColumn  style={{textAlign: 'center'}}>进度</TableHeaderColumn>
                              <TableHeaderColumn  style={{textAlign: 'center'}}>内容</TableHeaderColumn>
                              <TableHeaderColumn  style={{textAlign: 'center'}}>耗时</TableHeaderColumn>
                              <TableHeaderColumn  style={{textAlign: 'center'}}>问题</TableHeaderColumn>
                            </TableRow>
                          </TableHeader>
                          <TableBody
                            displayRowCheckbox={false}
                            deselectOnClickaway={true}
                            showRowHover={true}
                            stripedRows={false}
                          >
                            {x.tasks.map( (row, index) => (
                              <TableRow key={index}  selected={row.selected}>
                                <TableRowColumn  style={{textAlign: 'center'}}>{row.name}</TableRowColumn>
                                <TableRowColumn  style={{textAlign: 'center'}}>{row.progress+'%'}</TableRowColumn>
                                <TableRowColumn  style={{textAlign: 'center'}}>{row.summary}</TableRowColumn>
                                <TableRowColumn  style={{textAlign: 'center'}}>{row.elapse}</TableRowColumn>
                                <TableRowColumn  style={{textAlign: 'center'}}>{row.question}</TableRowColumn>
                              </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                    </GridTile>
                </GridList>
                <div className="content" style={{'display':x.reports&&x.reports.length>2?'block':'none'}}>
                    
                </div>
            </CardText>
            <CardActions style={{'display':x.status==1?'block':'none'}}>
                <FlatButton label="删除" disabled={x.status!=1}
                            onClick={this._delete.bind(this, x)}/>
                <FlatButton label="编辑"
                            disabled={x.status!=1}
                            onClick={this._onEdit.bind(this, x)}/>
                <FlatButton label="发送"
                            disabled={x.status!=1}
                            onClick={this._onSend.bind(this, x)}/>
            </CardActions>
        </Card>
        </StepContent>
        </Step>
        ;
        return (
            <div className={style}>
                <Stepper orientation="vertical" linear={false} children={[]}>
                  <ListView ref="listView" loadList={this._loadList} itemRender={itemRender}/>
                </Stepper>
                
                <Popover
                    open={!!this.state.currentRp}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={e => this.setState({currentRp: null})}>
                    <Menu onChange={this._sendToTeam}>
                        {
                            this.state.myTeams.map(t => <MenuItem key={t.id} value={t.id} primaryText={t.name}/>)
                        }
                    </Menu>
                </Popover>
            </div>
        );
    },
    _loadList(data) {
        return Backend.report.get(data);
        //return fetch('/api/report/my?limit=${limit}&offset=${offset}');
    },
    _create() {
        browserHistory.push('/m/report/my/edit');
    },
    _delete(rp) {
        popup.confirm({
            msg: '确定删除报告?',
            onOk: () => {
                fetch('/api/report/delete?id=' + rp.id)
                    .then(d => {
                        this.refs.listView.deleteItem(rp.id);
                        popup.success('删除成功');
                    })
                    .catch(e => {
                        popup.success('删除失败');
                    })
            }
        });
    },
    _onSend(rp, e) {
        e.preventDefault();
        this.setState({anchorEl: e.currentTarget, currentRp: rp});
    },
    _onEdit(rp) {
        browserHistory.push({pathname: '/m/report/my/edit/' + rp.id, state: Object.assign({}, rp)});
    },
    _sendToTeam(e, teamId) {
        let reportId = this.state.currentRp.id;
        fetch('/api/report/send', {
            method: 'post',
            body: {
                reportId: this.state.currentRp.id,
                teamId: teamId
            }
        }).then(d => {
                this.refs.listView.updateItem(reportId, {toTeam: d.toTeam});
                popup.success('发送成功');
            })
            .catch(e => {
                popup.error('发送失败');
            });
        this.setState({anchorEl: null, currentRp: null});
    }
});