'use strict';
/**
 * webpack执行
 */
const path = require('path');
const cp = require('child_process');
const webpack = require('webpack');
const util = require('../util');

function run(){
	var promise = new Promise(function(resolve, reject){
		util.queue(gConf.app, function(app, onsuc, onerr){
			if(!app.webpack){
				onsuc();
				return;
			}
			var relativePath = path.join(app.res, app.webpackConfig||'webpack.config.js');
			var configPath = path.join(gRoot, relativePath);
			if(!util.exist(configPath)){
				gLog.error('webpack的配置文件找不到:'+configPath);
				onerr();
				return;
			}
			var destConfigPath = path.join(gCompileRoot, relativePath);
			cp.execSync('cp '+configPath+' '+ destConfigPath);

			var webpackConfig;
			try{
				webpackConfig = require(destConfigPath);
			}catch(e){
				log.error('webpack执行失败:\n'+e.message);
				reject();
				return;
			}
			delete webpackConfig.devtool;
			webpackConfig.resolve = webpackConfig.resolve||{};
			webpackConfig.resolve.root = path.join(gCompileRoot, gConf.app[0].res);
			webpackConfig.resolveLoader = {
				modulesDirectories: [
					__dirname+'/../../node_modules/',
					"web_loaders", "web_modules", "node_loaders", "node_modules"]
			};

			var compiler = webpack(webpackConfig);
			function compileError(err){
				gLog.error(JSON.stringify(err));
				onerr();
			}
			compiler.run(function(err, stats){
				if(err){
					compileError(err);
				}else{
					var jsonStats = stats.toJson();
					if(jsonStats.errors.length > 0){
						compileError(jsonStats.errors);
					}else{
						if(jsonStats.warnings.length > 0)
							gLog.warn(JSON.stringify(jsonStats.warnings));
						onsuc();
					}
				}
			});
		}, function(){
			resolve();
		}, function(){
			reject();
		});
	});

	return promise;
}
module.exports={
	run: run
}