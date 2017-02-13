/**
 * 报告
 */
import React from 'react';
import {browserHistory} from 'react-router';
import {FlatButton,RaisedButton, Toolbar,ToolbarGroup,ToolbarTitle,Card, CardActions, CardHeader, IconButton,Dialog,DatePicker,Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,GridList, GridTile,
    CardText, List, ListItem, Avatar, Divider, Popover, Menu, MenuItem,Step,Stepper,StepLabel,StepContent} from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import {red300,red200,lightBlue300,cyan300} from 'material-ui/styles/colors';
import IconMenu from 'material-ui/IconMenu';
import {fetch} from 'lib/util';
import popup from 'cpn/popup';
import {style} from '../../index.scss';
import pubsub from 'vanilla-pubsub';
import ListView from 'cpn/ListView';
import _ from 'lodash';
import Backend from 'lib/backend';
import {Report} from './model';


const StepperStyle = {
    fontSize:0
}
const containerStyle = {
    display:'none'
}

// let unlisten = browserHistory.listen((location, action)=>{
//     Report.reset();
// });

module.exports = React.createClass({
    getInitialState() {
        Report.reset();
        return {rps: [], myTeams: [],stepIndex:0, finished: false,show:false};
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

    },
    componentWillUnmount() {
        //unlisten();
        Report.reset();
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
            <span>{(i+1)+'.'}&nbsp;&nbsp;</span>
            <span>{x.content}&nbsp;&nbsp;</span>
            <span>{x.elapse?x.elapse+'小时  ':''}</span>
            <span>{x.ticket}&nbsp;&nbsp;</span>
            </div>;
        let taskRender = (x,i)=><div>
            <div className="top" style={{lineHeight:'24px',}}>
                <span>{(i+1)+'.'}&nbsp;&nbsp;</span>
                <span>{x.taskname}&nbsp;&nbsp;</span>
                <span>{x.progress?x.progress+'%  ':''}</span>
                <span>{x.elapse?x.elapse+'小时':''}</span>
            </div>
            <h4 style={{fontWeight:'normal',lineHeight:'24px',marginLeft: '20px'}}>问题：{x.question}</h4>
            <h4 style={{fontWeight:'normal',lineHeight:'24px',marginLeft: '20px'}}>总结：{x.summary}</h4>
            </div>;
        let itemRender = (x, i) => 
        <Step active={true} className="step" style={{display:x.status!=3?'block':'none'}}>
        <StepLabel iconContainerStyle={containerStyle}>{new Date(x.time).toLocaleDateString()}</StepLabel>
        <StepContent>
            <div className="clearfix">
            <Card initiallyExpanded key={i*2} className="item" style={{display:x.taskhistorylist&&x.taskhistorylist.length>0?'block':'none',width:'45%',float:'left'}}>
                <CardText expandable>
                    <Toolbar>
                        <ToolbarGroup style={{textAlign:'center',width:'100%'}}>
                            <ToolbarTitle text="任务事项" style={{textAlign:'center',width:'100%'}}/>
                        </ToolbarGroup>
                    </Toolbar>
                        <List>
                        {x.taskhistorylist&&x.taskhistorylist.length>0&&x.taskhistorylist.map( (row, index) => (
                          <ListItem disabled={true} key={index}  selected={row.selected}>
                            {taskRender(row,index)}
                          </ListItem>
                          ))}
                      </List> 
                </CardText>
            </Card>
            <Card initiallyExpanded key={i} className="item" style={{display:x.reports&&x.reports.length>0?'block':'none',width:'45%',float:'left'}}>
                <CardText expandable>
                    <Toolbar>
                        <ToolbarGroup style={{textAlign:'center',width:'100%'}}>
                            <ToolbarTitle text="普通事项" style={{textAlign:'center',width:'100%'}}/>
                        </ToolbarGroup>
                    </Toolbar>
                      <List>
                        {x.reports&&x.reports.length>0&&x.reports.map((row, index) => (
                          <ListItem disabled={true} key={index}  selected={row.selected}>
                            {reportRender(row,index)}
                          </ListItem>
                          ))}
                      </List>  
                </CardText>
            </Card>
            </div>
            <div style={{'display':x.status==1?'block':'none',padding:'16px'}}>
            <RaisedButton label="删除" backgroundColor={red300} labelColor='#fff'
                  onClick={this._delete.bind(this, x)}
                />
                <RaisedButton label="编辑" backgroundColor={lightBlue300} labelColor='#fff'
                  onClick={this._onEdit.bind(this, x)}
                />
                <RaisedButton label="发送" backgroundColor={cyan300} labelColor='#fff'
                  onClick={this._onSend.bind(this, x)}
                
                />
            </div>
        </StepContent>
        </Step>
        ;
        return (
            <div className={style} ref="reportcontainer">
                <Stepper orientation="vertical" linear={false} children={[]}>
                  <ListView ref="listView" loadList={Report.get} getter={Report.operation.get} formatter={Report.formatter} itemRender={itemRender}/>
                </Stepper>
                
                <Popover
                    open={!!this.state.currentRp}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={e => this.setState({currentRp: null})}>
                    
                </Popover>
            </div>
        );
    },
    _create() {
        browserHistory.push('/m/report/my/edit');
    },
    _delete(rp) {
        popup.confirm({
            msg: '确定删除此报告?',
            onOk: () => {
                Backend.report.delete(rp.id).then()
                    .then(d => {
                        Report.operation.delete(rp);
                        this.refs.listView.delete();
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
        let reportId = rp.id;
        Backend.report.send(reportId)
        .then(d => {
                Report.operation.update(rp);
                this.refs.listView.updateView();
                popup.success('发送成功');
            })
        .catch(e => {
            popup.error('发送失败');
        });
    },
    _onEdit(rp) {
        browserHistory.push({pathname: '/m/report/my/edit/' + rp.id, state: Object.assign({}, rp)});
    }
});