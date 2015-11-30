'use strict';
const fs = require('fs');
const util = require('./util');
const flog={}, validTypes = ['log','warning', 'error'];

function log(txt, type){
	if(validTypes.indexOf(type)<0)
		type = 'log';

	fs.writeFileSync(flog[type], util.now()+': '+txt+'\n', {encoding:'utf8', flag:'a'});
}
log.error = function(txt){
	log(txt, 'error');
};
log.warning = function(txt){
	log(txt, 'warning');
};
log.log = log;

function init(ROOT){
	validTypes.forEach(function(type){
		var logPath = ROOT+'/newton-log-'+type+'.txt';
		if(util.exist(logPath)){
			util.rm(logPath);
		}
		flog[type] = fs.openSync(logPath, 'a');
	});
	return log;
}
module.exports =  init;