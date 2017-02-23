/**
 * ListView组件
 */
import React from 'react';
import {CircularProgress,Divder,Card,RaisedButton,Paper} from 'material-ui';
import Empty from 'cpn/Empty';
import _ from 'lodash';

import scss from './index.scss';
let initialLoad = {
    data:4,
    isInitial:true
}
export default React.createClass({
    getInitialState() {
        return {list: [],count:0};
    },
    componentDidMount() {
        this.initialLoad();
        document.getElementById('main-container').onscroll = this._checkScroll;
    },
    initialLoad() {

        this.setState({status:'loading'});
        this.props.loadList()
            .then(d=>{
                console.log(d);
                let data = d.reports;
                let result = this.props.formatter(data);
                if(result && result.length>0){
                    let count = this.state.count;
                    count+=result.length;
                    this.setState({'list':this.props.getter(),count:count});
                    if(this.state.count<initialLoad.data && initialLoad.isInitial){
                        this.initialLoad();
                    }
                }
                if(result && result.length==0){
                    initialLoad.isInitial = false;
                    this.setState({status:'empty',loaded:true});
                }else{
                    this.setState({status:'loaded'});
                }
                
            })
            .catch(e => {
                
                //后面需要撤销注释
                this.setState({status: 'error'});
            });
    },
    render() {
        return (<div className={scss.index}>
            {this.state.list.map(this.props.itemRender)}
            {this._renderStatus()}
        </div>);
    },
    _renderStatus() {
        switch (this.state.status) {
            case 'loading':
                return <CircularProgress className="loading"/>;
            case 'empty':
                return <Empty tip="暂无数据，请点击右下角按钮添加日报~"/>;
            case 'done':
                return <Empty type={1} tip="我是有底线的~"/>;
            case 'error':
                return <Empty tip="列表加载出错"/>;
        }
    },
    componentWillUnmount() {
         document.getElementById('main-container').onscroll = null;
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
                
                //后面需要撤销注释
                this.setState({status: 'error'});
            });
    },
    delete() {
        this.setState({'list':this.props.getter()});
        var target = _.filter(this.state.list,itm=>{
            return itm.status!=3;
        });
        if(target.length<=1){
            this._loadList();
        }
    },
    updateView() {
        this.setState({'list':this.props.getter()});

    }
});