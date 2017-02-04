import React from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import { 
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn, TableFooter
} from 'material-ui/Table';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import Paper from 'material-ui/Paper';

import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import {IconButton} from 'material-ui';
import EditIcn from 'material-ui/svg-icons/editor/mode-edit';//编辑
import DeleteIcn from 'material-ui/svg-icons/action/delete';//删除
import InfoIcn from 'material-ui/svg-icons/action/info';//查看详情
import DelayIcn from 'material-ui/svg-icons/social/mood-bad';//申请延期
import {cyan300,blue300, red300, deepOrange300} from 'material-ui/styles/colors';

import FilterList from 'material-ui/svg-icons/content/filter-list';
import SearchIcon from 'material-ui/svg-icons/action/search';
import NavigateRight from 'material-ui/svg-icons/image/navigate-next';
import NavigateLeft from 'material-ui/svg-icons/image/navigate-before';

import injectProp from './utils/injectProp';
import { hasHtml, extractHtml } from './utils/handleHtmlProp';
import { hasCustomRender, callCustomRender } from './utils/handleCustomRender';
import arraySearch from './utils/search.js';
import Paginate from './utils/paginate';
import {ExtendTableFooter} from './footer.js';


import {style} from './index.scss';

const iconStyleFilter = {
  color: '#757575',
  cursor: 'pointer',
  transform: 'translateY(5px) translateX(-20px)'
};

const searchHeaderColumnStyle = {
  position: 'relative'
};

const searchStyle = {
  color: '#777777',
  opacity: 1,
  outline: 0,
  fontSize: 16,
  padding: '7px 12px',
  textIndent: 3,
  cursor: 'text',
  borderRadius:'4px',
  border:'1px solid #ccc'
};

const iconStyleSearch = {
  color: '#757575',
  position: 'absolute',
  top: '30%',
  display:'none',
  opacity: 0,
  marginLeft: -76
};

const navigationStyle = {
  cursor: 'pointer'
};

//代表table所处的模式，默认为正常，如果在AJAX模式下，点击下一页以及搜索时均会尝试发请求
const TableMode = {
  NORMAL:1,
  AJAX:2
}

const opers = {
  'info':{
    title:'查看详情',
    type:3,
    ico:<InfoIcn />,
    callback:function(row,e){

    }
  },
  'edit':{
    title:'编辑',
    type:2,
    ico:<InfoIcn />,
    callback:function(row,e){

    }
  },
  'delete':{
    title:'删除',
    type:0,
    ico:<InfoIcn />,
    callback:function(row,e){

    }
  },
  'delay':{
    title:'申请延期',
    type:5,
    ico:<InfoIcn />,
    callback:function(row,e){

    }
  },
}

const Util = {
  isFunction:function(source){
    return Object.prototype.toString(source).toLowerCase().indexOf('function')>=0;
  },
  isArray:function(source){
    return Object.prototype.toString(source).toLowerCase().indexOf('array')>=0;
  }
}

/*
   <IconButton tooltip="查看详情"  onClick={(e)=>{this.handeOpers(item,3);}}><InfoIcn color={blue300}/></IconButton>
    <IconButton tooltip="删除" onClick={(e)=>{this.handeOpers(item,0);}}><DeleteIcn color={red300}/></IconButton>
    <IconButton style={{display:(item.status!=3&&item.status!=4)?'inline-block':'none'}} tooltip="编辑" onClick={(e)=>{this.handeOpers(item,2);}}><EditIcn color={cyan300}/></IconButton>
    <IconButton style={{display:!item.isdelay?'inline-block':'none'}} tooltip="申请延期" onClick={(e)=>{this.handeOpers(item,5);}}><DelayIcn color={deepOrange300}/></IconButton>
 */
export class ExtendTable extends React.Component {
  constructor(props) {
    super();
    this.sourceprops = props;
    let config = props.config;
    if(!config || !config.data.list){
      return null;
    }
    this.maxWidth = config.maxWidth;
    //处理数据
    this.mode = config.tablemode || TableMode.NORMAL;
    this.data = config.data;
    this.count = this.data.count || 0;

    //处理column
    let tablebodyconfig = config.body;
    this.columns = _.clone(tablebodyconfig.columns,true);
    this.hasOpers = tablebodyconfig.hasOpers;
    this.moreOperConfig = {
      hasOpers:tablebodyconfig.hasOpers,
      opers:tablebodyconfig.opers,
      showName:tablebodyconfig.opersTitle||'操作',
      handleCb:tablebodyconfig.handleCb,
      width:tablebodyconfig.hasOpers?(tablebodyconfig.operWidth?tablebodyconfig.operWidth:'auto'):null
    }
    //计算每个column宽度,暂时设置为没设置的为auto
    // if(tablebodyconfig.hasOpers&&this.maxWidth){
    //   if(_.isArray(tablebodyconfig.opers) && tablebodyconfig.opers.length>0){
    //     let settingwidth = 0;
    //     let pixelwidth = [];
    //     let percentwidth = [];
    //     let nonewidth = [];
    //     _.each(this.columns,(itm,idx)=>{
    //       if(itm.width){
    //         _.isNumber(itm.width.replace('px','')*1)?(settingwidth+=itm.width.replace('px','')*1):(settingwidth+=0);
    //       }
    //       if(itm.width){
    //         if(_.isNumber(itm.width.replace('px','')*1)){
    //           pixelwidth.push(idx);
    //         }else if(_.isNumber(itm.width.replace('%','')*1)){
    //           percentwidth.push(idx);
    //         }else{
    //           nonewidth.push(idx);  
    //         }
    //       }else{
    //         nonewidth.push(idx);
    //       }
    //       //!itm.width ? (itm.width = 'auto'):'';
    //     });
    //     _.isNumber(this.moreOperConfig.width.replace('px','')*1)?(settingwidth+=this.moreOperConfig.width.replace('px','')*1):(settingwidth+=0);
    //     //至少要有200像素多余
    //     if((this.maxWidth-200)<=settingwidth && pixelwidth.length<=this.columns.length){
    //       //全部用auto设置
    //       _.each(this.columns,(itm,idx)=>{
    //         itm.width = 'auto';
    //       });
    //     }else{
    //       let remainwidth = this.maxWidth - settingwidth;

    //     }
    //   }else{
    //     //设置默认的操作
    //   }
    // }else{
    //    _.each(this.columns,(itm,idx)=>{
    //       itm.width = 'auto';
    //     });
    // }
    if(tablebodyconfig.hasOpers){
      _.each(this.columns,(itm)=>{
        !itm.width?(itm.width='auto'):'';
      });
    }else{

    }
    //处理table样式
    
    
    
    
    let tableData = config.data.list || [];
    //let rowsPerPage = props.config.paginated.constructor === Object ? props.config.paginated.rowsPerPage : 5;

    //tableData = props.config.paginated ? new Paginate(tableData).perPage(rowsPerPage) : tableData;

    if (tableData instanceof Paginate) {
      tableData = tableData.page(1);
    }
    this.state = {
      disabled: true,
      style: searchStyle,
      tableData: tableData,
      searchData: [],
      isSearching: false,
      navigationStyle,
      iconStyleSearch,
      showSelect:config.canselect || false,//是否展示左侧checkbox
    };
    //处理toolbar，后面处理
    let toolbar = config.toolbar;
    let pagenation = toolbar.pagenation;
    if(pagenation && this.count){
      pagenation.rowsPerPage = pagenation.rowsPerPage || [5,10,15];
      this.state.pageOptions = {
        curPerPage:pagenation.rowsPerPage[0],
        rowsPerPage:pagenation.rowsPerPage,
        currentPage:1,
        maxPage:Math.ceil(this.count/pagenation.rowsPerPage[0]),
        changeCallBack:pagenation.foldCallback,
        count:this.count,
        isShow:true,
        offset:0,

      }
    }else{
      this.state.pageOptions = {
        isShow:false
      };
    }

    //this.columns = injectProp(props.config.columns);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.searchData = this.searchData.bind(this);
    this.handlePerPageChange = this.handlePerPageChange.bind(this);
    this.navigateRight = this.navigateRight.bind(this);
    this.navigateLeft = this.navigateLeft.bind(this);
  }

  handeOpers(row,type) {
    if(Object.prototype.toString.call(this.sourceprops.config.opers).toLowerCase().indexOf("function")>=0){
      this.sourceprops.config.opers(row,type);
    }
  }

  handleCb(row,type,refname) {
    console.log(row,type);
    if(_.isFunction(this.moreOperConfig.handleCb)){
      this.moreOperConfig.handleCb(row,type,refname);
    }
  }

  handlePerPageChange(evt, index, val) {
    console.log(arguments);
    let options = {
      limit:val,
      offset:0
    };
     this.state.pageOptions.changeCallBack(options).then(d=>{

      }).catch(e=>{
        let data = [
            {
              name:'任务一',
              isdelay:false,
              delayreason:'',
              progress:45,
              totaltime:4,
              time:'2016-7-15',
              status:1,
              ticket:'#98545,#65412',
              description:'兼容D3.js',
            },{
              name:'任务二',
              progress:12,
              totaltime:4,
              ticket:'#98545,#65412',
              description:'兼容D3.js',
              time:'2016-7-15',
              status:1,
              isdelay:true,
              delayreason:'在IE下表现特别诡异，难以处理'
            },{
              name:'任务三',
              progress:100,
              totaltime:7,
              ticket:'#98545,#65412',
              description:'兼容D3.js',
              time:'2016-7-18',
              status:3,
              isdelay:false,
              delayreason:''
            },{
              name:'任务四',
              progress:65,
              totaltime:4,
              ticket:'#98545,#65412',
              description:'兼容D3.js',
              time:'2016-8-22',
              status:1,
              isdelay:true,
              delayreason:'ffffffff'
            },{
              name:'任务五',
              progress:33,
              totaltime:4,
              ticket:'#98545,#65412',
              description:'dfgdfhgs.js',
              time:'2016-7-15',
              status:2,
              isdelay:false,
              delayreason:''
            },{
              name:'任务六',
              progress:100,
              totaltime:4,
              ticket:'#98545,#65412',
              description:'兼容WebGL啊',
              time:'2016-12-25',
              status:4,
              isdelay:true,
              delayreason:'212'
            },{
              name:'任务七',
              progress:22,
              totaltime:4,
              ticket:'#98545,#65412',
              description:'兼容D3.js',
              time:'2016-7-15',
              status:2,
              isdelay:true,
              delayreason:'234234'
            }
          ];
        this.setState({
          tableData:data,
          pageOptions:{
            curPerPage:val,
            rowsPerPage:this.state.pageOptions.rowsPerPage,
            currentPage:1,
            maxPage:Math.ceil(this.count/val),
            changeCallBack:this.state.pageOptions.changeCallBack,
            count:this.count,
            isShow:true,
            offset:0
          }
        })
      });
  }
  navigateRight() {
    if(this.state.pageOptions.currentPage+1>this.state.pageOptions.maxPage){

    }else{
      if(this.mode==TableMode.NORMAL){
        //不需要重新请求，直接展示结果
      }else{
        //需要重新请求
        let options = {
          limit:this.state.pageOptions.curPerPage,
          offset:this.state.pageOptions.currentPage*this.state.pageOptions.curPerPage
        }
        this.state.pageOptions.changeCallBack(options).then(d=>{

        }).catch(e=>{
          let data = [
            {
              name:'任务一',
              isdelay:false,
              delayreason:'',
              progress:45,
              totaltime:4,
              time:'2016-7-15',
              status:1,
              ticket:'#98545,#65412',
              description:'兼容D3.js',
            },{
              name:'任务二',
              progress:12,
              totaltime:4,
              ticket:'#98545,#65412',
              description:'兼容D3.js',
              time:'2016-7-15',
              status:1,
              isdelay:true,
              delayreason:'在IE下表现特别诡异，难以处理'
            },{
              name:'任务三',
              progress:100,
              totaltime:7,
              ticket:'#98545,#65412',
              description:'兼容D3.js',
              time:'2016-7-18',
              status:3,
              isdelay:false,
              delayreason:''
            },{
              name:'任务四',
              progress:65,
              totaltime:4,
              ticket:'#98545,#65412',
              description:'兼容D3.js',
              time:'2016-8-22',
              status:1,
              isdelay:true,
              delayreason:'ffffffff'
            },{
              name:'任务五',
              progress:33,
              totaltime:4,
              ticket:'#98545,#65412',
              description:'dfgdfhgs.js',
              time:'2016-7-15',
              status:2,
              isdelay:false,
              delayreason:''
            },{
              name:'任务六',
              progress:100,
              totaltime:4,
              ticket:'#98545,#65412',
              description:'兼容WebGL啊',
              time:'2016-12-25',
              status:4,
              isdelay:true,
              delayreason:'212'
            },{
              name:'任务七',
              progress:22,
              totaltime:4,
              ticket:'#98545,#65412',
              description:'兼容D3.js',
              time:'2016-7-15',
              status:2,
              isdelay:true,
              delayreason:'asd'
            }
          ];
          this.state.pageOptions.currentPage = this.state.pageOptions.currentPage+1;
          this.setState({
            tableData:data
          });
          this.forceUpdate();
        });
      }
    }
    console.log(this.state.pageOptions.currentPage+1);
  }

  navigateLeft() {
    if(this.state.pageOptions.currentPage-1==0){

    }else{
      if(this.mode==TableMode.NORMAL){
        //不需要重新请求，直接展示结果
      }else{
        //需要重新请求
        let options = {
          limit:this.state.pageOptions.curPerPage,
          offset:(this.state.pageOptions.currentPage-1)*this.state.pageOptions.curPerPage
        }
        this.state.pageOptions.changeCallBack(options).then(d=>{

        }).catch(e=>{
          let data = [
            {
              name:'任务一',
              isdelay:false,
              delayreason:'',
              progress:45,
              totaltime:4,
              time:'2016-7-15',
              status:1,
              ticket:'#98545,#65412',
              description:'兼容D3.js',
            },{
              name:'任务二',
              progress:12,
              totaltime:4,
              ticket:'#98545,#65412',
              description:'兼容D3.js',
              time:'2016-7-15',
              status:1,
              isdelay:true,
              delayreason:'在IE下表现特别诡异，难以处理'
            },{
              name:'任务三',
              progress:100,
              totaltime:7,
              ticket:'#98545,#65412',
              description:'兼容D3.js',
              time:'2016-7-18',
              status:3,
              isdelay:false,
              delayreason:''
            },{
              name:'任务四',
              progress:65,
              totaltime:4,
              ticket:'#98545,#65412',
              description:'兼容D3.js',
              time:'2016-8-22',
              status:1,
              isdelay:true,
              delayreason:'ffffffff'
            },{
              name:'任务五',
              progress:33,
              totaltime:4,
              ticket:'#98545,#65412',
              description:'dfgdfhgs.js',
              time:'2016-7-15',
              status:2,
              isdelay:false,
              delayreason:''
            },{
              name:'任务六',
              progress:100,
              totaltime:4,
              ticket:'#98545,#65412',
              description:'兼容WebGL啊',
              time:'2016-12-25',
              status:4,
              isdelay:true,
              delayreason:'212'
            },{
              name:'任务七',
              progress:22,
              totaltime:4,
              ticket:'#98545,#65412',
              description:'兼容D3.js',
              time:'2016-7-15',
              status:2,
              isdelay:true,
              delayreason:'asd'
            }
          ];
          this.state.pageOptions.currentPage = this.state.pageOptions.currentPage-1;
          this.setState({
            tableData:data
          });
          this.forceUpdate();
        });
      }
    }
    console.log(this.state.pageOptions.currentPage-1); 
  }

  paginationObject() {
    const res = this.state.tableData[this.state.tableData.length - 1];

    if (!res || !res.paginationInfo) {
      return {
        perPage: 5,
        currentPage: 1,
        previousPage: null,
        nextPage: null,
        currentlyShowing: '0 - 0 of 0',
        isLastPage: true,
        totalNumOfPages: 0,
        total: 0
      };
    }

    res.paginationInfo.perPage = this.state.perPageSelection;

    return res.paginationInfo;
  }

  showPaginationInfo() {
    return this.paginationObject().currentlyShowing;
  }

 
  mapColumnsToElems(cols) {
    let result = cols.map((item, index) => (
      <TableHeaderColumn key={index} style={{width:item.width}}>{item.title}</TableHeaderColumn>
    ));
    if(this.moreOperConfig.hasOpers){
      result.push(<TableHeaderColumn key={cols.length} >{this.moreOperConfig.showName}</TableHeaderColumn>);  
    }
    return result;
  }


  mapDataToProperties(properties, obj,cols) {
    return properties.map((prop, index) => (
      <TableRowColumn key={index} style={{width:cols[index].width,maxWidth:cols[index].width,paddingTop:'10px',paddingBottom:'10px',whiteSpace:'normal'}}>
        {this.renderTableData(obj, prop)}
      </TableRowColumn>
    ));
  }

  populateTableWithdata(data, cols) {
    
    //console.log('cols',cols);  
    const properties = cols.map(item => item.property);

    //console.log('properties',properties);

    return data.map((item, index) => {
      if (item.paginationInfo) return undefined;
      return (
        <TableRow key={index}>
          {this.mapDataToProperties(properties, item,cols)}
          <TableRowColumn style={{display:this.moreOperConfig.hasOpers?'block':'none'}}>
            {this.renderMoreOps(item)}
          </TableRowColumn>
        </TableRow>
      );
    });
  }
  
  renderMoreOps(row) {
    if(!this.moreOperConfig.hasOpers){
      return null;
    }else{
      return this.moreOperConfig.opers.map((itm,index)=>{
        return (
          itm.creator.call(this,itm,row)
        )
      })
    }
  }

  test(rowNumber,columnId,event) {
    var target = event.target;
    console.log(target);
  }

  calcColSpan(cols) {
    return cols.length+1;
  }

  shouldShowItem(item) {
    const styleObj = {
      display: (item ? '' : 'none')
    };
    
    return {display:'none'};
  }

  shouldShowMenu(defaultStyle) {
    if (this.props.config.paginated && this.props.config.paginated.constructor === Boolean) return defaultStyle;
    
    
    const menuOptions = this.props.config.paginated.menuOptions;

    return menuOptions ? defaultStyle : { display: 'none' };
  }

  toggleOpacity(val) {
    return val === 0 ? 1 : 0;
  }

  toggleSearch() {
    const style = Object.assign({}, this.state.style, {});
    const searchIconStyle = Object.assign({}, this.state.iconStyleSearch, {});
    let disabledState = this.state.disabled;

    style.opacity = this.toggleOpacity(style.opacity);
    searchIconStyle.opacity = this.toggleOpacity(searchIconStyle.opacity);

    disabledState = !disabledState;

    this.setState({
      style,
      iconStyleSearch: searchIconStyle,
      disabled: disabledState
    });
  }

  searchData(e) {
    const key = this.props.config.search;
    const word = e.target.value;
    const data = this.state.idempotentData;
    let paginationInfo;

    let res = arraySearch(key, word, data);

    this.setState({ searchData: res });

    if (word.length > 0) {
      this.setState({ isSearching: true });
    } else {
      this.setState({ isSearching: false });
    }

    if (this.props.config.paginated) {
      paginationInfo = this.paginationObject();
      res = new Paginate(res).perPage(paginationInfo.perPage).page(1);
    }

    this.setState({
      tableData: res
    });
  }

  renderTableData(obj, prop) {
    const columns = this.columns;

    if (hasCustomRender(prop, columns)) {
      return callCustomRender(prop, columns, obj);
    } else if (obj[prop] && hasHtml(prop, columns)) {
      return (
        <div>
          {obj[prop]}
          {extractHtml(prop, columns)}
        </div>
      );
    } else if (!obj[prop] && hasHtml(prop, columns)) {
      return extractHtml(prop, columns);
    } else if (obj[prop] && !hasHtml(prop, columns)) {
      return obj[prop];
    }

    return undefined;
  }

  setRowSelection(type, obj) {
    const menuOptions = type === 'object' ? obj.menuOptions : [5, 10, 15];

    return menuOptions.map((num, index) => (
      <MenuItem value={num} primaryText={num} key={index} />
    ));
  }

  handleRowSelection2(obj) {
    if ( obj && obj.constructor === Boolean ) {
      return this.setRowSelection('', obj);
    } else if ( obj && obj.constructor === Object ) {
      return this.setRowSelection('object', obj);
    } else {
      return;
    }
  }
  
  handleRowSelection(perpages) {
    return perpages.map((num, index) => (
      <MenuItem value={num} primaryText={num} key={index} />
    ));
  }

  renderTopTool() {
    return null
  }
  
  renderBottomTool(){
    return null;
  }

  render() {
    var btnClass = classNames({
      'ExtendTable': true,
      'hiddeninput': !this.state.showSelect
    });
    return (
      <Paper zDepth={1} className={style}>
        <Toolbar className="toptoolbar" style={{display:this.showTop?'block':'none'}}>{this.renderTopTool()}</Toolbar>        
        <Table className={btnClass} selectable={this.state.showSelect} >
          <TableHeader>
            <TableRow style={this.shouldShowItem(this.props.config.search)}>
              <TableHeaderColumn
                colSpan={this.calcColSpan(this.columns)}
                style={searchHeaderColumnStyle}
              >
                <input
                  type="search"
                  placeholder="查找"
                  style={this.state.style}
                  onKeyUp={this.searchData}
                />
              </TableHeaderColumn>
            </TableRow>

            <TableRow>
              {this.mapColumnsToElems(this.columns)}
            </TableRow>
          </TableHeader>

          <TableBody showRowHover>
            {this.populateTableWithdata(this.state.tableData, this.columns)}
          </TableBody>
          {this.state.pageOptions.isShow?(
            <TableFooter style={{display:this.state.pageOptions.isShow?'block':'none'}}>
            <TableRow>
              <TableRowColumn
                style={{ textAlign: 'right', verticalAlign: 'middle', width: '70%' }}
              >
                <span style={{}}>每页:</span>
                <SelectField
                  value={this.state.pageOptions.curPerPage}
                  style={{}}
                  onChange={this.handlePerPageChange}
                >
                  { this.handleRowSelection(this.state.pageOptions.rowsPerPage) }
                </SelectField>
              </TableRowColumn>

              <TableRowColumn style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                <span> 当前第{this.state.pageOptions.currentPage}页</span>
              </TableRowColumn>

              <TableRowColumn style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                <NavigateLeft onClick={this.navigateLeft} style={this.state.navigationStyle} />
                <NavigateRight onClick={this.navigateRight} style={this.state.navigationStyle} />
              </TableRowColumn>
            </TableRow>
          </TableFooter>
          ):null}


        </Table>
        <Toolbar className="bottomtoolbar" style={{display:this.showBottom?'block':'none'}}>{this.renderBottomTool()}</Toolbar>
      </Paper>
    );
  }
}

ExtendTable.propTypes = {
  config: React.PropTypes.object.isRequired
};
