'use strict';
/**
 * Newton build on nodejs 5.1.0
 */
const process = require('process');
const cp = require('child_process');
const path = require('path');
const util = require('./lib/util');

/**
 * 全局环境和变量初始化
 */
global.gRoot = process.argv[2];
global.gOutput = gRoot+'/output';

if(!gRoot){
	console.log('源代码路径：'+gRoot+'不存在！');
	return;
}
util.mkdir(gOutput, true);

var conf;
try{
	conf = require(gRoot+'/newton.config.json');
}catch(e){
	gLog.error(JSON.stringify(e));
	return;
	conf = {};
}
global.gConf = util.extend(require('./lib/default-config.json'), conf);
if(!Array.isArray(gConf.app))
	gConf.app = [gConf.app];


global.gCompileRoot = path.join('/tmp/newton/'+gConf.project+'-'+util.now('-'));
util.mkdir(gCompileRoot, true);
global.gLog = require('./lib/log')(gCompileRoot);

/**
 * 拷贝文件到/tmp/newton/{project}下，准备编译
 */
if(gConf.app.length<=0){
	gLog.warning('因为没有配置app,直接通出');
	return;
}
gConf.app.forEach(function(appConf){
	appConf = util.extend(appConf, gConf, false);
	if(appConf.tpl){
		util.mkdir(appConf.tpl, gCompileRoot, true);
		cp.execSync('cp -R '+path.join(gRoot, appConf.tpl,'/')+'* '+path.join(gCompileRoot, appConf.tpl, '/'))
	}
	if(appConf.res){
		util.mkdir(appConf.res, gCompileRoot, true);
		cp.execSync('cp -R '+path.join(gRoot, appConf.res,'/')+'* '+path.join(gCompileRoot, appConf.res, '/'))
	}
});

/**
 * 执行各个编译任务
 */
var jobs = [
	//'webpack',
//'jsCompress', 
'cssCompress']//, 'staticToCdn'];
var jobName,
	startTime;
function executeJob(){
	if(jobs.length>0){
		jobName = jobs.shift();
		gLog('Newton: 开始执行任务：'+jobName);
		startTime = new Date();
		require('./lib/job/'+jobName).run().then(function(data){
			gLog('Newton: 任务执行完成：'+jobName+', 共耗时：'+util.timeFormat(new Date - startTime));
			executeJob();
		}, function(data){
			gLog.error('Newton: 任务执行失败：'+jobName);
			if(data){
				data = typeof data=='string' ? data: JSON.stringify(data);
				gLog.error(data);
			}
		}).catch(function(e){
			gLog.error('Newton: 任务执行出现意外：'+jobName);
			console.log(e, e.line);
		});
	}else{
		gLog('NT编译完成');
	}
}
executeJob();

