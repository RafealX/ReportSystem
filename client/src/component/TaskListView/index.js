/**
 * ListView组件
 */
import React from 'react';
import {CircularProgress,Divder,Card,RaisedButton,Paper} from 'material-ui';
import Empty from 'cpn/Empty';
import _ from 'lodash';
import Mock from 'cpn/Mock';

import scss from './index.scss';
let user = window.user || {name:123,id:19283877};
//console.log('reportlist',Mock.progress.my.list);
//数据format
let reportlist = _.map(Mock.progress.my.list,(itm)=>{
    let arr;
    itm.createtime = new Date(itm.time);
    if(itm.report){
        arr = itm.report.split(';');

        if(_.isArray(arr) && arr.length>0){
            itm.reports = [];
            _.each(arr,(item)=>{
                let reportitm = item.split(','),tmp;
                 tmp= {
                    content:reportitm[0],
                    elapse:reportitm[1]*1,
                    ticket:reportitm[2]
                };
                itm.reports.push(tmp);
            })
        }
    }
    window.timet = new Date(itm.time);
    //console.log(itm);
    return itm;
});
//console.log('reportlist',Mock.progress.my.list);
export default React.createClass({
    getInitialState() {
        return {limit: 20, list: []};
    },
    componentDidMount() {
        this._loadList();
        document.getElementById('main-container').onscroll = this._checkScroll;
    },
    render() {
        return (<div className={scss.index}>
            {this.state.list.map(this.props.itemRender)}
        </div>);
    },
    _renderStatus() {
        switch (this.state.status) {
            case 'loading':
                return <CircularProgress className="loading"/>;
            case 'empty':
                return <Empty/>;
            case 'error':
                return <Empty tip="列表加载出错"/>;
        }
    },
    _checkScroll() {
        let box = document.getElementById('main-container');
        if (this.state.loaded || this.state.status == 'loading') {
            return;
        }
        if (box.scrollHeight - box.scrollTop <= 100 + box.clientHeight) {
            this._loadList();
        }
    },
    _loadList() {
        this.state.status = 'loading';
        this.forceUpdate();
        let datas = {
            userid:user.id,
            limit:this.state.limit,
            offset:this.state.list.length
        };
        this.props.loadList(datas)
            .then(d => {
                if (d.list && d.list.length) {
                    Array.prototype.push.apply(this.state.list, d.list);
                    if (d.total != null) {
                        this.state.total = d.total;
                    }
                    if (this.state.total != null && this.state.list.length >= this.state.total) {
                        this.state.loaded = true;
                    }
                    this.state.status = 'loaded';
                } else {
                    this.state.loaded = true;
                    this.state.status = 'loaded';
                    !this.state.list.length && (this.state.status = 'empty');
                }
                this.forceUpdate();
            })
            .catch(e => {
                //console.log(this.state.list,tasklist);
                let templist = _.clone(this.state.list,true);
                Array.prototype.push.apply(templist, tasklist);
                //Array.prototype.push.apply(this.state.list, tasklist);

                templist.sort((x,y)=>{
                    //console.log(new Date(x.time)-new Date(y.time));
                    return new Date(y.time)-new Date(x.time);
                });
                this.setState({list:templist,status:'loaded'});
                
                //后面需要撤销注释
                //this.setState({status: 'error'});
            });
    },
    updateItem(id, value) {
        let item = _.find(this.state.list, {id: id});
        if (item) {
            Object.assign(item, value);
            this.forceUpdate();
        }
    },
    deleteItem(id) {
        let index = _.findIndex(this.state.list, {id: id});
        if (index >= 0) {
            this.state.list.splice(index, 1);
            if (!this.state.list.length) {
                this.state.status = 'empty';
            }
            this.forceUpdate();
        }
    }
});