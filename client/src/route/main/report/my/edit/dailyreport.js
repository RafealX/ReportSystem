import React from 'react';
import {Card, CardText,CardActions, CardHeader,TextField,Dialog,DatePicker,FlatButton,Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui';

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
  getDefaultProps() {
    console.log(this.props);
  },
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

  },
  delete(row) {

  },
  add() {

  },
	render() {
		return(
        <div>
          <h3>一般任务</h3>
          <Card initiallyExpanded className="item">
            <CardHeader
                showExpandableButton
                className="header" style={{'display':'none'}}/>
            <CardText expandable>
              <TextField
                floatingLabelText="ticket号"
                type="text" value={reportitm.ticket}
              />
              <TextField
                floatingLabelText="耗时"
                type="number" value={reportitm.elaspe}
              />
              <TextField
                multiLine={true}
                rows={2}
                rowsMax={6} value={reportitm.content}
              />
            </CardText>
            <CardActions>
                <FlatButton label="添加"
                            onClick={this.add.bind(this)}/>
            </CardActions>
          </Card>
          <Table
            height={this.state.height}
          >
            <TableHeader displaySelectAll={false} 
            >
              <TableRow>
                <TableHeaderColumn  style={{textAlign: 'center'}}>content</TableHeaderColumn>
                <TableHeaderColumn  style={{textAlign: 'center'}}>elaspe</TableHeaderColumn>
                <TableHeaderColumn  style={{textAlign: 'center'}}>ticket</TableHeaderColumn>
                <TableHeaderColumn  style={{textAlign: 'center'}}>operation</TableHeaderColumn>
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
                            onClick={this._delete.bind(this, row)}/>
                      <FlatButton label="编辑"
                                  onClick={this._onEdit.bind(this, row)}/>
                  </TableRowColumn>
                </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
        );
	}
});