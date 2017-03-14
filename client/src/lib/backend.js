/**
 * 同后端交互api
 */ 
import {fetch} from 'lib/util';
import Mock from 'cpn/Mock';

const prefix = '/api';
let Backend = {
	report:{
		get:function(data){
			let url = prefix+'/report'+'/get';
			var datas = {
				userid:data.userid,
				limit:data.limit || 20,
				offset:data.offset||0
			}
			return fetch(url,{body:datas,method:'GET'});
		},
		add:function(data){
			let url = prefix+'/report'+'/add';
			return fetch(url,{body:data,method:'POST'});
		},
		send:function(id){
			let url = prefix+'/report'+'/send';
			let data = {
				reportid:id
			};
			return fetch(url,{body:data,method:'POST'});	
		},
		edit:function(data){
			let url = prefix+'/report'+'/edit';	
			return fetch(url,{body:data,method:'POST'});		
		},
		delete:function(id){
			let url = prefix+'/report'+'/delete';
			let data = {
				reportid:id
			};
			return fetch(url,{body:data,method:'POST'});	
		},
		exist:function(data){
			let url = prefix+'/report'+'/isadded';
			/*let date = new Date(time);
			date = new Date(date.toLocaleString());
			date = date.getTime();
			let data = {
				time:date
			};*/
			return fetch(url,{body:data,method:'POST'});	
		},
		team:{
			get:function(data){
				let url = prefix+'/report'+'/team/get';
				
				return fetch(url,{body:data,method:'POST'});	
			},
		},
		mail:function(data){
			let url = prefix+'/report'+'/sendmail';
			return fetch(url,{body:data,method:'POST'});
		},
		back:function(data){
			let url = prefix+'/report'+'/back';
			return fetch(url,{body:data,method:'POST'});
		}
	},
	task:{
		get:{
			byid:function(id){
				let url = prefix+'/task'+'/get';
				let data = {
					taskid:id
				}
				return fetch(url,{body:data,method:'POST'});	
			},
			list:function(params){
				let url = prefix+'/task'+'/get/list';
				let data = {
					id:params.userid?params.userid:'',
					limit:params.limit?params.limit:20,
					offset:params.offset?params.offset:0
				};	
				return fetch(url,{body:data,method:'POST'});	
			},
			unfinished:function(params){
				let url = prefix+'/task'+'/get/unfinished';
				let data = {
					userid:params
				};	
				return fetch(url,{body:data,method:'GET'});
			},
			delay:function(params){
				let url = prefix+'/task'+'/get/delay';
				let data = {
					id:params.userid?params.userid:'',
					delay:true,
					limit:params.limit?params.limit:0,
					offset:params.offset?params.offset:0
				};	
				return fetch(url,{body:data,method:'GET'});
			},
			history:function(params){
				let url = prefix+'/taskhistory'+'/get';
				let data = {
					taskid:params.taskid?params.taskid:'-1'
				};	
				return fetch(url,{body:data,method:'POST'});
			}
		},
		add:function(data){
			let url = prefix+'/task'+'/add';	
			return fetch(url,{body:data,method:'POST'});	
		},
		edit:function(data){
			let url = prefix+'/task'+'/edit';
			return fetch(url,{body:data,method:'POST'});	
		},
		delay:function(data){
			let url = prefix+'/task'+'/edit';
			//data//taskid  reason  date
			return fetch(url,{body:data,method:'POST'});		
		},
		delete:function(id){
			let url = prefix+'/task'+'/delete';
			let data = {
				taskid:id
			};	
			return fetch(url,{body:data,method:'POST'});	
		},

	},
	group:{
		get:function(id){
			let url = prefix+'/group'+'/get';
			return fetch(url,{method:'GET'});	
		},
		add:function(data){
			let url = prefix+'/group'+'/add';	
			return fetch(url,{body:data,method:'POST'});	
		},
		edit:function(data){
			let url = prefix+'/group'+'/set';
			return fetch(url,{body:data,method:'POST'});	
		},
		delete:function(id){
			let url = prefix+'/task'+'/delete';
			let data = {
				id:id
			};	
			return fetch(url,{body:data,method:'POST'});	
		},
		setadmin:function(data){
			let url = prefix+'/group'+'/setadmin';

			return fetch(url,{body:data,method:'POST'});	
		},
		member:{
			get:function(){
				let url = prefix+'/group'+'/getmember';
				return fetch(url,{method:'POST'});	
			},
			delete:function(data){
				let url = prefix+'/group'+'/user/del';
				return fetch(url,{body:data,method:'POST'});	
			},
			add:function(data){
				let url = prefix+'/group'+'/addmember';
				return fetch(url,{body:data,method:'POST'});	
			}
		},
		ungroupusers:function(){
			let url = prefix+'/group'+'/users/ungroup';
			return fetch(url,{method:'GET'});	
		}
	},
	user:{
		get:function(id){
			let url = prefix+'/user'+'/get';
			var datas = {
				userid:id,
			}
			return fetch(url,{body:datas,method:'get'});
		}
	},
	feedback:{
		set:function(data){
			let url = prefix+'/feedback'+'/set';
			var datas = {
				content:data
			}
			return fetch(url,{body:datas,method:'POST'});
		},
		get:function(){

		}
	}
};
export default Backend;