'use strict';
const path = require('path');
const util = require('../util');
const static2cdn = require('./helper/static2cdn');
var QueueExcutor = require('./helper/QueueExcutor');
function run(){
	var qe = new QueueExcutor(gConf.app, function(appConf){
		if(!appConf.staticToCdn) {
			this.emit('success');
			return;
		}
		if(!appConf.cdnDomain){
			gLog.warn('没有设置cdn域名');
			this.emit('success');
			return;
		}
		var REG_CSS = 
			/(<link\b[^>]+?\bhref=")([^"]+)("[^>]*?\/?>)/gi;
		var tplFiles = util.findFiles(
			path.join(gCompileSrcRoot, appConf.tpl), 
			appConf.tplExt
			);

		static2cdn(REG_CSS, tplFiles, appConf);
		this.emit('success');
	});

	return qe.promise;
}
module.exports = {
	run: run
}