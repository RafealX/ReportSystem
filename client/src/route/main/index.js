/**
 * 响应式容器,可根据视窗调整显示
 */
import React from 'react';
import {AppBar} from 'material-ui';
import Overlay from 'material-ui/internal/Overlay';
import TopNav from 'cpn/TopNav';
import pubsub from 'vanilla-pubsub';
import {User} from 'lib/auth';

const barStyle = {boxShadow: 0,width:'auto',marginLeft:'230px',backgroundColor:'#8cc0da'};
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
                    style={{marginLeft: this.state.forceOpen ? '230px' : 0, height: 'calc(100%)', overflowY: 'auto'}}>
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
        require('./report'),
        require('./task'),
        require('./feedback')
    ]
};
window.user && window.user.role && window.user.role==2?module.exports.childRoutes.push(require('./group')):'';