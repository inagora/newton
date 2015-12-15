'use strict';
const fs = require('fs');
const path = require('path');
const CleanCss = require("clean-css");
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const util = require('../util');
var QueueExcutor = require('./helper/QueueExcutor');
function run(){
	var qe = new QueueExcutor(gConf.app, function(appConf){
		if(!appConf.autoPrefix) {
			this.emit('success');
			return;
		}
		var csses=util.findFiles(path.join(gCompileSrcRoot, appConf.res, 'css'), "css");
		for(let file of csses){
			try{
				var styles = fs.readFileSync(file,{encoding:'utf8'});
				fs.writeFileSync(
					file, 
					postcss([autoprefixer]).process(styles).css,
					{encoding:'utf8'}
				);	
			}catch(e){
				gLog.error('css prefix自动添加失败失败：'+file);
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