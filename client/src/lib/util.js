/**
 * 工具方法
 */
import 'whatwg-fetch';
import {browserHistory} from 'react-router';
import cookie from 'react-cookie';
import _ from 'lodash';

export const indexroute = '/m/report/my/list';

export function fetch(url, option) {
    option && option.method && (option.method = option.method.toUpperCase());
    if (option && option.method == 'POST' && typeof option.body == 'object' && !(option.body instanceof FormData)) {
        option.body = JSON.stringify(option.body);
        option.headers = Object.assign({}, option.headers, {'Content-Type': 'application/json'});
    }else if(option && option.method=='GET'&& typeof option.body == 'object' && !(option.body instanceof FormData)){
        url+='?';
        for(var i in option.body){
            url+=(i+'='+option.body[i])+'&';
        }
        url = url.substring(0,url.length-1);
    }
    return window.fetch(url, Object.assign({}, option, {credentials: 'include'}))
        .then(resp => {
            if (resp.status == 200) {
                return resp.json();
            } else {
                throw Error('网络错误');
            }
        })
        .then(data => {
            if (data.code == 200) {
                return data;
            } else if(data.code && data.code==403){
                //走登录流程
                browserHistory.replace({
                    pathname:'/login',
                    state: { nextState: window.location.pathname?window.location.pathname:'/m/report/my/list' }
                })
            } else{
                throw data;
            }
        });
}

export function isMail(str) {
    return /^\w+@\w+/.test(str);
}

export function mustLogin(nextState, replace) {
    if (!window.user) {
        replace({
            pathname: '/login',
            state: {
                nextPathname: nextState.location.pathname
            }
        });
    }else{
        if(nextState&&nextState.location&&nextState.location.state){
            replace({
                pathname: nextState.location.state
            });
        }
    }
}


export function resolveUser() {
    let report_info = cookie.load("report_uinfo") || '';
    let result = new Buffer(report_info, 'base64').toString();//str是base64编码的字符串
    if(result){
        result = JSON.parse(result);
        console.log("cookie",result);
        window.user = result;
    }else{
        window.user = null;
    }
}

export function checkEnter(cb) {
    return function (e) {
        if (e.which == 13) {
            cb();
        }
    }
}
export function uuid(){
    return Math.random().toString(26).slice(2);
} 
export function today(){
    let date = new Date();
    date = new Date(date.toLocaleDateString());
    return date.getTime();
} 