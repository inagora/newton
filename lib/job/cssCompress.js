'use strict';
const fs = require('fs');
const path = require('path');
const CleanCss = require("clean-css");
const util = require('../util');
var QueueExcutor = require('./helper/QueueExcutor');
function run(){
	var qe = new QueueExcutor(gConf.app, function(appConf){
		if(!appConf.cssCompress) {
			this.emit('success');
			return;
		}
		var csses=util.findFiles(path.join(gCompileSrcRoot, appConf.res, 'css'), "css");

		for(let file of csses){
			try{
				var styles = fs.readFileSync(file,{encoding:'utf8'});
				var res = new CleanCss({
					root: path.join(gCompileSrcRoot, appConf.res),
					relativeTo: path.dirname(file)
				}).minify(styles);
				if(res.errors.length>0){
					gLog.error('clean-css压缩css文件失败：'+file);
					gLog.error('失败原因：'+res.errors.join('\n'));
					this.emit('error');
					return;
				}
				if(res.warnings.length>0){
					gLog.error('clean-css压缩css文件：'+file);
					gLog.error('clean-css wanings：'+res.warnings.join('\n'));
				}
				fs.writeFileSync(file, res.styles,{encoding:'utf8'});
				
			}catch(e){
				gLog.error('clean-css压缩css文件失败：'+file);
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