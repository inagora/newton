"use strict";
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
				return 'scp -r '+gCdnRoot+'/ '+path.join(cdn,'/');
			});

			var ls = cp.exec(
	            'sudo su - sync360 -c "'
	            +(cmds.join(';'))+'"',
	            function(error, stdout, stderr){
	                if(error !== null){
	                    gLog.error('scp.error: '+error);
	                    
						this.emit('error');
	                }else{
	                    
						this.emit('success');
	                    resolve();
	                }
	        });
		}
	});

	return qe.promise;
}


module.exports = {
	run: run
}
