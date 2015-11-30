'use strict';
/**
 * webpack执行
 */
const webpack = require('webpack');

function run(){
	var promise = new Promise(function(resolve, reject){
		var dir = gConf.dirs[0];
		var webpackConfig;
		try{
			webpackConfig = require(path.join(gRoot,dir.webpackConfig));
		}catch(e){
			log.error('webpack执行失败:\n'+e.message);
			reject();
			return;
		}
		delete webpackConfig.devtool;
		webpackConfig.resolveLoader = {
			modulesDirectories: [
				__dirname+'/../node_modules/',
				"web_loaders", "web_modules", "node_loaders", "node_modules"]
		};
		var compiler = webpack(webpackConfig);
		function compileError(err){
			console.log(err);
			//gLog.error(JSON.stringify(err));
			reject();
		}
		compiler.run(function(err, stats){
			console.log(err);
			console.log(stats);
			if(err){
		        compileError(err);
			}else{
			    var jsonStats = stats.toJson();
			    if(jsonStats.errors.length > 0){
			        compileError(jsonStats.errors);
			    }else{
					if(jsonStats.warnings.length > 0)
			        	gLog.warning(JSON.stringify(jsonStats.warnings));
				    resolve();
				}
			}
		});
	});

	return promise;
}
module.exports={
	run: run
}