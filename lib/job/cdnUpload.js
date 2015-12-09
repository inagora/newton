"use strict";
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
var QueueExcutor = require('./helper/QueueExcutor');
function run(){
	var qe = new QueueExcutor(gConf.app, function(appConf){
		if(!appConf.staticToCdn) {
			this.emit('success');
			return;
		}
		if(!appConf.cdnServer){
			gLog.warn('没有设置文件上传服务器');
			this.emit('success');
			return;
		}
		var cdnServer = appConf.cdnServer;
		if(!Array.isArray(cdnServer)) cdnServer = [cdnServer];
		var files = fs.readdirSync(gCdnRoot);
		if(!files || files.length<=0){

			this.emit('success');
		}
		else{
			var cmds = cdnServer.map(function(cdn){
				return 'scp -r '+gCdnRoot+'/* '+path.join(cdn,'/');
			});
			var self = this;
			var ls = cp.exec(
				(gCompileType=="online" ? "" :'sudo su - sync360 -c "')
	            +(cmds.join(';'))
				+(gCompileType=="online" ? '' :'"'),
	            function(error, stdout, stderr){
	                if(error !== null){
	                    gLog.error('scp.error: '+error);
	                    
						self.emit('error');
	                }else{
	                    
						self.emit('success');
	                }
	        });
		}
	});

	return qe.promise;
}


module.exports = {
	run: run
}
