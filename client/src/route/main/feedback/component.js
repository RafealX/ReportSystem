/**
 * 首页
 */
import React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {browserHistory} from 'react-router';
import Backend from 'lib/backend';
import popup from 'cpn/popup';
import {Paper,FlatButton, CircularProgress,SelectField, TextField, MenuItem,FontIcon, IconButton,GridList, GridTile,
    Card, CardActions, CardHeader,CardText,Divider,DropDownMenu,Slider,
    DatePicker, Toolbar, ToolbarGroup, RaisedButton, ToolbarSeparator} from 'material-ui';

const labelColor = '#00bcd4';
const btnStyle = {marginRight: '20px'};
const areaStyle={
    height:'400px',
}
const textStyle={
    floatingLabelFocusStyle:{
        color:'#ff7781'
    },
    underlineFocusStyle:{
        borderColor:'#ff7781'
    }
}
module.exports = React.createClass({
    getInitialState() {
        let next = this.props.location.state;
        let defaultState = {continue:'/m/report/my/list'};
        console.log(defaultState);
        return defaultState;
    },
    send() {
        if(this.state.content){
            Backend.feedback.set(this.state.content).then(d=>{
                popup.success('吐槽成功！');
                browserHistory.replace(this.state.continue);
            }).catch(e=>{

            })
        }else{

        }
        
    },
    render() {
        return (
            <div className={'f-textvertical'}>
                <Grid>
                    <Row>
                       <Col xs={2} sm={2} md={2} lg={2}></Col>
                        <Col xs={8} sm={8} md={8} lg={8}>
                            <Card  style={{margin:'10px 0',width:'100%',boxShadow:'rgba(0, 0, 0, 0.117647) 0px 0px 4px, rgba(0, 0, 0, 0.117647) 0px 1px 0px'}} expandable={true} showExpandableButton={true} >
                             <CardText style={{paddingTop:0,paddingBottom:0}}>
                                    <TextField style={areaStyle} textareaStyle={areaStyle}
                                      floatingLabelText="吐槽和建议"  floatingLabelFocusStyle={textStyle.floatingLabelFocusStyle} underlineFocusStyle={textStyle.underlineFocusStyle}
                                      type='textarea' multiLine={true}
                                      defaultValue={this.state.content} 
                                      rows={1} 
                                      rowsMax={6} fullWidth={true}
                                      onChange={(e,news)=>{this.setState({content:news})}}
                                    />
                                     <RaisedButton style={{margin:'10px 0',width:'100%'}} label="吐槽之" backgroundColor={'#ff7781'} labelColor={'#fff'} onClick={this.send}/>
                                </CardText>
                            </Card>
                            
                        </Col>
                        <Col xs={2} sm={2} md={2} lg={2}></Col>
                    </Row>
                </Grid>
            </div>
        );
    }
});