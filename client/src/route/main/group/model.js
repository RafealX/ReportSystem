/*
	封装数据层的操作
 */

import _ from 'lodash';
import Backend from 'lib/backend';
import {uuid,today,getTime} from 'lib/util';
import pubsub from 'vanilla-pubsub';

let GroupObj = {
	data:null,
	formatter:function(source){
		if(source.members){
			source.s_members = JSON.parse(source.members);
			source.t_members = [];

			_.forIn(source.s_members,(v,k)=>{
				source.t_members.push({
					userid:k,
					name:v.name,
					role:v.role
				});
			});
			let copy = source.copyto||'';
			if(copy==''){
				source.copyto = [];
			}else{
				copy = copy.split(',');
				source.copyto = copy;
			}
			
		}
		return source;
	},
	ungroupusers:null,
	cbs:[],
	tasks:{}
};
export let Group = {
	init:function(){
		Backend.group.get().then(d=>{
			var result;
			if(d.data)
				GroupObj.data = result = GroupObj.formatter(d.data);
			_.each(GroupObj.cbs,itm=>{
				itm(GroupObj.data);
			})

		}).catch(e=>{

		});
	},
	ungroupusers:function(){
			return Backend.group.ungroupusers();
	},
	members:{
		del:function(m){
			let index = _.findIndex(GroupObj.data.t_members,(itm)=>{
			return  itm.userid==m.userid;
			});
			if(index>=0){
				GroupObj.data.t_members.splice(index,1);
				let users = m.userid;
				let data = _.clone(GroupObj.data,true);
				let obj = {};
				_.each(data.t_members,itm=>{
					obj[itm.userid]=itm.name;
				});
				let copyto = '';
				_.each(data.copyto,itm=>{
					copyto+=itm+',';
				});
				copyto = copyto.substring(0,copyto.length-1);
				delete data.s_members;
				delete data.t_members;
				delete data.copyto;
				data.members = JSON.stringify(obj);
				data.copyto = copyto;
				data.userid = users;
				return Backend.group.member.delete(data);
			}else{
				return null
			}

		},
		add:function(mebs){
			if(_.isArray(mebs) && mebs.length>0){
				_.each(mebs,itm=>{
					GroupObj.data.t_members.push({
						name:itm.label,
						userid:itm.value
					});
				});
				
				let data = _.clone(GroupObj.data,true);
				let obj = {};
				_.each(data.t_members,itm=>{
					obj[itm.userid]=itm.name;
				});
				let copyto = '';
				_.each(data.copyto,itm=>{
					copyto+=itm+',';
				});
				copyto = copyto.substring(0,copyto.length-1);
				delete data.s_members;
				delete data.t_members;
				delete data.copyto;
				data.members = JSON.stringify(obj);
				data.copyto = copyto;
				data.addusers = '';
				_.each(mebs,itm=>{
					data.addusers+=itm.value+',';
				});
				data.addusers = data.addusers.substring(0,data.addusers.length-1);
				return Backend.group.member.add(data);
			}else{
				return null;
			}
			
		}
	},
	get:function(){
		return GroupObj.data;
	},
	listen:function(cb){
		if(_.isFunction(cb)){
			GroupObj.cbs.push(cb);
		}
	},
	set:function(target){
		if(_.isObject(target)){
			_.forIn(target,(v,k)=>{
				if(GroupObj.data.hasOwnProperty(k)){
					delete GroupObj.data.k
				}
				if(_.isArray(v)){
					GroupObj.data[k] = [];
					GroupObj.data[k].length = 0;
					GroupObj.data[k] = v;
				}else{
					GroupObj.data[k] =v;
				}
			})
		}
		//GroupObj.data = _.merge(GroupObj.data,target);
	},
	send:function(){
		let data = _.clone(GroupObj.data,true);
		let obj = {};
		_.each(data.t_members,itm=>{
			obj[itm.userid]=itm.name;
		});
		let copyto = '';
		_.each(data.copyto,itm=>{
			copyto+=itm+',';
		});
		copyto = copyto.substring(0,copyto.length-1);
		delete data.s_members;
		delete data.t_members;
		delete data.copyto;
		data.members = JSON.stringify(obj);
		data.copyto = copyto;
		return Backend.group.edit(data);
	},
	clear:function(){
		GroupObj.data = null;
		GroupObj.cbs = [];
		GroupObj.cbs.length = 0;
		GroupObj.tasks = {};
	},
	admin:function(userid,isadmin){
		let data = {
			groupid:GroupObj.data.id,
			targetuserid:userid,
			isadmin:isadmin
		};
		return Backend.group.setadmin(data);
	}
};