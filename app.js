var PORT = 2000;
var express = require('express');
var {Circle,Player,verifyWin,generateBall} = require('./server/constants');
var {isValidPassword, isUsernameTaken, addUser} = require('./server/connection');
var app = express();
var server = require('http').Server(app);

//communication with the file
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');

});

// help to have access to all resources in client dir in root "/"
app.use('/', express.static(__dirname + '/client'));


server.listen(process.env.PORT || PORT, () => console.log("listening on *:" + PORT));
// app.use('/client', express.static(__dirname + '/client'));

console.log("server started")

var DEBUG = true;


var io = require('socket.io')(server, {});
var SOCKET_LIST = {};
var PLAYER_LIST = {};
var BALLS = {};

var circles = generateBall(BALLS);
Player.onConnect = function(socket){
	var player = new Player(socket.id);
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		
	});
}

Player.onDisconnect = function(socket){
	// delete Player.list[socket.id];
	delete PLAYER_LIST[socket.id];
}

io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    var player = new Player(socket.id);
    PLAYER_LIST[socket.id] = player;

    socket.on('signIn',function(data){
		isValidPassword(data,function(res){
			if(res){
				Player.onConnect(socket);
				socket.emit('signInResponse',{success:true});
			} else {
				socket.emit('signInResponse',{success:false});
			}
		});
	});
	socket.on('signUp',function(data){
		isUsernameTaken(data,function(res){
			if(res){
				socket.emit('signUpResponse',{success:false});		
			} else {
				addUser(data,function(){
					socket.emit('signUpResponse',{success:true});					
				});
			}
		});
	});
 
    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id]; //delete the client connection
        delete PLAYER_LIST[socket.id];
        // Player.onDisconnect(socket.id); //delete the
    });

    socket.on('keyPress', function (data) {
        socket.emit("start");
        if (data.inputId === 'left')
            player.pressingLeft = data.state
        if (data.inputId === 'right')
            player.pressingRight = data.state
        if (data.inputId === 'up')
            player.pressingUp = data.state
        if (data.inputId === 'down')
            player.pressingDown = data.state
    });
})
var WINNER={}

setInterval(function () {
    var pack = [];
    
    for (var i in PLAYER_LIST) {
        var player = PLAYER_LIST[i];
        player.updatePosition(circles);
        player.updateState(WINNER,circles,pack,i);
    }
    verifyWin(circles, WINNER, PLAYER_LIST,SOCKET_LIST,pack);
    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions', pack);
    }
}, 1000 / 25);