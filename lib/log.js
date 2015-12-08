'use strict';
const fs = require('fs');
const util = require('./util');
const flog={}, validTypes = ['log','warning', 'error'];
var haveError = false;
function log(txt, type){
	if(validTypes.indexOf(type)<0)
		type = 'log';

	//fs.writeFileSync(flog[type], util.now()+': '+txt+'\n', {encoding:'utf8', flag:'a'});
}
log.error = function(txt){
	log(txt, 'error');
	haveError = true;
};
log.warn = function(txt){
	log(txt, 'warning');
};
log.log = log;
log.haveError = function(){
	return haveError;
}

function init(ROOT){
	/*
	validTypes.forEach(function(type){
		var logPath = ROOT+'/'+type+'-newton-log.txt';
		if(util.exist(logPath)){
			util.rm(logPath);
		}
		flog[type] = fs.openSync(logPath, 'a');
	});*/
	return log;
}
module.exports =  init;