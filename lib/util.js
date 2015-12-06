'use strict';
const fs = require('fs');
const cp = require('child_process');
const path = require('path');

function findFilesRecursive(dir, type, level){
    var stats = fs.statSync(dir);
    if(stats.isFile()){
        if(type=="*")
            return [dir];

        var extname = path.extname(dir);
        if(extname.length>0)
            extname = extname.substring(1);
        if(typeof(type)=="string" && extname==type){
            return [dir];
        }
        if(Array.isArray(type) && type.indexOf(extname)>=0)
            return [dir];
        return [];

    }else if(stats.isDirectory()){
        if(level<1){
            return [];
        }
        var list = [];
        fs.readdirSync(dir).forEach(function(name){
            list = list.concat(findFilesRecursive(path.join(dir,name), type, --level));
        });
        return list;
    }else{
        return [];
    }

}
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
		var pattern = "yyyy"
			+(separator||'-')+'MM'
			+(separator||'-')+'dd'
			+(separator||' ')+'hh'
			+(separator||':')+'mm'
			+(separator||':')+'ss';
		return this.dateFormat(new Date(), pattern);
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
	},
	findFiles: function(root, type, maxLevel){
		if(!root) return [];
		if(typeof maxLevel!="number") maxLevel=10;
		if(typeof type!='string' && !Array.isArray(type)) type="*";
		return findFilesRecursive(root, type, maxLevel);
	},
	dateFormat: function(d, pattern) {
		pattern = pattern || 'yyyy-MM-dd';
		var y = d.getFullYear().toString(),
			o = {
				M: d.getMonth() + 1, //month
				d: d.getDate(), //day
				h: d.getHours(), //hour
				m: d.getMinutes(), //minute
				s: d.getSeconds() //second
			};
		pattern = pattern.replace(/(y+)/ig, function(a, b) {
			return y.substr(4 - Math.min(4, b.length));
		});
		for (var i in o) {
			pattern = pattern.replace(new RegExp('(' + i + '+)', 'g'), function(a, b) {
				return (o[i] < 10 && b.length > 1) ? '0' + o[i] : o[i];
			});
		}
		return pattern;
	},
	timeFormat: function(msTime){
		var standard = {
			ms: 1,
			s : 1000,
			m : 1000*60,
			h : 1000*60*60
		};
		var desc = ['h','m','s', 'ms'].map(function(std){
			if(msTime>standard[std]){
				var count = Math.floor(msTime/standard[std]);
				msTime = msTime%standard[std];
				return count+std;
			}else{
				return '';
			}
		});
		return desc.join('');
	},
	md5: function(file){
		var crypto = require('crypto');
		var fs = require('fs');
		var sum = crypto.createHash('md5');
		sum.update(fs.readFileSync(file))
    	return sum.digest('hex');
	}
};