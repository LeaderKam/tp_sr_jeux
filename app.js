var PORT = 2000;
var express = require('express');
var app = express();
var server = require('http').Server(app);

//communication with the file
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');

});

// help to have access to all resources in client dir
app.use('/', express.static(__dirname + '/client'));


server.listen(PORT, () => console.log("listening on *:" + PORT));
app.use('/client', express.static(__dirname + '/client'));

console.log("server started")

var DEBUG = true;

var USERS = {
	//username:password
	"bob1":"bob",
	"bob2":"bob",
	"bob3":"bob",	
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



var io = require('socket.io')(server, {});
var SOCKET_LIST = {};
var PLAYER_LIST = {};
var BALLS = {};
var Circle = function (id) {
    var self = {
        id: id,
        x: 10,
        y: 10,
        radius: 10,
        angle: Math.PI * 2,
        start: 0,
    }
    return self;
}

// console.log(new Array(10).fill(10).map( (_, i) => i*10));
var position = new Array(48).fill(1).map((_, i) => i * 10);
var generateBall = function () {

    for (var i = 0; i < 20; i++) {
        var circle = Circle(i);
        circle.x = position[Math.floor(Math.random() * 48)];
        circle.y = position[Math.floor(Math.random() * 48)];
        if (circle.x < 10) {
            circle.x += 10;
        } else if (circle.y < 10) {
            circle.y += 10;
        }
        circle.start = 0;
        BALLS[i] = circle;
    }
    return BALLS;
};
var circles = generateBall();
var Player = function (id) {
    var self = {
        x: 250,
        y: 250,
        id: id,
        number: "" + Math.floor(10 * Math.random()),
        pressingRight: false,
        pressingLeft: false,
        pressingUp: false,
        pressingDown: false,
        maxSpd: 10,
        score:0,
    }
    self.updatePosition = function () {
        if (self.pressingRight)
            self.x += self.maxSpd;
        if (self.pressingLeft)
            self.x -= self.maxSpd;
        if (self.pressingDown)
            self.y += self.maxSpd;
        if (self.pressingUp)
            self.y -= self.maxSpd;
        for (const key in circles) {
            if ((self.x + 10) === circles[key].x && (self.y + 10) === circles[key].y) {
                delete circles[key];
                self.score+=1;
            }
        }

    }
    return self;
}
Player.onConnect = function(socket){
	var player = Player(socket.id);
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		// else if(data.inputId === 'attack')
		// 	player.pressingAttack = data.state;
		// else if(data.inputId === 'mouseAngle')
		// 	player.mouseAngle = data.state;
	});
}
Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
}
io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;


    socket.on('enterInRoom',function(data){
		isGameStarted(data,function(res){
			if(res){
				Player.onConnect(socket);
				socket.emit('signInResponse',{success:true});
			} else {
				socket.emit('signInResponse',{success:false});			
			}
        });
        
        isUsernameTaken(data,function(res){
			if(res){
				socket.emit('enterResponse',{success:false});		
			} else {
				addUser(data,function(){
					socket.emit('enterResponse',{success:true});					
				});
			}
        });		
	});
	// socket.on('newGame',function(data){
	// 	isGame(data,function(res){
	// 		if(res){
	// 			socket.emit('newGameResponse',{success:false});		
	// 		} else {
	// 			newGame(data,function(){
	// 				socket.emit('newGameResponse',{success:true});					
	// 			});
	// 		}
    //     });
       
	// });
	
	
	// socket.on('disconnect',function(){
	// 	delete SOCKET_LIST[socket.id];
	// 	Player.onDisconnect(socket);
    // });
    // Player.onDisconnect = function(socket){
    //     delete Player.list[socket.id];
    // }

    socket.on('newGame',function(data){
        if(data.success){
            console.log("envoie");
            socket.emit('newGameResponse',{success:true});
            console.log("envoyer");
        }
    });
    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id]; //delete the client connection
        delete PLAYER_LIST[socket.id]; //delete the
    });

    socket.on('keyPress', function (data) {
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
        player.updatePosition();
        pack.push({
            x: player.x,
            y: player.y,
            number: player.number,
            score: player.score,
            balls: circles
        });
        WINNER[i]=player.score
    }
    if(Object.keys(circles).length === 18){
        
       for (const key in PLAYER_LIST) {
        
           if (Math.max(...Object.values(WINNER)) === PLAYER_LIST[key].score){
               console.log(PLAYER_LIST[key].number+" win")
               for (var i in SOCKET_LIST) {
                var socket = SOCKET_LIST[i];
                socket.emit('winner', PLAYER_LIST[key].number);
                // socket.emit('winner',winner);
            }
        }
       }
        // var winner=WIN_SCORE(WINNER);
    }
    // console.log(Object.keys(circles).length);
    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions', pack);
        
    }
}, 1000 / 25);