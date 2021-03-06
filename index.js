'use strict';
/**
 * Newton build on nodejs 5.1.0
 */
const process = require('process');
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('./lib/util');

/**
 * 全局环境和变量初始化
 */
global.gRoot = process.argv[2];
global.gCompileType = process.argv.length>=3 ? process.argv[3] : 'normal';
global.gOutput = gRoot+'/output';
//通过错误文件形式标记错误
function markError(){
	let fd = fs.openSync(path.join(gRoot,'newton-error-log'), 'w');
	fs.closeSync(fd);
}

if(!gRoot){
	console.log('源代码路径：'+gRoot+'不存在！');
	markError();
	return;
}
util.mkdir(gOutput, true);

var conf;
try{
	conf = require(gRoot+'/newton.config.json');
}catch(e){
	console.error(e.message);
	markError();
	return 1;
}
global.gConf = util.extend(require('./lib/default-config.json'), conf);
if(!Array.isArray(gConf.app))
	gConf.app = [gConf.app];

const USER_HOME = process.env.HOME;
global.gBuildDir = path.join(USER_HOME, '/newton_build');
global.gCompileRoot = path.join( gBuildDir, gConf.project+'-'+util.now('-'));
global.gCompileSrcRoot = path.join(global.gCompileRoot, 'src');
util.mkdir(gCompileSrcRoot, true);
global.gCdnRoot = path.join(global.gCompileRoot, 'cdn');
util.mkdir(gCdnRoot, true);
global.gLog = require('./lib/log')(gCompileRoot);

/**
 * 拷贝文件到/tmp/newton/{project}/src下，准备编译
 */
if(gConf.app.length<=0){
	gLog.warning('因为没有配置应用,直接通出');
	return;
}
gConf.app.forEach(function(appConf){
	appConf = util.extend(appConf, gConf, false);
	if(appConf.tpl){
		util.mkdir(appConf.tpl, gCompileSrcRoot, true);
		cp.execSync(
			'cp -R '
			+path.join(gRoot, appConf.tpl,'/')
			+'* '
			+path.join(gCompileSrcRoot, appConf.tpl, '/')
		)
	}
	if(appConf.res){
		util.mkdir(appConf.res, gCompileSrcRoot, true);
		cp.execSync(
			'cp -R '
			+path.join(gRoot, appConf.res,'/')
			+'* '
			+path.join(gCompileSrcRoot, appConf.res, '/')
		)
	}
	util.mkdir(appConf.project, gCdnRoot);
	if(appConf.cdnCache){
		try{
			var cacheStr = fs.readFileSync(path.join(gBuildDir,appConf.project+'_cdn_cache.json'),{encoding:'utf8'});
			appConf.cdnCache = JSON.parse(cacheStr);
		}catch(e){
			gLog.warn('读取cdn上线缓存失败');
			appConf.cdnCache = {};
		}
	}else
		appConf.cdnCache = {};
	if(appConf.cdnDomain){
		var domain = appConf.cdnDomain;
		if(!/^http/.test(domain)){
			domain = 'http://'+domain;
		}
		domain = domain.replace(/\/+$/,'');
		appConf.cdnDomain = domain;
	}
	if(appConf.relativeTo)
		appConf.relativeTo = path.join('/', appConf.relativeTo, '/');
});

/**
 * 执行各个编译任务
 */
gLog.log('=============== Newton编译系统 ============');
var jobs = [
	'img2cdn',
	'webpack',
	'jsCompress',
	'cssPrefix',
	'cssCompress', 
	'js2cdn',
	'css2cdn',
	'cdnUpload',
	'afterCompile'
];
var jobName,
	startTime;
function executeJob(){
	if(jobs.length>0){
		try{
			jobName = jobs.shift();
			gLog('开始执行任务 - '+jobName);
			startTime = new Date();
			require('./lib/job/'+jobName).run().then(function(data){
				gLog('任务执行完成 - '+jobName+', 共耗时：'+util.timeFormat(new Date - startTime));
				executeJob();
			}, function(data){
				gLog.error('任务执行失败 - '+jobName);
				if(data){
					data = typeof data=='string' ? data: JSON.stringify(data);
					gLog.error(data);
					markError();
				}
			}).catch(function(e){
				gLog.error('任务执行出现意外 - '+jobName);
				gLog.error(e.message);
				markError();
			});
		}catch(e){
			gLog.error(e.message);
			markError();
		}
	}else{
		gLog.log('=============== Newton编译完成 ============');
		checkExecuteError();
	}
}
function checkExecuteError(){
	if(gLog.haveError()){
		markError();
	}
}
executeJob();

