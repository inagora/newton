'use strict';
const fs = require('fs');
const colors = require('colors');
const util = require('./util');
const flog={}, validTypes = ['log','warn', 'error'];
var haveError = false;

colors.setTheme({
	info: 'green',
	warn: 'yellow',
	error: 'red'
});
function log(txt, type){
	if(validTypes.indexOf(type)<0)
		type = 'log';

	fs.writeFileSync(flog[type], util.now()+': '+txt+'\n', {encoding:'utf8', flag:'a'});
	if(type=="log"){
		console.log(colors.info(txt));
	}else{
		console.log(colors[type](type+' - '+txt));
	}
}
log.error = function(txt){
	log(txt, 'error');
	haveError = true;
};
log.warn = function(txt){
	log(txt, 'warn');
};
log.log = log;
log.haveError = function(){
	return haveError;
}

function init(ROOT){
	validTypes.forEach(function(type){
		var logPath = ROOT+'/'+type+'-newton-log.txt';
		if(util.exist(logPath)){
			util.rm(logPath);
		}
		flog[type] = fs.openSync(logPath, 'a');
	});
	return log;
}
module.exports =  init;
