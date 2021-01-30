var isValidCode = function(data,code,cb){
	setTimeout(function(){
        cb(data.password===code+'');
	},10);
}

module.exports= isValidCode;