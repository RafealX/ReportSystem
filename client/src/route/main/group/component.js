/**
 * 群组
 */
import React from 'react';
import {FlatButton, IconButton, TextField, Toggle, Avatar, Table, Card,CircularProgress,
    TableHeader, TableRow, TableRowColumn, TableHeaderColumn, TableBody,
    CardHeader, CardText, CardActions, Checkbox, Dialog} from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import SetIcon from 'material-ui/svg-icons/action/settings';
import SuperSelectField from 'material-ui-superselectfield';
import _ from 'lodash';
import {uuid,fetch, checkEnter} from 'lib/util';
import popup from 'cpn/popup';
import UserSearch from 'cpn/UserSearch';
import {style} from './index.scss';
import pubsub from 'vanilla-pubsub';
import {Group} from './model';
let firstload = true;
module.exports = React.createClass({
    getInitialState() {
        firstload = true;
        Group.clear();
        return {showAdd: false,showCopy:false,key:uuid(),loading:true,name:'',members:null,copyto:'',ungroupusers:null,ungroupselect:[]};
    },
    loadItem(data) {
        this.setState({key:uuid(),loading:false,name:Group.get().name,members:Group.get().t_members,copyto:Group.get().copyto});
    },
    componentDidMount() {

    },
    ungroupUsers(d) {
        console.log(d);
        this.setState({ungroupusers:d.data,ungroupselect:[]});
    },
    componentDidUpdate(prevProps, prevState) {
      if (!prevState.showAdd && this.state.showAdd) {
         Group.ungroupusers().then(d=>{
            this.ungroupUsers(d);

        }).catch(e=>{

        });
      }
    },
    componentWillUnmount() {
        firstload = true;
        Group.clear();
    },
    checked(itm,isadmin) {
        
        Group.admin(itm.userid,isadmin?1:0).then(d=>{
            itm.role = isadmin==true?2:1;
            setTimeout(()=>{
                this.forceUpdate();
            },400);
            popup.success('设置成功');
        }).catch(e=>{
            itm.role = 1;
            setTimeout(()=>{
                this.forceUpdate();
            },400);
        })
    },
    render() {
        if(firstload){
            firstload = false;
            Group.listen(this.loadItem);
            Group.init();
            Group.ungroupusers().then(d=>{
                this.ungroupUsers(d);

            }).catch(e=>{

            });
        }
        let disableSave = !this.state.name;
        let actions = [
            <FlatButton
                label="取消"
                onTouchTap={this.cancel}/>,
            <FlatButton
                primary
                label="确定"
                onTouchTap={this.addMember}/>
        ];
        let copyactions = [
            <FlatButton
                label="取消"
                onTouchTap={this.cancelcopy}/>,
            <FlatButton
                primary
                label="确定"
                onTouchTap={this.addCopyto}/>
        ];
        console.log(Group.get());
        return (<div className={style}>
                 {this.state.loading?(<div className="loadingStage">
                    <CircularProgress color="#FF9800" className="loading"/>
                    </div>):(<div>
                        <div className="box">
                        <Card className="card">
                            <CardHeader title="基本信息" style={{paddingBottom: 0}}/>
                            <CardText style={{paddingTop: 0}}>
                                <TextField
                                    defaultValue={this.state.name}
                                    onChange={(e,n) => this.setState({name: n})}
                                    className="text"
                                    hintText="请输入名称"
                                    floatingLabelText="组织名称"/>
                            </CardText>
                            <CardActions>
                                <FlatButton primary onClick={this.saveName} disabled={disableSave} label="保存"/>
                            </CardActions>
                        </Card>
                        <Card className="card">
                            <CardHeader title="添加邮件抄送" style={{paddingBottom: 0}}>
                                 <IconButton
                                    style={{position: 'absolute', right: 0,top:0}}
                                    
                                    onTouchTap={e=>{this.setState({showCopy:true})}}>
                                    <AddIcon/>
                                </IconButton>
                            </CardHeader>
                            <CardText>
                                <Table>
                                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                                        <TableRow>
                                            <TableHeaderColumn>crop邮箱账号</TableHeaderColumn>
                                            <TableHeaderColumn>操作</TableHeaderColumn>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody displayRowCheckbox={false}>
                                        {
                                            this.state.copyto &&this.state.copyto.length>0&&
                                            this.state.copyto.map((m, i) =>
                                                <TableRow key={i} selectable={false}>
                                                    <TableRowColumn>{m}</TableRowColumn>
                                                    <TableRowColumn>
                                                        <FlatButton
                                                            secondary
                                                           onClick={this.delCopyto.bind(this,m)}
                                                            label="删除"/>
                                                    </TableRowColumn>
                                                </TableRow>
                                            )
                                        }
                                    </TableBody>
                                </Table>
                            </CardText>
                        </Card>
                        <Card className="card">
                            <CardHeader title="组织成员" style={{paddingBottom: 0}}>
                                <IconButton 
                                    style={{position: 'absolute', right: 0,top:0}} 
                                    onTouchTap={e => this.setState({showAdd: true})}>
                                    <AddIcon/>
                                </IconButton>
                            </CardHeader>
                            <CardText>
                                <Table>
                                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                                        <TableRow>
                                            <TableHeaderColumn>序号</TableHeaderColumn>
                                            <TableHeaderColumn>姓名</TableHeaderColumn>
                                            <TableHeaderColumn>组织管理员</TableHeaderColumn>
                                            <TableHeaderColumn>操作</TableHeaderColumn>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody displayRowCheckbox={false}>
                                        {
                                            this.state.members &&this.state.members.length>0&&
                                            this.state.members.map((m, i) =>
                                                <TableRow key={m.userid} selectable={false}>
                                                    <TableRowColumn>{i + 1}</TableRowColumn>
                                                    <TableRowColumn>{m.name}</TableRowColumn>
                                                    <TableRowColumn key={uuid()} >
                                                        <Checkbox onCheck={(e,v)=>{this.checked(m,v);}}
                                                            disabled={m.userid == window.user.id}
                                                            defaultChecked={m.role*1==2} />
                                                    </TableRowColumn>
                                                    <TableRowColumn>
                                                        <FlatButton
                                                            secondary
                                                            disabled={m.userid == window.user.id}
                                                            onClick={this.delMember.bind(this,m)}
                                                            label="删除"/>
                                                    </TableRowColumn>
                                                </TableRow>
                                            )
                                        }
                                    </TableBody>
                                </Table>
                            </CardText>
                        </Card>
                    </div>
                    <Dialog
                    contentStyle={{maxWidth: '450px'}}
                    title="添加组织成员"
                    actions={actions}
                    open={this.state.showAdd}>
                    {this.state.ungroupusers && this.state.ungroupusers.length>0?
                    <SuperSelectField className={'multiselect'}
                        name='ungroupselect'
                        multiple innerDivStyle={{outline: 'none'}} style={{outline: 'none'}}
                        hintText='下拉选择要加入的组员'
                        value={this.state.ungroupselect}
                        onChange={this.handleSelection}
                        style={{ minWidth: 150, display: 'block' }}
                      >
                        {this.state.ungroupusers.map((itm,idx)=>
                            <div key={itm.id} label={itm.name} value={itm.id}>
                                {itm.name}
                            </div>
                        )}
                      </SuperSelectField>:(<div>无可选择组员</div>)
                    }
                    </Dialog>
                    <Dialog
                    contentStyle={{maxWidth: '450px'}}
                    title="添加邮件抄送"
                    actions={copyactions}
                    open={this.state.showCopy}>
                    <TextField
                        autoFocus defaultValue={this.state.copytostring}
                        hintText="请输入抄送邮箱,多个用逗号隔开"
                        onChange={(e,n) => this.state.copytostring = n}
                        fullWidth={true}/>
                    </Dialog>
                    </div>)}
            </div>);
    },
    delCopyto(m) {
        let copyto = _.clone(this.state.copyto,true);
        var index = _.findIndex(copyto,itm=>{
            return itm===m;
        });
        if(index>=0);
        copyto.splice(index,1);
        Group.set({copyto:copyto});
        Group.send().then(d=>{
            popup.success('保存成功');
            this.setState({copyto:Group.get().copyto,showCopy:false});
        }).catch(e=>{
            popup.error(e.msg||e.message||'保存失败');
        });
    },
    addCopyto() {
        if(this.state.copytostring){
            let copyto = _.clone(this.state.copyto,true);
            let strs = this.state.copytostring;
            strs = strs.split(',');
            _.each(strs,itm=>{
                if(itm){
                    copyto.push(itm);
                }
            });
            Group.set({copyto:copyto});
            Group.send().then(d=>{
                popup.success('保存成功');
                this.setState({copyto:Group.get().copyto,showCopy:false});
            }).catch(e=>{
                popup.error(e.msg||e.message||'保存失败');
            });
        }else{
            this.setState({showCopy:false});
        }

    },
    cancelcopy() {
        this.setState({copytostring:'',showCopy:false});
    },
    cancel() {
        this.setState({ungroupselect:[],showAdd:false});
    },
    addMember(){
        if(this.state.ungroupselect && this.state.ungroupselect.length>0){
            var returns = Group.members.add(this.state.ungroupselect);
            if(returns){
                returns.then(d=>{
                    this.setState({members:Group.get().t_members,showAdd:false,ungroupselect:[]});
                }).catch(e=>{

                });
            }
        }else{
            this.setState({showAdd:false});
        }
    },
    handleSelection(v,m) {
        console.log(v,m);
        this.setState({ [m]: v })
        console.log(this.state);
    },
    delMember(m){
        popup.confirm({
            msg: '确定删除'+m.name+'?',
            onOk: () => {
                var returns = Group.members.del(m);
                if(returns){
                    returns.then(d=>{
                        this.setState({members:Group.get().t_members});
                    }).catch(e=>{

                    });
                }

            }
        });
    },

    saveName() {
        let name = this.state.name;
        if(name){
            Group.set({name:name})
            Group.send().then(d=>{
                popup.success('保存成功')
            }).catch(e=>{
                popup.error(e.msg||e.message||'保存失败');
            });
        }
    }
});