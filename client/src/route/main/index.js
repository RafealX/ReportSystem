/**
 * 响应式容器,可根据视窗调整显示
 */
import React from 'react';
import {AppBar} from 'material-ui';
import Overlay from 'material-ui/internal/Overlay';
import TopNav from 'cpn/TopNav';
import pubsub from 'vanilla-pubsub';

const barStyle = {boxShadow: 0,width:'auto',marginLeft:'256px'};
const style = {height: '100%'};
let requestId;

const Cpn = React.createClass({
    getInitialState() {
        return {forceOpen: false, open: false};
    },
    componentWillMount() {
        pubsub.subscribe('config.appBar', this._upBarConf);
        this._calcOpen();
    },
    componentDidMount() {
        window.onresize = this._onWinResize
    },
    componentWillUnmount() {
        pubsub.unsubscribe('config.appBar', this._upBarConf);
    },
    _upBarConf(c) {
        this.setState({barConf: c});
    },
    render() {
        let barConf = this.state.barConf;
        return (
            <div style={style}>
                <AppBar
                    style={barStyle}
                    onLeftIconButtonTouchTap={this._toggleOpen}
                    {...barConf}/>
                <Overlay
                    lock
                    onTouchTap={evt=>this.setState({open: false})}
                    show={!this.state.forceOpen && this.state.open}
                    style={{zIndex: 1200}}/>
                <TopNav
                    onRequestChange={open=>this.setState({open: open})}
                    open={this.state.open}
                    forceOpen={this.state.forceOpen}/>
                <div
                    id="main-container"
                    className={this.props.className}
                    style={{marginLeft: this.state.forceOpen ? '256px' : 0, height: 'calc(100% - 64px)', overflowY: 'auto'}}>
                    {this.props.children}
                </div>
            </div>
        );
    },
    _toggleOpen() {
        this.setState({
            open: true
        });
    },
    _calcOpen() {
        var forceOpen = document.body.clientWidth > 980;
        if (forceOpen != this.state.forceOpen) {
            this.setState({
                open: false,
                forceOpen: forceOpen
            });
        }
    },
    _onWinResize() {
        if (requestId) {
            window.cancelAnimationFrame(requestId);
        }
        window.requestAnimationFrame(this._calcOpen)
    }
});

module.exports = {
    path: 'm',
    component: Cpn,
    childRoutes: [
        require('./guide'),
        require('./group'),
        require('./report'),
        require('./team'),
        require('./profile')
    ]
};