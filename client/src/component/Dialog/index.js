/**
 * Dialog插件，内容自定义，显示的按钮随着传递的内容变化而变化
 */
import React from 'react';
import scss from './index.scss';

export default React.createClass({
    shouldComponentUpdate() {
        return false;
    },
    componentDidMount() {
      
    },
    componentWillUnmount() {

    },
    render() {
        const actions = [{

        }];
        return (
            <div >
                <Dialog title={this.props.title||'新建'}
                 actions={this.props.actions ||actions}
                 modal={false}
                 open={!!this.state.open?true:false}>
                 {this.props.renders()}
                </Dialog>
            </div>
        );
    },
    
});