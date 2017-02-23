/**
 * Created by hzxiangfangnian on 2017/2/21.
 */
const User = require('../model/user');
const Group = require('../model/group');
const Report = require('../model/report');
const Task = require('../model/task');
const TaskHistory = require('../model/taskhistory');
const TaskDelayHistory = require('../model/delayhistory');

let GroupControl = {
    checkUser:function* (user,groupid,next) {
        let group = Group.find({id:groupid});
        if(!group){
            return '';
        }
    }

};

let UserControl = {

};








model.export.Group = GroupControl;