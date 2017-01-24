/**
 * 同后端交互api
 */ 
import {fetch} from 'lib/util';
import Mock from 'cpn/Mock';

const prefix = '/api';
let Backend = {
	report:{
		get:function(userid){
			let url = prefix+'/report'+'/get';
			var data = {
				userid:userid
			}
			return fetch(url,{body:data,method:'GET'});
		},
		add:function(data){
			let url = prefix+'/report'+'/add';
			let data = data;	
			return fetch(url,{body:data,method:'POST'});
		},
		send:function(data){
			let url = prefix+'/report'+'/send';
			let data = data;	
			return fetch(url,{body:data,method:'POST'});	
		},
		edit:function(data){
			let url = prefix+'/report'+'/send';
			let data = data;	
			return fetch(url,{body:data,method:'POST'});		
		},
		delete:function(id){
			let url = prefix+'/report'+'/delete';
			let data = {
				id:id
			};
			return fetch(url,{body:data,method:'POST'});	
		},
		team:{
			get:function(groupid){
				let url = prefix+'/report'+'/team/get';
				let data = {
					id:groupid
				};	
				return fetch(url,{body:data,method:'POST'});	
			}
		}
	},
	task:{
		get:function(userid){
			let url = prefix+'/task'+'/get';
			let data = {
				id:userid
			};	
			return fetch(url,{body:data,method:'GET'});	
		},
		add:function(data){
			let url = prefix+'/task'+'/add';
			let data = data;	
			return fetch(url,{body:data,method:'POST'});	
		},
		edit:function(data){
			let url = prefix+'/task'+'/edit';
			let data = data;	
			return fetch(url,{body:data,method:'POST'});	
		},
		delete:function(id){
			let url = prefix+'/task'+'/delete';
			let data = {
				id:id
			};	
			return fetch(url,{body:data,method:'POST'});	
		}
	},
	team:{
		get:function(id){
			let url = prefix+'/team'+'/get';
			let data = {
				id:id
			};	
			return fetch(url,{body:data,method:'GET'});	
		},
		add:function(data){
			let url = prefix+'/team'+'/add';
			let data = data;	
			return fetch(url,{body:data,method:'POST'});	
		},
		edit:function(data){
			let url = prefix+'/task'+'/edit';
			let data = data;	
			return fetch(url,{body:data,method:'POST'});	
		},
		delete:function(id){
			let url = prefix+'/task'+'/delete';
			let data = {
				id:id
			};	
			return fetch(url,{body:data,method:'POST'});	
		},
		member:{
			get:function(id){
				let url = prefix+'/task'+'/member/get';
				let data = {
					id:id
				};	
				return fetch(url,{body:data,method:'GET'});	
			}
		}
	}
};
export default Backend;