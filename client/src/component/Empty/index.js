/**
 * 用户查找组件
 */
import React from 'react';
import SadIcon from 'material-ui/svg-icons/social/sentiment-dissatisfied';

let style = {
    padding: '30px 0',
    textAlign: 'center',
    lineHeight: '26px',
    color: '#ccc'
};

export default React.createClass({
    render() {
        return (
            <div style={style}>
                <SadIcon style={{verticalAlign: 'middle',color: '#ccc'}}/>
                <br/>
                {this.props.tip || '暂无数据~'}
            </div>
        );
    }
});