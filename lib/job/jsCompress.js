'use strict';
const fs = require('fs');
const path = require('path');
const UglifyJS = require("uglify-js");
const util = require('../util');
var QueueExcutor = require('./helper/QueueExcutor');
function run(){
	var qe = new QueueExcutor(gConf.app, function(appConf){
		if(!appConf.jsCompress) {
			this.emit('success');
			return;
		}
		
		//webpack的编辑输入目录不压缩，因为要用sourcemap，防止压缩后sourcemap对不上
		var jses=util.findFiles(path.join(gCompileSrcRoot, appConf.res, 'js'), "js");
		jses = jses.concat(util.findFiles(path.join(gCompileSrcRoot, appConf.res, 'module'), "js"));
		//jses = ['/Users/liupengke/newton_build/asgard-2015-12-10-19-42-53/src/app/h5/www/resource/js/activity/invite1212.js'];
		if(appConf.webpack 
			&& appConf.webpackConfig
			&& appConf.webpackConfig.output
			&& appConf.webpackConfig.output.path){
			let outputPath = appConf.webpackConfig.output.path;
			
			for(let i=jses.length-1;i>=0;i--){
				if(jses[i].startsWith(outputPath))
					jses.splice(i,1);
			}
		}

		//注意，如果js文件预计是需要经过webpack编译才能用的，
		//js后缀建议改为wp.js，比如cart.js，改为cart.wp.js，
		//否则一些react的语法或者es2015和es2016的语法，可能会出问题
		for(let i=jses.length-1;i>=0;i--){
			if(jses[i].endsWith('.wp.js'))
				jses.splice(i,1);
		}

		for(let file of jses){
			try{
				var result = UglifyJS.minify(file);
				fs.writeFileSync(file, result.code,{encoding:'utf8'});
			}catch(e){
				gLog.error('uglify压缩js文件失败：'+file);
				gLog.error(e.message);
				this.emit('error');
				return;
			}
		}
		this.emit('success');
	});

	return qe.promise;
}
module.exports = {
	run: run
}
