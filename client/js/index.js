// var {BG_COLOUR,PLAYER_COLOUR,CIRCLES_COLOUR} = require('./constantClient');
var BG_COLOUR = '#faebd7';
// var PLAYER_COLOUR = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
var CIRCLES_COLOUR = 'red';
// var {paintGame,drawPlayer,drawCircle} = require("./gameClientSide");
var socket = io();
socket.on("gameStarted", gameStarted);
socket.on('joinResponse', joinResponse);
socket.on('newGameResponse', newGameResponse);
socket.on("winner", winner);
socket.on("start", start);
socket.on("newPositions", newPositions);
socket.on("resetGame", resetGame);

var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = "30px Arial";

var initialScreen = document.getElementById('initialScreen');
var waitingRoom = document.getElementById('waitingRoom');
var winScreen = document.getElementById('winScreen');
var gameCodeDisplay = document.getElementById('gameCodeDisplay');
var joinGameBtn = document.getElementById('joinGameButton');
var newGameBtn = document.getElementById('newGameButton');
var resetBtn = document.getElementById('ResetButton');
var playerUsername = document.getElementById('playerUsername');
var gameCode = document.getElementById('gameCode');
var gameScreen = document.getElementById('gameScreen');


joinGameBtn.onclick = function () {
    socket.emit('join', { password: gameCode.value });
}
newGameBtn.onclick = function () {
    socket.emit('newGame', { password: gameCode.value });
}
resetBtn.onclick = function () {
    socket.emit('reset');
}



function joinResponse(data) {
    if (data.success) {
        initialScreen.style.display = 'none';
        gameScreen.style.display = 'none';
        waitingRoom.style.display = "inline-block";
        waiting.innerHTML = "Waiting for other players, press button if you want to begin";
        newGameBtn.disabled = false;
        joinGameBtn.disabled = true;
    } else
        alert("Please reload the page.");
};

function newGameResponse(data) {
    if (data.success) {
        initialScreen.style.display = 'none';
        gameScreen.style.display = 'none';
        waitingRoom.style.display = "inline-block";
        waiting.innerHTML = "Wait for players or start by pressing button";
        newGameBtn.disabled = true;
        joinGameBtn.disabled = false;
    } else
        alert("Please join with code, Game has been created");
};

socket.on('disableBtn', function (data) {
    newGameBtn.disabled = true;
    joinGameBtn.disabled = false;
    gameCodeDisplay.style.display = "block";
    gameCodeDisplay.innerHTML = "Code : " + data;
});
//game
var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = '30px Arial';

var playerScore = document.getElementById("score");
var playerName = document.getElementById("playerName")

//for know the winner
function winner(data) {
    initialScreen.style.display = "none";
    gameScreen.style.display = "none";
    winScreen.style.display = "block";
    win.innerHTML = "Player " + data + " won";
};

//for know the game has started
function start() {
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";
    waitingRoom.style.display = "none";
};

document.onkeydown = function (event) {
    if (event.keyCode === 68 || event.keyCode === 39)
        //d
        socket.emit("keyPress", { inputId: "right", state: true });
    else if (event.keyCode === 116)
        //d
        window.close();
    else if (event.keyCode === 83 || event.keyCode === 40)
        //s
        socket.emit("keyPress", { inputId: "down", state: true });
    else if (event.keyCode === 81 || event.keyCode === 37)
        //a
        socket.emit("keyPress", { inputId: "left", state: true });
    else if (event.keyCode === 90 || event.keyCode === 38)
        //w
        socket.emit("keyPress", { inputId: "up", state: true });
};

document.onkeyup = function (event) {
    if (event.keyCode === 68 || event.keyCode === 39)
        //d
        socket.emit("keyPress", { inputId: "right", state: false });
    else if (event.keyCode === 83 || event.keyCode === 40)
        //s
        socket.emit("keyPress", { inputId: "down", state: false });
    else if (event.keyCode === 81 || event.keyCode === 37)
        //a
        socket.emit("keyPress", { inputId: "left", state: false });
    else if (event.keyCode === 90 || event.keyCode === 38)
        //w
        socket.emit("keyPress", { inputId: "up", state: false });
};

//reset game after player won
function resetGame() {
    gameCode.value = '';
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
    winScreen.style.display = "none";
    gameCodeDisplay.style.display = "none";
    joinGameBtn.disabled = false;
    newGameBtn.disabled = false;
    window.location.reload(false); //reload page automatically
}

// to know if game has started or not
function gameStarted() {
    waitingRoom.style.display = "inline-block";
    initialScreen.style.display = "none";
    waiting.innerHTML = "The Game has started";

};

//fonction to update player position
function newPositions(data) {
    //clear game screen
    ctx.clearRect(0, 0, 500, 500);

    if (data[0] == null) return;
    //paint game
    for (var i = 0; i < data.length; i++) {

        playerName.innerHTML = data[i].number;
        playerScore.innerHTML = data[i].score;

        //paint circles
        for (var e in data[i].balls) {
            ctx.beginPath();

            ctx.arc(
                data[i].balls[e].x,
                data[i].balls[e].y,
                data[i].balls[e].radius,
                data[i].balls[e].start,
                data[i].balls[e].angle,
                false
            );
            ctx.stroke();
            ctx.fillStyle = CIRCLES_COLOUR;
            ctx.fill();
        }
        //paint Player
        ctx.fillStyle = data[i].color;
        ctx.fillRect(data[i].x, data[i].y, 20, 20);
    }
};