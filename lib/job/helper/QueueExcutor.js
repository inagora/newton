"use strict";
const EventEmitter = require('events');
class QueueExcutor extends EventEmitter{
	constructor(queueArr, stepHandle){
		super();
		this.queue = queueArr.slice(0);
		this.count = this.queue.length;
		this.index = 0;
		this.stepHandle = stepHandle.bind(this);
		var self = this;
		this.promise = new Promise(function(resolve, reject){
			self.resolve = resolve;
			self.reject = reject;
		});

		this.on('success', function(){
			this.index++;
			this._wrap();
		});
		this.on('error', function(){
			this.reject();
		});

		this._wrap();
	}

	_wrap(){
		if(this.index < this.count){
			var item = this.queue[this.index];
			this.stepHandle(item, this.index);
		}else{
			this.resolve();
		}
	}
}
module.exports = QueueExcutor;