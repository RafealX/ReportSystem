import React from 'react';
import classNames from 'classnames';
import { 
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn, TableFooter
} from 'material-ui/Table';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import Paper from 'material-ui/Paper';

import {FlatButton} from 'material-ui';

import FilterList from 'material-ui/svg-icons/content/filter-list';
import SearchIcon from 'material-ui/svg-icons/action/search';
import NavigateRight from 'material-ui/svg-icons/image/navigate-next';
import NavigateLeft from 'material-ui/svg-icons/image/navigate-before';

import injectProp from './utils/injectProp';
import { hasHtml, extractHtml } from './utils/handleHtmlProp';
import { hasCustomRender, callCustomRender } from './utils/handleCustomRender';
import arraySearch from './utils/search.js';
import Paginate from './utils/paginate';

import {style} from './index.scss';

const TableMode = {
	NORMAL:0,
	AJAX:1
}

export class ExtendTableFooter extends React.Component {
	constructor(props) {
		super(props);
		this.currentPage = 1;
		this.mode = TableMode.NORMAL;
		let count = props.count;
		this.state = {
			currentPage:1,
			rowPerPages:props.rowPerPages || [5,10,20],
			data:props.data||[],
			count:props.count
		};

	}

	navigate(){

	}

	render() {
		return this.state.data.length>0? (
			<div>
				成功了吗
			</div>
		):null;
	}
};