/*
	封装数据层的操作
 */

import _ from 'lodash';
import Backend from 'lib/backend';
import {uuid,today,getTime} from 'lib/util';
import pubsub from 'vanilla-pubsub';
import Mock from 'cpn/Mock';
/**
 * 写日报依赖数据
 * @type {[type]}
 */
let UnFinishedTask = null;
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

export let UnFinish = {
	get:function(){
		return UnFinishedTask;
	},
	funcs:[],
	listen:function(callback){
		UnFinish.funcs.push(callback);
		pubsub.subscribe('Report.Unfinished.load',callback);
	},
	init:function(){
		Backend.task.get.unfinished(user.id).then(d=>{
			
			UnFinishedTask = d.data;
			Report.inject.task(UnFinishedTask);
			console.log(UnFinishedTask);
			pubsub.publish('Report.Unfinished.load',);
		}).catch(e=>{

			//UnFinishedTask = formatter(MockUnfinish());
			//pubsub.publish('Task.Unfinished.load');
		});
	},
	clear:function(){
		UnFinishedTask = [];
		UnFinishedTask.length = 0;
		UnFinishedTask = null;
		_.each(UnFinish.funcs,itm=>{
			pubsub.unsubscribe('Report.Unfinished.load',itm);
		});
		UnFinish.funcs =[];
		UnFinish.funcs.length = 0;
	}
}



/**
 * 日报实体相关数据
 * @type {Object}
 */
let editReportId = '';
let fakeid = 1;
let fakeTask = {
	report:{
		content:'',
		ticket:'',
		id:'',
		elapse:'',
		status:1//在写日报时新加的任务时允许删除，此项标识是新增的任务而非已经存在的未完成任务
	},
	task:{
		isnew:true,
		curid:uuid(),
		elapse:'',
		taskid:'',
		taskname:'',
		description:'',//任务的目的描述
		content:'',//本日进度
		progress:0,
		startprogress:0,//只有进行编辑的时候才会用到此属性
		time:today(),
		tasktime:null,
		sourcetasktime:null,//记录原始截止时间，只有已存在的未完成任务修改时才会起效
		reason:'',//记录延期原因
		status:1//在写日报时新加的任务时允许删除，此项标识是新增的任务而非已经存在的未完成任务
	}
};

let TaskObj = {
	time:new Date(),
	report:[],
	task:[],
	original:{
		report:null,
		task:null,
	},
	editData:null,
};


export let Report={
	send:function(){
		let result = TaskObj;
		//格式化数据
		let data = {
			time:(result.time&&getTime(result.time)) || today(),
		}
		let report = '';
		_.each(result.report,itm=>{
			if(itm.content&&itm.elapse)
				report+=itm.content+'|'+itm.elapse+'|'+(itm.ticket||'')+';';
		});
		report = report.substring(0,report.length-1);
		data.report = report;

		_.each(result.task,itm=>{
			//itm.time = new Date(itm.time).getTime();
			
			delete result.status;
		});
		data.tasks = result.task;
		//是否要格式化时间
		let sendData = {
			userid:user.id,
			taskhistorylist:JSON.stringify(data.tasks),
			others:data.report,
			userid:window.user.id,
			groupid:window.user.groupid,
			time:data.time
		}
		editReportId?(sendData.reportid=editReportId):'';
		//return '';
		return editReportId?Backend.report.edit(sendData):Backend.report.add(sendData);
	},
	get:function(){
		return TaskObj;
	},
	set:{
		report:function(data){
			//TaskObj.report.unshift(data);
			TaskObj.report.push(data);
		},
		task:function(data){
			//TaskObj.task.unshift(data);
			TaskObj.task.push(data);

		},
		time:function(data){
			TaskObj.time = data;
		}
	},
	delete:{
		report:function(data){
			_.remove(TaskObj.report,(itm)=>{return data.id==itm.id});
		},
		task:function(data){
			_.remove(TaskObj.task,(itm)=>{return data.id==itm.id});
		}
	},
	clear:function(){
		TaskObj.report = [];
		TaskObj.report.length = 0;
		TaskObj.task = [];
		TaskObj.task.length = 0;
		TaskObj.time = null;
		editReportId = '';
	},
	fake:{
		report:function(){
			let result = _.clone(fakeTask.report,true);
			result.id = uuid();
			return result;
		},
		task:function(){
			let result = _.clone(fakeTask.task,true);
			result.id = uuid();
			return result;
		},
	},
	//被编辑调起
	init:{
		edit:function(sourcedata,cb){
			//需要初始化数据并且对Unfinished数据进行操作，基本是要等待Unfinished载入完成才能做动作的。
			TaskObj.editData = _.clone(sourcedata,true);
			let callback = function(data){
				var _source = data;
				return function(){
					_source = TaskObj.editData ;
					TaskObj.report = _source.reports || [];

					console.log(TaskObj.task,_source.taskhistorylist);
					//编辑时，需要过滤已经写上了的数据
					if(TaskObj.task.length>0){
						//找到已经填写编辑的任务，删除之
						for(let i=0;i<_source.taskhistorylist.length;i++){
							let tempTask = _.clone(_source.taskhistorylist[i],true);

							
							//tempTask.tasktime = 
							var index = _.findIndex(TaskObj.task,itm=>{
								return itm.taskid==tempTask.taskid;
							});
							if(index>=0){
								let pushitm = TaskObj.task[index];
								pushitm.id = tempTask.id;
								pushitm.content = tempTask.content;
								pushitm.time = tempTask.time;
								pushitm.elapse = tempTask.elapse;
								pushitm.content!=''?(pushitm.show = true):'';
								pushitm.progress = tempTask.progress;
								tempTask.startprogress && tempTask.startprogress>0?(pushitm.startprogress = tempTask.startprogress):'';
								//TaskObj.task.splice(index,1,pushitm);
							}else{
								//新建数据项
								//这个应该只会在一个任务已经处于完成状态时而去编辑有该项任务的日报才会执行这里的代码
								let pushitm = tempTask;
								pushitm.id = tempTask.id;
								pushitm.taskid = tempTask.taskid;
								pushitm.taskname = tempTask.taskname;
								pushitm.description = '';//Todo 获取不在Unfinished中的任务
								pushitm.content = tempTask.content;
								pushitm.time = tempTask.time;
								pushitm.content!=''?(pushitm.show = true):'';
								//pushitm.tasktime = tempTask.tasktime;
								pushitm.elapse = tempTask.elapse;
								pushitm.progress = tempTask.progress;
								pushitm.status = 2;
								TaskObj.task.push(tempTask);
							}

						}
						
					}else{
						TaskObj.task = TaskObj.task.concat(_source.taskhistorylist);
					}
					console.log('TaskObj.task',TaskObj.task);
					//把原始的数据保存下来
					TaskObj.original.task = _.clone(TaskObj.task,true);
					TaskObj.original.report = _.clone(TaskObj.report,true);
					//TaskObj.task = TaskObj.task.concat(data.taskhistorylist);
					TaskObj.time = _source.time || null;
					_.each(TaskObj._source,itm=>{
						itm.status=2;
					});
					_.each(TaskObj.task,itm=>{
						itm.status=2;
						_.each(UnFinish.get(),item=>{
							item.id==itm.id?item.status=0:'';
						})
					});
					if(_.isFunction(cb)){
						cb();
					}
					console.log(TaskObj);
				}
			}
			
			console.log(sourcedata);
			editReportId = sourcedata.id;
			let resultcall = callback(_.clone(sourcedata,true));
			if(!UnFinishedTask){
				UnFinish.listen(resultcall);
			}else{
				resultcall();
			}
		},
		
	},
	inject:{
		task:function(unfinishtasks){
			//把未完成的任务注入到task里
			if(_.isArray(unfinishtasks) && unfinishtasks.length>0){
				_.each(unfinishtasks,(itm)=>{
					let clonetask = Report.fake.task();
					clonetask.taskid = itm.id;
					clonetask.taskname = itm.name;
					clonetask.tasktime = itm.endtime;
					clonetask.sourcetasktime = clonetask.tasktime;//用来检测用户是否进行延期操作
					clonetask.time = new Date().getTime();
					clonetask.description = itm.description;
					clonetask.progress = itm.progress;
					clonetask.reason = '';//记录延期原因
					clonetask.status=2;//表明不是在写日报时
					delete clonetask.isnew;
					TaskObj.task.push(clonetask);
				});
			}
		},
		report:function(){
			// if(TaskObj.report.length==0){
			// 	TaskObj.report.unshift(Report.fake.report());
			// }
		}
	},
	validate:function(){
		var result = true;
		if(_.isArray(TaskObj.task) && TaskObj.task.length>0)
			_.each(TaskObj.task,itm=>{
				if((itm.taskname=='')||(itm.description=='')||(itm.content!='' &&(itm.elapse==''||itm.elapse==0)) ||(itm.content==''&&itm.elapse!='') || (itm.sourcetasktime!=null&&itm.sourcetasktime!=itm.tasktime&&itm.reason=='')||(itm.sourcetasktime==null&&itm.tasktime==null) || (itm.tasktime<today())){
					result = false;
					
					return result;
				}
			});
		if(result){
			if(_.isArray(TaskObj.report) && TaskObj.report.length>0)
				_.each(TaskObj.report,itm=>{
				if(itm.content=='' && (itm.elapse==''||itm.elapse==0)){

				}else{
					if((itm.content!='' &&itm.elapse==''||itm.elapse==0) ||(itm.content==''&&itm.elapse!='')){
						result = false;
						return result;
					}	
				}
				
			});
		}
		return result;
	},
	exist(){
		let result = TaskObj;
		let data = {
			time:(result.time&&getTime(result.time)) || today(),
			userid:window.user.id,
		};
		return Backend.report.exist(data);
	}
}
