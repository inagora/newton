"use strict";
const cp = require('child_process');
const path = require('path');
const fs = require('fs');

var QueueExcutor = require('./helper/QueueExcutor');
function run(){
    return new Promise(function(resolve, reject){
        var qe = new QueueExcutor(gConf.app, function(appConf){
            fs.writeFileSync(path.join(gBuildDir,appConf.project+'_cdn_cache.json'), JSON.stringify(appConf.cdnCache), {encoding:'utf8'});

            this.emit('success');
        });
        qe.promise.then(function(){
            var ls = cp.exec(
                'cp -r '+path.join(gCompileSrcRoot,'/')+'* '+path.join(gRoot,'/output/'),
                function(error, stdout, stderr){
                    if(error !== null){
                        gLog.error(error);
                        reject();
                    }else{
                        resolve();
                    }
            });
        });
    });
}

module.exports = {
	run : run
}
