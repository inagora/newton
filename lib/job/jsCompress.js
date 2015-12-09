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
		var jses=util.findFiles(path.join(gCompileSrcRoot, appConf.res, 'js'), "js");
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
