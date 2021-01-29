var USERS = {
	//username:code
	"test":"test",

}

var isValidPassword = function(data,cb){
	setTimeout(function(){
        cb(USERS[data.username] === data.password);
	},10);
}
var isUsernameTaken = function(data,cb){
	setTimeout(function(){
		cb(USERS[data.username]);
	},10);
}
var addUser = function(data,cb){
	setTimeout(function(){
		USERS[data.username] = data.password;
		cb();
	},10);
}

module.exports={
    isValidPassword,
    isUsernameTaken,
    addUser
}