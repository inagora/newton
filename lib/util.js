'use strict';
const fs = require('fs');
const cp = require('child_process');
const path = require('path');
module.exports={
	exist: function(path){
		try{
			var stats = fs.statSync(path);
		}catch(e){
			return false;
		}
		return (stats.isFile() 
			|| stats.isDirectory() 
			|| stats.isBlockDevice()
			|| stats.isCharacterDevice()
			|| stats.isFIFO()
			|| stats.isSocket()
			|| false)
	},
	rm: function(path){
		cp.execSync('rm -rf '+path);
	},
	extend: function(dest, source, force){
		force = force===false ? false: true;
		for(var key in source){
			if(force || !dest.hasOwnProperty(key)){
				dest[key] = source[key];
			}
		}
		return dest;
	},
	now: function(separator){
		var curtime = new Date();
		var timeStr = [
			curtime.getFullYear(),
			separator||'-', curtime.getMonth()+1,
			separator||'-', curtime.getDate(),
			separator||' ', curtime.getHours(),
			separator||':', curtime.getMinutes(),
			separator||':', curtime.getSeconds()
		].join('');

		return timeStr;
	},
	mkdir: function(dir, root, rmonexist){
		var type = typeof root;
		if(type=='boolean'){
			rmonexist = root;
			root = '';
		}else{
			root = root||'';
			rmonexist = !!rmonexist;
		}
		if(root && !this.exist(root)){
			return false;
		}

		dir = dir.trim();
		var destDir = path.join(root, dir);
		if(rmonexist && this.exist(destDir)){
			this.rm(destDir);
		}
		
		dir = dir.replace(/^\/|\/$/g,'');
		var folderNames = dir.split('/');
		var tmpPath='';
		var self = this;
		folderNames.forEach(function(folderName){
			tmpPath += '/'+folderName;
			let _mkdir=path.join(root, tmpPath);
			if(!self.exist(_mkdir)){
				fs.mkdirSync(_mkdir);
			}
		});
		return true;
	}
};