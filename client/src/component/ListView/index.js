/**
 * ListView组件
 */
import React from 'react';
import {CircularProgress} from 'material-ui';
import Empty from 'cpn/Empty';
import _ from 'lodash';
import scss from './index.scss';

export default React.createClass({
    getInitialState() {
        return {limit: 15, list: []};
    },
    componentDidMount() {
        this._loadList();
        document.getElementById('main-container').onscroll = this._checkScroll;
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
        this.props.loadList(this.state.limit, this.state.list.length)
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
                this.setState({status: 'error'});
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