import React from 'react';
import {Dialog,DatePicker,FlatButton} from 'material-ui';

import Mock from 'cpn/Mock';

/*数据层*/

/*其他配置引用*/
const actions = [
  <FlatButton
    label="确定"
    primary={true}
  />,
  <FlatButton
    label="取消"
    primary={true}
  />,
];


let today = new Date();
let theDayBeforeYester = new Date(today.setDate(today.getDate()-2));

module.exports = React.createClass({

	getInitialState() {
		return {
			open:false
		};
	},
	handleClose() {

	},
	render() {
		return(
            <DatePicker 
              locale="zh-Hans-CN"
              DateTimeFormat={Intl.DateTimeFormat}
              cancelLabel="取消"
              style={{width: '120px', marginTop: '4px'}}
              textFieldStyle={{width: '120px'}}
              hintText="日期" minDate={theDayBeforeYester} maxDate={new Date}/>
        );
	}
});