module.exports = {
	run: function(){
		var promise = new Promise(function(resolve, reject){
			resolve();
		});
		return promise;
	}
}