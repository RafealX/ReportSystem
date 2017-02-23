/*
	封装数据层的操作
 */

import _ from 'lodash';
import Backend from 'lib/backend';
import {uuid} from 'lib/util';
import pubsub from 'vanilla-pubsub';
/**
 * 写日报依赖数据
 * @type {[type]}
 */
let MemberList = [];

let formatter = arr =>{
	let result = [];
	_.each(arr,(itm,idx)=>{
		result.push({
			id:itm.id,
			progress:itm.progress,
			taskname:itm.name,
			time:itm.time
		});
	});
	return result;
}

export let Members = {
	get:function(){
		return MemberList;
	},
	listen:function(callback){
		pubsub.subscribe('Member.load',callback);
	},
	init:function(callback){
		Backend.team.member.get().then(d=>{
			MemberList = d.data;
			_.isFunction(callback)?callback():'';
		}).catch(e=>{

			//UnFinishedTask = formatter(MockUnfinish());
			//pubsub.publish('Task.Unfinished.load');
		});
	},
	clear:function(){
		MemberList = [];
		MemberList.length = 0;
		MemberList = null;
	}
}

/**
 * 日报实体相关数据
 * @type {Object}
 */
let TeamReportObj = {
	first:true,
	offset:0,
	limit:1,
	data:[],
	result:{}
};

export let TeamReport={
	get:function(){
		if(TeamReportObj.first){
			TeamReportObj.offset = -1;	
			TeamReportObj.first = false;
		}
		TeamReportObj.offset += TeamReportObj.limit;
		return Backend.report.team.get({
			groupid:window.user.groupid,
			offset:TeamReportObj.offset
		});
	},
	formatter:function(result){
		console.log(result);
		let tasklist = [];
		if(_.isArray(result) && result.length>0){
			
			tasklist= _.map(result,(itm)=>{
			    let arr;
			    itm.time = new Date(itm.time);
			    if(itm.others){
			        arr = itm.others.split(';');
			        if(_.isArray(arr) && arr.length>0){
			            itm.reports = [];
			            _.each(arr,(item)=>{
			                let reportitm = item.split(','),tmp;
			                 tmp= {
			                    content:reportitm[0],
			                    elapse:reportitm[1]*1 || '',
			                    ticket:reportitm[2] || ''
			                };
			                itm.reports.push(tmp);
			            })
			        }
			    }
			    return itm;
			});
			//遍历生成timeObject
			_.each(tasklist,(itm,i)=>{
				var time = (new Date(itm.time)).getTime();
				if(!TeamReportObj.result[time+'']){
					TeamReportObj.result[time+''] = [];
					TeamReportObj.result[time + ''].push(itm);
				}else{
					TeamReportObj.result[time+''].push(itm);
				}
				
				

			});
			if(window.user && window.user.role==2){//组长才能有权限
				var timearrs = _.keys(TeamReportObj.result);
				timearrs = timearrs.sort((x,y)=>{
					return y*1-x*1;
				});
				_.forEach(timearrs,(itm,idx)=>{
					if(idx!=timearrs.length-1){
						if(TeamReportObj.result[itm].length<_.keys(MemberList).length){
							_.forIn(MemberList,(v,k)=>{
								var _idx = _.findIndex(TeamReportObj.result[itm],(x)=>{
									return x.userid==k;
								});
								if(_idx<0){
									TeamReportObj.result[itm].push({
										others:'',
										withnullconent:true,//标示是否没写日报
										reports:[],
										status:2,
										tasks:[],
										time:itm,
										userid:k,
										username:v,
										groupid:window.user.groupid
									})
								}
							});
							console.log(MemberList);
						}
					}
				});
			}
			console.log(TeamReportObj.result);
			TeamReportObj.data = TeamReportObj.data.concat(tasklist);
			TeamReportObj.data = TeamReportObj.data.sort((x,y)=>{
				return y.time-x.time;
			});

		}
		console.log('tasklist',tasklist);
		return tasklist;
		
	},
	operation:{
		get:function(){
			return TeamReportObj.result;
		}
	},
	set:{
		limit:function(data){
			_.isNumber(data)?(TeamReportObj.limit=data):'';
		},

	},
	reset:function(){
		TeamReportObj.first = true;
		TeamReportObj.data = [];
		TeamReportObj.data.length = [];
		TeamReportObj.result = {};
		TeamReportObj.limit = 1;
		TeamReportObj.offset = 0;
	},
	init:function(callback){
		if(window.user && window.user.role==2){
			Members.init(callback);
		}else{
			callback();
		}
	},
	saveReport:function(itm,callback){
		let sendData = {
			taskhistorylist:JSON.stringify(itm.tasks),
			others:itm.others,
			userid:itm.userid,
			groupid:itm.groupid,
			time:itm.time,
			username:itm.username
		}
		Backend.report.add(sendData).then(d=>{
			Backend.report.send(d.data.id).then(data=>{
				console.log(d.data);
				itm.reports.push({
					content:d.data.others
				});
				delete itm.withnullconent;
				callback(itm);
			}).catch(e=>{

			})
		}).catch(e=>{

		})
	}
}
