/**
 * 报告
 */
import React from 'react';
import {browserHistory} from 'react-router';
import {FlatButton, Card, CardActions, CardHeader, IconButton,
    CardText, List, ListItem, Avatar, Divider, Popover, Menu, MenuItem,Step,Stepper,StepLabel,StepContent} from 'material-ui';
import AddIcon from 'material-ui/svg-icons/content/add';
import IconMenu from 'material-ui/IconMenu';
import {fetch} from 'lib/util';
import popup from 'cpn/popup';
import {style} from '../../index.scss';
import pubsub from 'vanilla-pubsub';
import ListView from 'cpn/ListView';
import Mock from 'cpn/Mock';
const StepperStyle = {
    fontSize:0
}

const containerStyle = {
    display:'none'
}

module.exports = React.createClass({
    getInitialState() {
        return {rps: [], myTeams: [],stepIndex:0, finished: false,show:false,list:Mock.task.my.list};
    },
    componentDidMount() {
        let barConf = {
            title: '新增工作日记',
            titleStyle:{
                fontSize:'16px',
                marginLeft:'-20px'
            },
            iconElementLeft:<IconMenu onItemTouchTap={this.handleChange} iconButtonElement={
                  <IconButton title="新建日报"><AddIcon color={'#fff'}/></IconButton>
                }
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
              >
                <MenuItem  value="1" primaryText="普通日记" />
                <MenuItem  value="2" primaryText="任务日记" />
              </IconMenu>
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
               browserHistory.push('/m/report/my/edit'); 
            case 2:
               browserHistory.push('/m/report/my/edit'); 
        }
    },
    showPAM() {
        this.setState({
            show:true
        })
    },
    renderStepActions(step) {
        const {stepIndex} = this.state;

        return (
          <div style={{margin: '12px 0'}}>
            <FlatButton
              label={stepIndex === 2 ? 'Finish' : 'Next'}
              disableTouchRipple={true}
              disableFocusRipple={true}
              primary={true}
              onClick={this.showPAM}
              onTouchTap={this.handleNext}
              style={{marginRight: 12}}
            />
            {step > 0 && (
              <FlatButton
                label="Back"
                disabled={stepIndex === 0}
                disableTouchRipple={true}
                disableFocusRipple={true}
                onTouchTap={this.handlePrev}
              />
            )}
            <p style={{display:this.state.show?'block':'none'}}>For each ad campaign that you create, you can control how much
                        you're willing to spend on clicks and conversions, which networks
                        and geographical locations you want your ads to show on, and more.;aksfgalkjsllfjk</p>
                        <p style={{display:this.state.show?'block':'none'}}>For each ad campaign that you create, you can control how much
                        you're willing to spend on clicks and conversions, which networks
                        and geographical locations you want your ads to show on, and more.;aksfgalkjsllfjk</p>
                        <p style={{display:this.state.show?'block':'none'}}>For each ad campaign that you create, you can control how much
                        you're willing to spend on clicks and conversions, which networks
                        and geographical locations you want your ads to show on, and more.;aksfgalkjsllfjk</p>
          </div>
        );
      },
    handleNext() {
        const {stepIndex} = this.state;
        this.setState({
          stepIndex: stepIndex + 1,
          finished: stepIndex >= 2,
        });
      },

      handlePrev() {
        const {stepIndex} = this.state;
        if (stepIndex > 0) {
          this.setState({stepIndex: stepIndex - 1});
        }
      },
    render() {
        let itemRender = (x, i) => 
        <Step active={true} className="step">
        <StepLabel iconContainerStyle={containerStyle}>{x.periodDesc}</StepLabel>
        <StepContent>
          <Card initiallyExpanded key={i} className="item">
            <CardHeader
                showExpandableButton
                className="header"
                title={x.periodDesc}
                subtitle={x.toTeam && x.toTeam.teamName ? `已发送:${x.toTeam.teamName}` : '未发送'}/>
            <CardText expandable>
                <div className="content" dangerouslySetInnerHTML={{__html: x.content}}></div>
            </CardText>
            <CardActions>
                <FlatButton label="删除"
                            onClick={this._delete.bind(this, x)}/>
                <FlatButton label="编辑"
                            disabled={x.toTeam && !!x.toTeam.teamName}
                            onClick={this._onEdit.bind(this, x)}/>
                <FlatButton label="发送"
                            disabled={x.toTeam && !!x.toTeam.teamName}
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