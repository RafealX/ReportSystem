/**
 * 时间线组件
 */

import React from 'react';
import {browserHistory} from 'react-router';
import {Divder,Card,RaisedButton,Paper} from 'material-ui';
import {Step,Stepper,StepLabel,StepContent} 'material-ui/Stepper';
import {fetch} from 'lib/util';
import popup from 'cpn/popup';
import pubsub from 'vanilla-pubsub';
import Editor from 'cpn/Editor';
import format from 'date-format';