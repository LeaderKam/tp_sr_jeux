var PORT = 2000;
var express = require('express');
var { Circle, Player, verifyWin, generateBall, sendDataToClient, updateClientFrame } = require('./server/constants');
var { isValidPassword, isUsernameTaken, addUser } = require('./server/connection');
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


var io = require('socket.io')(server, {});
var SOCKET_LIST = {};
var PLAYER_LIST = {};
var circles = {};
var BALLS = {};
var code = 0;
newGameDisableBtn = false;
var gameActive = false; //to know if game has started
var initialized = false; //to know if new game is created
// function newGame(){
//     SOCKET_LIST = {};
//     PLAYER_LIST = {};
//     circles = generateBall(BALLS);
// }

// newGame();
Player.onConnect = function (socket) {
    var player = new Player(socket.id);
    socket.on('keyPress', function (data) {
        if (data.inputId === 'left')
            player.pressingLeft = data.state;
        else if (data.inputId === 'right')
            player.pressingRight = data.state;
        else if (data.inputId === 'up')
            player.pressingUp = data.state;
        else if (data.inputId === 'down')
            player.pressingDown = data.state;

    });
}

Player.onDisconnect = function (socket) {
    // delete Player.list[socket.id];
    delete PLAYER_LIST[socket.id];
}

io.sockets.on('connection', function (socket) {

    if (gameActive) {
        socket.emit("gameStarted");
        return;
    };
    if (newGameDisableBtn) {
        socket.emit('disableBtn', code);
    }

    //client number and new Player or client creation
    socket.id = Math.random();
    var PLAYER_COLOUR = (Math.random() * 0xFFFFFF << 0).toString(16);
    var player = new Player(socket.id);
    player.color = player.color + PLAYER_COLOUR;

    SOCKET_LIST[socket.id] = socket;
                
    socket.on('join', function (data) {
        
        isValidPassword(data, code, function (res) {
            if (res) {
                PLAYER_LIST[socket.id] = player;
                
                
                Player.onConnect(socket);
                socket.emit('joinResponse', { success: true });

            } else {
                socket.emit('joinResponse', { success: false });
            }
        });
    });
    socket.on('newGame', function (data) {
        
        if (initialized) {socket.emit('newGameResponse', { success: false }); return;}
        initGame(socket, player);
        Player.onConnect(socket);
        newGameDisableBtn = true;
        // for (var i in SOCKET_LIST) {
        //     var socket = SOCKET_LIST[i];
        //     // socket.emit('newGameResponse', { success: true });
        // }
        
        socket.emit('newGameResponse', { success: true });
    });
    socket.on('reset', function (data) {
        // newGame();
        
        newGameDisableBtn = false;
        gameActive = false;
        initialized = false;
        for (var i in SOCKET_LIST) {
            var socket = SOCKET_LIST[i];
            socket.emit('resetGame');
        }
        // PLAYER_LIST = {};
        // SOCKET_LIST = {};
        // WINNER={};
    });

    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id]; //delete the client connection
        delete PLAYER_LIST[socket.id];
        console.log(Object.keys(SOCKET_LIST).length);
        // Player.onDisconnect(socket.id); //delete the
    });

    socket.on('keyPress', function (data) {
        for (var i in SOCKET_LIST) {
            var socket = SOCKET_LIST[i];
            socket.emit("start");
        }

        gameActive = true;
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
function reset() {

}
function initGame(socket, player) {

    circles = generateBall(BALLS);

    SOCKET_LIST[socket.id] = socket;

    console.log(Object.keys(SOCKET_LIST).length);
    PLAYER_LIST[socket.id] = player;
    initialized = true;
    code = Math.floor(Math.random() * 10);
}

var WINNER = {}

setInterval(function () {
    var pack = [];
    updateClientFrame(PLAYER_LIST, WINNER, circles, pack);
    if (Object.keys(SOCKET_LIST).length === 0) {
        gameActive = false;
        newGameDisableBtn=false;
        initialized=false;
    };
    console.log(Object.keys(SOCKET_LIST).length);
    console.log(Object.keys(PLAYER_LIST).length);
    if (verifyWin(circles, WINNER, PLAYER_LIST, SOCKET_LIST, pack)) return;
    sendDataToClient(SOCKET_LIST, pack);
}, 1000 / 25);