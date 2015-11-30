'use strict';
/**
 * Newton build on nodejs 5.1.0
 */
const process = require('process');
const fs = require('fs');
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
	conf = require(gRoot+'/config.json');
}catch(e){
	conf = {};
}

global.gConf = util.extend(require('./lib/default-config.json'), conf);
if(!Array.isArray(gConf.dirs))
	gConf.dirs = [gConf.dirs];


global.gCompileRoot = path.join('/tmp/newton/'+gConf.project+'-'+util.now('-'));
util.mkdir(gCompileRoot, true);
global.gLog = require('./lib/log')(gCompileRoot);
/**
 * 拷贝文件到/tmp/newton/{project}下，准备编译
 */

gConf.dirs.forEach(function(dir){
	if(dir.tpl){
		util.mkdir(dir.tpl, gCompileRoot, true);
		cp.execSync('cp -R '+path.join(gRoot, dir.tpl,'/')+'* '+path.join(gCompileRoot, dir.tpl, '/'))
	}
	if(dir.res){
		util.mkdir(dir.res, gCompileRoot, true);
		cp.execSync('cp -R '+path.join(gRoot, dir.res,'/')+'* '+path.join(gCompileRoot, dir.res, '/'))
	}
});

var jobs = ['webpack', 'jsCompress', 'cssCompress', 'staticToCdn'];
function executeJob(){
	if(jobs.length>0){
		var jobName = jobs.shift();
		gLog('Newton: 开始执行任务：'+jobName);
		require('./lib/job/'+jobName).run().then(function(data){
			gLog('Newton: 任务执行完成：'+jobName);
			executeJob();
		}, function(data){
			gLog('Newton: 任务执行失败：'+jobName);
			if(data){
				data = typeof data=='string' ? data: JSON.stringify(data);
				gLog.error(data);
			}
		}).catch(function(e){
			gLog('Newton: 任务执行出现意外：'+jobName);
			gLog.error(e.getMessage());
		});
	}else{
		gLog('NT编译完成');
	}
}
executeJob();

