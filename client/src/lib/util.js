/**
 * 工具方法
 */
import 'whatwg-fetch';

export function fetch(url, option) {
    option && option.method && (option.method = option.method.toUpperCase());
    if (option && option.method == 'POST' && typeof option.body == 'object' && !(option.body instanceof FormData)) {
        option.body = JSON.stringify(option.body);
        option.headers = Object.assign({}, option.headers, {'Content-Type': 'application/json'});
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
            } else {
                throw data;
            }
        });
}

export function isMail(str) {
    return /^\w+@\w+/.test(str);
}

export function mustLogin(nextState, replace) {
    if (!_user.id) {
        replace({
            pathname: '/account/login',
            state: {
                nextPathname: nextState.location.pathname
            }
        });
    }
}

export function checkEnter(cb) {
    return function (e) {
        if (e.which == 13) {
            cb();
        }
    }
}