/**
 * 报告
 */
import React from 'react';
import {browserHistory} from 'react-router';
import {FlatButton, Card, CardActions, CardHeader, IconButton,Dialog,DatePicker,Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,GridList, GridTile,
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
const StepperStyle = {
    fontSize:0
}
const containerStyle = {
    display:'none'
}

//数据format
let tasklist = _.map(Mock.task.my.list,(itm,ix)=>{
    let arr;
    itm.createtime = new Date(itm.time);
    if(itm.report){
        arr = itm.report.split(';');

        if(_.isArray(arr) && arr.length>0){
            itm.reports = [];
            _.each(arr,(item)=>{
                let reportitm = item.split(','),tmp;
                 tmp= {
                    content:reportitm[0],
                    elaspe:reportitm[1]*1,
                    ticket:reportitm[2]
                };
                itm.reports.push(tmp);
            })
        }
    }
    window.timet = new Date(itm.time);
    console.log(itm);
});

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
    handleClose() {
        this.setState({open: false});
    },
    render() {
        let reportRender = (x,i)=><div><span>{x.content}</span><span>{x.elaspe}</span><span>{x.ticket}</span></div>;
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
                <GridList>
                    <GridTile>
                          <Table
                          height={this.state.height}
                        >
                          <TableHeader displaySelectAll={false} 
                          >
                            <TableRow>
                              <TableHeaderColumn  style={{textAlign: 'center'}}>content</TableHeaderColumn>
                              <TableHeaderColumn  style={{textAlign: 'center'}}>elaspe</TableHeaderColumn>
                              <TableHeaderColumn  style={{textAlign: 'center'}}>ticket</TableHeaderColumn>
                            </TableRow>
                          </TableHeader>
                          <TableBody
                            displayRowCheckbox={false}
                            deselectOnClickaway={true}
                            showRowHover={true}
                            stripedRows={false}
                          >
                            {x.reports.map( (row, index) => (
                              <TableRow key={index}  selected={row.selected}>
                                <TableRowColumn  style={{textAlign: 'center'}}>{row.content}</TableRowColumn>
                                <TableRowColumn  style={{textAlign: 'center'}}>{row.elaspe}</TableRowColumn>
                                <TableRowColumn  style={{textAlign: 'center'}}>{row.ticket}</TableRowColumn>
                              </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                    </GridTile>
                    <GridTile>
                          <Table
                          height={this.state.height}
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
                <Stepper orientation="vertical" linear={false}>
                  <ListView ref="listView" list={this.state.list} itemRender={itemRender}/>
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
    _loadList(limit, offset) {
        return fetch(`/api/report/my?limit=${limit}&offset=${offset}`);
    },
    _create() {

        browserHistory.push('/m/report/my/edit');
    },
    _onAddOrUpdate(rp) {
        if (rp.id) {
            fetch('/api/report/update', {
                method: 'post',
                body: {
                    report: rp
                }
            })
                .then(d => {
                    let oldRp = _.find(this.state.rps, {id: rp.id});
                    oldRp.content = rp.content;
                    oldRp.type = rp.type;
                    oldRp.periodTime = rp.periodTime;
                    this.forceUpdate();
                    popup.success('保存成功');
                })
                .catch(e => {
                    popup.success(e.msg || '保存失败');
                });
        } else {
            fetch('/api/report/create', {
                method: 'post',
                body: {
                    report: rp
                }
            })
                .then(d => {
                    this.state.rps.unshift(d.report);
                    this.forceUpdate();
                    popup.success('创建成功');
                })
                .catch(e => {
                    popup.success(e.msg || '创建失败');
                });
        }
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