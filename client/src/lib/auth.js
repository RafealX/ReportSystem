/**
 * 登陆相关接口
 */
import cookie from 'react-cookie';

export let User = {
    resolve:function(){
        let report_info = cookie.load("report_uinfo") || '';
        let result = new Buffer(report_info, 'base64').toString();//str是base64编码的字符串
        if(result){
            result = JSON.parse(result);
            console.log("cookie",result);
            window.user = result;
        }else{
            window.user = null;
        }
    },
    check:function(){
        return window.user;
    },
    login:function(nextState,replace){
        if(!User.check()){
            if(nextState.location.pathname!='/login'){
                replace({
                    pathname: '/login',
                    state: {
                        nextPathname: nextState.location.pathname
                    }
                });
            }
        }else{
            if(nextState.location.pathname!='/login'){

            }else{
                if(nextState&&nextState.location&&nextState.location.state){
                    replace({
                        pathname: nextState.location.state
                    });
                }else{
                    replace({
                        pathname:'/m/report/my/list'
                    })
                }
            }
            
        }
    }
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