/**
 * Mock数据集合
 * @type {Object}
 */

//个人日报
let myTask ={"code":200,"list":[{"updateTime":"2017-01-18T12:36:39.387Z","createTime":"2017-01-18T12:36:39.387Z","type":"day","periodTime":1484668800000,"content":"test","userId":"58442c1ac32a8d204e44cd89","periodDesc":"2017.01.18 日报","id":"587f6157ae2f814e9feac2c7"},{"updateTime":"2016-12-04T14:55:44.085Z","createTime":"2016-12-04T14:54:49.770Z","type":"day","periodTime":1480608000000,"content":"<p style=\"border: 0px; margin: 0px 0px 20px; padding: 0px; font-size: 15px; color: rgb(46, 46, 46); font-family: &quot;Microsoft YaHei&quot;, 宋体, &quot;Myriad Pro&quot;, Lato, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; background-color: rgb(255, 255, 255); text-align: justify;\"><ol><li>它结构简单，可以让其他人可以非常轻松地参与进来，但这才仅仅是开始。</li><li>如果没有适当的处理，你的储存库（repository）会变得很庞大，挤满重复的问题单、模糊不明的特性需求单、含混的 bug 报告单。项目维护者会被大量工作压得喘不过气来，新的贡献者也搞不清楚项目当前的工作重点是什么。</li><li>接下来，我们一起研究下，如何玩转 GitHub 的问题单。</li></ol></p>","userId":"58442c1ac32a8d204e44cd89","toTeam":{"teamId":"58442d0ac32a8d204e44cd94","teamName":"前端组","teamReportId":"58442e70c32a8d204e44cda1"},"periodDesc":"2016.12.02 日报","id":"58442e39c32a8d204e44cd9d"},{"updateTime":"2016-12-04T14:55:41.532Z","createTime":"2016-12-04T14:55:36.562Z","type":"week","periodTime":1480608000000,"content":"<span style=\"color: rgb(46, 46, 46); font-family: &quot;Microsoft YaHei&quot;, 宋体, &quot;Myriad Pro&quot;, Lato, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; font-size: 15px; text-align: justify; background-color: rgb(255, 255, 255);\">统一的问题单模板可以大大减轻项目维护者的负担，尤其是开源项目的维护者。我们发现，让用户讲故事的方法总是可以把问题描述的非常清楚。用户讲故事时需要说明“是谁，做了什么，为什么而做”，也就是：我是【何种用户】，为了【达到何种目的】，我要【做何种操作】。</span>","userId":"58442c1ac32a8d204e44cd89","toTeam":{"teamId":"58442d0ac32a8d204e44cd94","teamName":"前端组","teamReportId":"58442e6dc32a8d204e44cd9f"},"periodDesc":"2016.11.28~2016.12.04 周报","id":"58442e68c32a8d204e44cd9e"},{"updateTime":"2016-12-04T14:51:42.059Z","createTime":"2016-12-04T14:51:29.249Z","type":"day","periodTime":1480521600000,"content":"<h2>标题</h2><div><ol><li style=\"border: 0px; margin: 0px 0px 5px 30px; padding: 0px; font-size: 15px;\">客户价值所在</li><li style=\"border: 0px; margin: 0px 0px 5px 30px; padding: 0px; font-size: 15px;\">避免使用术语或晦涩的文字，就算不是专家也能看懂</li><li style=\"border: 0px; margin: 0px 0px 5px 30px; padding: 0px; font-size: 15px;\">可以切分，也就是说我们可以逐步解决问题</li><li style=\"border: 0px; margin: 0px 0px 5px 30px; padding: 0px; font-size: 15px;\">尽量跟其他问题单没有瓜葛，依赖其它问题会降低处理的灵活性</li><li style=\"border: 0px; margin: 0px 0px 5px 30px; padding: 0px; font-size: 15px;\">可以协商，也就说我们有好几种办法达到目标</li><li style=\"border: 0px; margin: 0px 0px 5px 30px; padding: 0px; font-size: 15px;\">问题足够小，可以非常容易的评估出所需时间和资源</li><li style=\"border: 0px; margin: 0px 0px 5px 30px; padding: 0px; font-size: 15px;\">可衡量，我们可以对结果进行测试</li></ol></div>","userId":"58442c1ac32a8d204e44cd89","toTeam":{"teamId":"58442d0ac32a8d204e44cd94","teamName":"前端组","teamReportId":"58442d7ec32a8d204e44cd9b"},"periodDesc":"2016.12.01 日报","id":"58442d71c32a8d204e44cd9a"}]}

//小组日报
let teamTask = {

};

let Result = {
	task:{
		my:myTask,
		team:teamTask
	}
}
export default Result;