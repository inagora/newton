"use strict";
const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const util = require('../../util');

const REG_REMOTE = /^https?:\/\//i;
//文件上cdn之前的处理
function precdn(url, appConf){
	var relativeTo = appConf.relativeTo,
		startIndex = relativeTo.length;

	url = url.trim();
	//初步检查
	if(REG_REMOTE.test(url)) return false;
	if(url.indexOf(relativeTo)!=0) return false;

	var pathInfo = path.parse(url),
		//防止文件地址后带参数或者hash，以后可以md5后给补上, todo
		ext = pathInfo.ext.split('?')[0].split('#')[0];
	url = pathInfo.dir+'/'+pathInfo.name+ext;
	
	var relativePath = url.substring(startIndex);
	var realPath = path.join(gCompileSrcRoot, appConf.res, relativePath);

	if(!util.exist(realPath)){
		gLog.warn('文件不存在却被引用：'+url);
		return false;
	}
	var md5 = util.md5(realPath),
		cdnCache = appConf.cdnCache;
	if(cdnCache[relativePath] && cdnCache[relativePath].md5==md5)
		return cdnCache[relativePath];

	var nocache = md5.substr(-6),
		cdnRelativePath = path.join(
			appConf.project,
			pathInfo.dir.substring(startIndex), 
			pathInfo.name.replace(/[^0-9a-z\-_\.]/g, '')
				+'_'
				+nocache
				+ext
		),
		destFile = path.join(gCdnRoot, cdnRelativePath);

	util.mkdir(pathInfo.dir.substring(startIndex), path.join(gCdnRoot, appConf.project));
	cp.execSync(
		'cp '
		+realPath
		+' '
		+destFile
	);

	var cdnInfo = {
		md5: md5,
		cdnPath: appConf.cdnDomain + path.join('/', cdnRelativePath)
	};
	cdnCache[relativePath] = cdnInfo;
	return cdnInfo;
}
module.exports = function(detectRegexp, files, appConf){
	for(let file of files){
		let content = fs.readFileSync(file, {encoding:'utf8'});
		var changed = false;
		content = content.replace(detectRegexp, function(_$, _$1, _$2, _$3){
			var ret = precdn(_$2, appConf);
			if(ret){
				changed = true;
				return _$1+ret.cdnPath+_$3; 
			}else
				return _$;
		});
		if(changed){
			fs.writeFileSync(file, content, {encoding:'utf8'});
		}
	}
};
