'use strict';
/**
 * webpack执行
 */
const path = require('path');
const cp = require('child_process');
const webpack = require('webpack');
const util = require('../util');
var QueueExcutor = require('./helper/QueueExcutor');

function run(){
	var qe = new QueueExcutor(gConf.app, function(appConf){
		if(!appConf.webpack){
			this.emit('success');
			return;
		}
		//var relativePath = path.join(appConf.res, appConf.webpackConfig||'webpack.config.js');
		var configPath = path.join(gRoot, appConf.webpackConfig||'webpack.config.js');
		if(!util.exist(configPath)){
			gLog.error('webpack的配置文件找不到:'+configPath);
			this.emit('error');
			return;
		}
		var destConfigPath = path.join(gCompileSrcRoot, appConf.webpackConfig||'webpack.config.js');
		cp.execSync('cp '+configPath+' '+ destConfigPath);

		var webpackConfig;
		try{
			webpackConfig = require(destConfigPath);
		}catch(e){
			log.error('加载webpack配置文件失败:\n'+e.message);
			this.emit('error');
			return;
		}
		delete webpackConfig.devtool;
		appConf.webpackConfig = webpackConfig;
		webpackConfig.resolve = webpackConfig.resolve||{};
		webpackConfig.resolve.root = path.join(gCompileSrcRoot, appConf.res);

		webpackConfig.module.loaders.forEach(function(loader){
			if(loader.query && loader.query.presets){
				loader.query.presets = loader.query.presets.map(function(preset){
					return require.resolve('babel-preset-'+preset);
				})
			}
		});
		webpackConfig.resolveLoader = {
			modulesDirectories: [
				__dirname+'/../../node_modules/',
				"web_loaders", "web_modules", "node_loaders", "node_modules"]
		};


		var uglifyjs = new webpack.optimize.UglifyJsPlugin({
		    compress: {
		        warnings: false
		    }
		});
		webpackConfig.plugins = [uglifyjs];
		
		var compiler = webpack(webpackConfig);
		var self = this;
		function compileError(err){
			gLog.error(JSON.stringify(err));
			self.emit('error');
		}

		//util.rm(path.join(gCompileSrcRoot,appConf.res,'js/dist/*'));
		//this.emit('success');return;
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
					self.emit('success');
				}
			}
		});
	});

	return qe.promise;
}
module.exports={
	run: run
}
