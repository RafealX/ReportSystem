import React from 'react';
import {Card, CardText,CardActions, CardHeader,TextField,Dialog,DatePicker,FlatButton,Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui';
import _ from 'lodash';
import Mock from 'cpn/Mock';

/*数据层*/

/*其他配置引用*/
let reports = [];
let reportitm = {
  content:'asdsa',
  elaspe:0,
  ticket:''
};
module.exports = React.createClass({
  getInitialState() {
    console.log(this.props);
    return {
      open:false,
      reports:[]
    };
  },
  handleClose() {

  },
  edit(row) {
    let index = reports.indexOf(row);
    if(index>=0){
      reports.splice(index,1);
    }
    this.setState({
      reports:reports,
      ticket:row.ticket,
      elaspe:row.elaspe,
      content:row.content
    })
    if(_.isFunction(this.props.refresh)){
      this.props.refresh('task',reports);
    }
  },
  delete(row) {
    console.log(row);
    let index = reports.indexOf(row);
    if(index>=0){
      reports.splice(index,1);
      this.setState({
        reports:reports
      });
    }
    if(_.isFunction(this.props.refresh)){
      this.props.refresh('normal',reports);
    }
  },
  add() {
    let ags = {
      content:this.refs.ticket.getValue(),
      elaspe:this.refs.elaspe.getValue(),
      ticket:this.refs.content.getValue()
    };
    console.log(ags);
    reports.push(ags);
    this.setState({
      reports:reports,
      ticket:'',
      elaspe:'',
      content:''
    });
    if(_.isFunction(this.props.refresh)){
      this.props.refresh('normal',reports);
    }
  },

  render() {
    return(
        <div>
          <h3>任务事项</h3>
          <Card initiallyExpanded className="item">
            <CardHeader
                showExpandableButton
                className="header" style={{'display':'none'}} />
            <CardText expandable>
              <TextField id="text-field-default"
                floatingLabelText="ticket号" ref="ticket"
                type="text" value={this.state.ticket||''} onChange={e=>{this.setState({ticket:e.target.value})}}
              />
              <TextField id="text-field-default1"
                floatingLabelText="耗时" ref="elaspe"
                type="number" value={this.state.elaspe||''} onChange={e=>{this.setState({elaspe:e.target.value})}}
              />
              <TextField id="text-field-default2"
                multiLine={true} ref="content"
                rows={2}
                rowsMax={6}  value={this.state.content||''} onChange={e=>{this.setState({content:e.target.value})}}
              />
            </CardText>
            <CardActions>
                <FlatButton label="添加"
                            onClick={this.add}/>
            </CardActions>
          </Card>
          <Table
            height={this.state.height}
          >
            <TableHeader displaySelectAll={false} 
            >
              <TableRow>
                <TableHeaderColumn  style={{textAlign: 'center'}}>内容</TableHeaderColumn>
                <TableHeaderColumn  style={{textAlign: 'center'}}>耗时</TableHeaderColumn>
                <TableHeaderColumn  style={{textAlign: 'center'}}>ticket</TableHeaderColumn>
                <TableHeaderColumn  style={{textAlign: 'center'}}>操作</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody
              displayRowCheckbox={false}
              deselectOnClickaway={true}
              showRowHover={true}
              stripedRows={false}
            >
              {this.state.reports.map( (row, index) => (
                <TableRow key={index}  selected={row.selected}>
                  <TableRowColumn  style={{textAlign: 'center'}}>{row.content}</TableRowColumn>
                  <TableRowColumn  style={{textAlign: 'center'}}>{row.elaspe}</TableRowColumn>
                  <TableRowColumn  style={{textAlign: 'center'}}>{row.ticket}</TableRowColumn>
                  <TableRowColumn  style={{textAlign: 'center'}}>
                      <FlatButton label="删除"
                            onClick={this.delete.bind(this,row)}/>
                      <FlatButton label="编辑"
                                  onClick={this.edit.bind(this,row)}/>
                  </TableRowColumn>
                </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        );
  }
});