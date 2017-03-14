/**
 * 登陆相关接口
 */
import cookie from 'react-cookie';
import Backend from './backend';
import _ from 'lodash';
window.default_route = '/m/report/my/edit';
export let User = {
    resolve:function(cb){
        let report_info = cookie.load("report_uinfo") || '';
        let result = new Buffer(report_info, 'base64').toString();//str是base64编码的字符串
        if(result){
            result = JSON.parse(result);
            console.log("cookie",result);
            window.user = result;
            //重新获取user的role和groupid，确保和数据库一致
            Backend.user.get(window.user.id).then(d=>{
                window.user.role = d.user.role;
                window.user.groupid = d.user.groupid;
                if(_.isFunction(cb)){
                    cb();
                }
            }).catch(e=>{
                window.user.role = 1;//降级用户权限，保证安全
                if(_.isFunction(cb)){
                    cb();
                }
            })
        }else{
            window.user = null;
            if(_.isFunction(cb)){
                cb();
            }
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
                        pathname:window.default_route
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