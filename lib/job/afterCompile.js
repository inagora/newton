"use strict";
const cp = require('child_process');
const path = require('path');
const fs = require('fs');

function run () {
	return new Promise(function(resolve, reject){
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
}

module.exports = {
	run : run
}
