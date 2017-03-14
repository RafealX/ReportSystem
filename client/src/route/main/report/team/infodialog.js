import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {FlatButton,Paper,TextField,RaisedButton, Toolbar,ToolbarGroup,ToolbarTitle,Card, CardActions, CardHeader, IconButton,Dialog,DatePicker,Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,GridList, GridTile,
    CardText, List, ListItem, Divider, Popover, Menu, MenuItem,Step,Stepper,StepLabel,StepContent} from 'material-ui';
    import {red300,red200,lightBlue500,cyan300} from 'material-ui/styles/colors';
import AddIcon from 'material-ui/svg-icons/content/add';
import {uuid,fetch} from 'lib/util';
import popup from 'cpn/popup';
import {style} from '../index.scss';
import pubsub from 'vanilla-pubsub';
import _ from 'lodash';
import Backend from 'lib/backend';
import {TeamReport} from './model';

const textFieldStyle = {
	width:'100%',
	borderBottom:'1px solid #ccc',
	color:'#333'
}
module.exports = React.createClass({
    getInitialState() {
       return {infodata:null,infodialogkey:uuid(),showinfo:false,x:0,y:0}
    },
    componentDidMount() {
       
    },
    mouseEnterCb(e,itm) {
        e.persist();
        if(TeamReport.task.getter(itm.taskid)){
        	this.setState({x:e.clientX,y:e.clientY,infodata:TeamReport.task.getter(itm.taskid),showinfo:true});
        }else{
            TeamReport.task.get(itm.taskid,(data)=>{
              this.setState({x:e.clientX,y:e.clientY,infodata:data});
              setTimeout(()=>{
	        	this.setState({showinfo:true});		
	        	},0);
            });
        }
    },
    mouseMoveCb(e,itm){
        e.persist();
    	if(this.state.showinfo){
    		this.setState({x:e.clientX,y:e.clientY});
    	}
    },
    mouseExitCb(itm) {

    	this.setState({showinfo:false});
    },
    render() {
        
        return (<Card initiallyExpanded  style={{display:this.state.showinfo?'block':'none',top:this.state.y?(this.state.y+10):'',left:this.state.x?(this.state.x+10):''}} className={'f-pf infodialog'}>>
                        <CardText expandable>
                            {this.state.infodata?
                            <Grid fluid style={{padding:'0'}}>
                                <Row >
                                    <Col xs={8} sm={8} md={8} lg={8}>
                                        <TextField  hintText="任务名"  multiLine={true} className={'f-hide'}
                                          floatingLabelText="任务名" key={this.state.infodialogkey}
                                          name="progressname" onFocus={e=>{e.target.blur();}}
                                          value={this.state.infodata.name}  style={{width:'100%'}}
                                        />
                                        <Row >

                                            <Col xs={12} sm={12} md={12} lg={12}>
                                                <span className={'title'}>任务名:</span>
                                            </Col>
                                            <Col xs={12} sm={12} md={12} lg={12} >
                                                <p className={'content'}>{this.state.infodata.name}</p>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col xs={4} sm={4} md={4} lg={4}>
                                        <DatePicker  disabled={true} style={{width:'100%'}} textFieldStyle={{width:'100%'}} className={'datepicker f-hide'}
                                          locale="zh-Hans-CN" autoOk floatingLabelText="截止日期"
                                          DateTimeFormat={Intl.DateTimeFormat}  
                                          cancelLabel="取消" okLabel="确定" value={new Date(this.state.infodata.endtime)}
                                          hintText="选择日期" />
                                          <Row >
                                            <Col xs={12} sm={12} md={12} lg={12}>
                                                <span className={'title'}>截止日期:</span>
                                            </Col>
                                            <Col xs={12} sm={12} md={12} lg={12}>
                                                <p className={'content'}>{new Date(this.state.infodata.endtime).toLocaleDateString()}</p>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} >
                                        <TextField key={uuid()} className={'f-hide'}
                                            fullWidth={true}
                                            hintText="任务目的"
                                            rows={3}
                                            multiLine={true}
                                            floatingLabelText="任务目的"
                                            value={this.state.infodata.description} 
                                        />
                                         <Row >
                                            <Col xs={12} sm={12} md={12} lg={12}>
                                                <span className={'title'}>任务目的:</span>
                                            </Col>
                                            <Col xs={12} sm={12} md={12} lg={12}>
                                                <p className={'content'}>{this.state.infodata.description}</p>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Grid>:null}
                        </CardText>
                    </Card>);
    },
    componentWillUnmount() {
    }
});