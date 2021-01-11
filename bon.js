var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server started.");

var SOCKET_LIST = {};

var Entity = function(){
	var self = {
		x:250,
		y:250,
		spdX:0,
		spdY:0,
		id:"",
	}
	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
	}
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	}
	return self;
}

var Player = function(id){
	var self = Entity();
	self.id = id;
	self.number = "" + Math.floor(10 * Math.random());
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.mouseAngle = 0;
	self.maxSpd = 10;
	
	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		super_update();
		
		if(self.pressingAttack){
			self.shootBullet(self.mouseAngle);
		}
	}
	self.shootBullet = function(angle){
		var b = Bullet(self.id,angle);
		b.x = self.x;
		b.y = self.y;
	}
	
	
	self.updateSpd = function(){
		if(self.pressingRight)
			self.spdX = self.maxSpd;
		else if(self.pressingLeft)
			self.spdX = -self.maxSpd;
		else
			self.spdX = 0;
		
		if(self.pressingUp)
			self.spdY = -self.maxSpd;
		else if(self.pressingDown)
			self.spdY = self.maxSpd;
		else
			self.spdY = 0;		
	}
	Player.list[id] = self;
	return self;
}
Player.list = {};
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
		else if(data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
	});
}
Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
}
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push({
			x:player.x,
			y:player.y,
			number:player.number
		});		
	}
	return pack;
}


var Bullet = function(parent,angle){
	var self = Entity();
	self.id = Math.random();
	self.spdX = Math.cos(angle/180*Math.PI) * 10;
	self.spdY = Math.sin(angle/180*Math.PI) * 10;
	self.parent = parent;
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > 100)
			self.toRemove = true;
		super_update();
		
		for(var i in Player.list){
			var p = Player.list[i];
			if(self.getDistance(p) < 32 && self.parent !== p.id){
				//handle collision. ex: hp--;
				self.toRemove = true;
			}
		}
	}
	Bullet.list[self.id] = self;
	return self;
}
Bullet.list = {};

Bullet.update = function(){
	var pack = [];
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		bullet.update();
		if(bullet.toRemove)
			delete Bullet.list[i];
		else
			pack.push({
				x:bullet.x,
				y:bullet.y,
			});		
	}
	return pack;
}

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

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	
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
	
	
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
	socket.on('sendMsgToServer',function(data){
		var playerName = ("" + socket.id).slice(2,7);
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',playerName + ': ' + data);
		}
	});
	
	socket.on('evalServer',function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);		
	});
	
	
	
});

setInterval(function(){
	var pack = {
		player:Player.update(),
		bullet:Bullet.update(),
	}
	
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('newPositions',pack);
	}
},1000/25);




//index.html
<div id="signDiv">
	Username: <input id="signDiv-username" type="text"></input><br>
	Password: <input id="signDiv-password" type="password"></input>
	<button id="signDiv-signIn">Sign In</button>
	<button id="signDiv-signUp">Sign Up</button>
</div>

<div id="gameDiv" style="display:none;">
	<canvas id="ctx" width="500" height="500" style="border:1px solid #000000;"></canvas>

	<div id="chat-text" style="width:500px;height:100px;overflow-y:scroll">
		<div>Hello!</div>
	</div>

	<form id="chat-form">
		<input id="chat-input" type="text" style="width:500px"></input>
	</form>
</div>

<script src="https://cdn.socket.io/socket.io-1.4.5.js"></script>
<script>
	var socket = io();
	
	//sign
	var signDiv = document.getElementById('signDiv');
	var signDivUsername = document.getElementById('signDiv-username');
	var signDivSignIn = document.getElementById('signDiv-signIn');
	var signDivSignUp = document.getElementById('signDiv-signUp');
	var signDivPassword = document.getElementById('signDiv-password');
	
	signDivSignIn.onclick = function(){
		socket.emit('signIn',{username:signDivUsername.value,password:signDivPassword.value});
	}
	signDivSignUp.onclick = function(){
		socket.emit('signUp',{username:signDivUsername.value,password:signDivPassword.value});
	}
	socket.on('signInResponse',function(data){
		if(data.success){
			signDiv.style.display = 'none';
			gameDiv.style.display = 'inline-block';
		} else
			alert("Sign in unsuccessul.");
	});
	socket.on('signUpResponse',function(data){
		if(data.success){
			alert("Sign up successul.");
		} else
			alert("Sign up unsuccessul.");
	});

	//game
	var chatText = document.getElementById('chat-text');
	var chatInput = document.getElementById('chat-input');
	var chatForm = document.getElementById('chat-form');
	var ctx = document.getElementById("ctx").getContext("2d");
	ctx.font = '30px Arial';
	
		
	socket.on('newPositions',function(data){
		ctx.clearRect(0,0,500,500);
		for(var i = 0 ; i < data.player.length; i++)
			ctx.fillText(data.player[i].number,data.player[i].x,data.player[i].y);		
			
		for(var i = 0 ; i < data.bullet.length; i++)
			ctx.fillRect(data.bullet[i].x-5,data.bullet[i].y-5,10,10);		
	});
	
	socket.on('addToChat',function(data){
		chatText.innerHTML += '<div>' + data + '</div>';
	});
	socket.on('evalAnswer',function(data){
		console.log(data);
	});
	
	
	chatForm.onsubmit = function(e){
		e.preventDefault();
		if(chatInput.value[0] === '/')
			socket.emit('evalServer',chatInput.value.slice(1));
		else
			socket.emit('sendMsgToServer',chatInput.value);
		chatInput.value = '';		
	}
	
	document.onkeydown = function(event){
		if(event.keyCode === 68)	//d
			socket.emit('keyPress',{inputId:'right',state:true});
		else if(event.keyCode === 83)	//s
			socket.emit('keyPress',{inputId:'down',state:true});
		else if(event.keyCode === 65) //a
			socket.emit('keyPress',{inputId:'left',state:true});
		else if(event.keyCode === 87) // w
			socket.emit('keyPress',{inputId:'up',state:true});
			
	}
	document.onkeyup = function(event){
		if(event.keyCode === 68)	//d
			socket.emit('keyPress',{inputId:'right',state:false});
		else if(event.keyCode === 83)	//s
			socket.emit('keyPress',{inputId:'down',state:false});
		else if(event.keyCode === 65) //a
			socket.emit('keyPress',{inputId:'left',state:false});
		else if(event.keyCode === 87) // w
			socket.emit('keyPress',{inputId:'up',state:false});
	}
	
	document.onmousedown = function(event){
		socket.emit('keyPress',{inputId:'attack',state:true});
	}
	document.onmouseup = function(event){
		socket.emit('keyPress',{inputId:'attack',state:false});
	}
	document.onmousemove = function(event){
		var x = -250 + event.clientX - 8;
		var y = -250 + event.clientY - 8;
		var angle = Math.atan2(y,x) / Math.PI * 180;
		socket.emit('keyPress',{inputId:'mouseAngle',state:angle});
	}
	
	
	
	
</script>