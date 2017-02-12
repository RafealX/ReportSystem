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


export default React.createClass({
    getInitialState() {
        return {list: []};
    },
    componentDidMount() {
        this._loadList();
    },
    itemRender(itm,i) {

    },
    render() {
        return (<div className={scss.index}>
        	
            {this.state.list.map(this.itemRender)}
            {this._renderStatus()}
        </div>);
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
                let data = d.reports;
                let result = this.props.formatter(data);
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
                // console.log(this.state.list,tasklist);
                // let templist = _.clone(this.state.list,true);
                // Array.prototype.push.apply(templist, tasklist);
                // //Array.prototype.push.apply(this.state.list, tasklist);

                // templist.sort((x,y)=>{
                //     console.log(new Date(x.time)-new Date(y.time));
                //     return new Date(y.time)-new Date(x.time);
                // });
                // this.setState({list:templist,status:'loaded'});
                
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