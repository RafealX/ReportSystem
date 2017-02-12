/**
 * 用户查找组件
 */
import React from 'react';
import SadIcon from 'material-ui/svg-icons/social/sentiment-dissatisfied';
import HappyIcon from 'material-ui/svg-icons/social/mood';

let style = {
    textAlign: 'center',
    color: '#ccc',
    margin: '10px 0 10px'
};

export default React.createClass({
    render() {
        return (
            <div style={style}>
                {this.props.type==1? <HappyIcon style={{verticalAlign: 'middle',color: '#ccc'}}/>:
                    <SadIcon style={{verticalAlign: 'middle',color: '#ccc'}}/>
                }
                
                <br/>
                {this.props.tip || '暂无数据~'}
            </div>
        );
    }
});