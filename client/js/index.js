// var {BG_COLOUR, PLAYER_COLOUR, CIRCLES_COLOUR} = require('./constantClient');
// var {BG_COLOUR,PLAYER_COLOUR,CIRCLES_COLOUR} = require('./constantClient');
var BG_COLOUR = '#faebd7';
var PLAYER_COLOUR = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
var CIRCLES_COLOUR = 'red';
// var {paintGame,drawPlayer,drawCircle} = require("./gameClientSide");
// socket.on('init', handleInit);
// socket.on('gameState', handleGameState);
// socket.on('gameOver', handleGameOver);
// socket.on('gameCode', handleGameCode);
// socket.on('unknownCode', handleUnknownCode);
// socket.on('tooManyPlayers', handleTooManyPlayers);
// socket.on('newPosition', handleTooManyPlayers);

// const gameScreen = document.getElementById('gameScreen');
// const initialScreen = document.getElementById('initialScreen');
// const newGameBtn = document.getElementById('newGameButton');
// const joinGameBtn = document.getElementById('joinGameButton');
// const gameCodeInput = document.getElementById('gameCodeInput');
// const gameCodeDisplay = document.getElementById('gameCodeDisplay');

// newGameBtn.addEventListener('click', newGame);
// joinGameBtn.addEventListener('click', joinGame);
// window.onbeforeunload = function () {return false;}

var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = "30px Arial";

var socket = io();
// var happy= function(){socket.emit('happy',{
//     reason:'from client'+random
// });
// }

//sign
var initialScreen = document.getElementById('initialScreen');
var roomStandDiv = document.getElementById('roomStandDiv');
var winDiv = document.getElementById('winDiv');
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
        initialScreen.style.display = 'none';
        gameScreen.style.display = 'none';
        roomStandDiv.style.display="inline-block";
        roomStand.innerHTML= "Attente d'autre joyeur";
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
var ctx = document.getElementById("ctx").getContext("2d");
ctx.font = '30px Arial';

// var signDiv = document.getElementById("signDiv");
// var joinPlayerNameInput = document.getElementById("joinPlayerNameInput");
// var enterRoomBtn = document.getElementById("enterRoomBtn");
// var newGameBtn = document.getElementById("newGameBtn");
// var joinGameCodeInput = document.getElementById("joinGameCodeInput");
var playerScore = document.getElementById("score");
var playerName = document.getElementById("playerName")

// enterRoomBtn.onclick = function () {
//     socket.emit("joinGame", {
//         username: signDivUsername.value,
//         password: signDivPassword.value,
//     });
// };
// newGameBtn.onclick = function () {
//     socket.emit("newGame", {
//         username: joinPlayerNameInput.value,
//         success:true
//         // password: signDivPassword.value,
//     });
// };
// socket.on("signInResponse", function (data) {
//     if (data.success) {
//         signDiv.style.display = "none";
//         gameScreen.style.display = "inline-block";
//     } else alert("Sign in unsuccessul.");
// });
// socket.on("newGameResponse", function (data) {
//     if (data.success) {
//         alert("new game successul created");
//         initialScreen.style.display = "none";
//         gameScreen.style.display = "inline-block";
//     } else alert("Sign up unsuccessul.");
// });

socket.on("winner", function (data) {
    initialScreen.style.display = "none";
    gameScreen.style.display = "none";
    winDiv.style.display = "block";
    win.innerHTML="Player " +data +" won";
})
socket.on("start",function(){
    initialScreen.style.display = "none";
    gameScreen.style.display = "inline-block";
    roomStandDiv.style.display="none";
});

document.onkeydown = function (event) {
    if (event.keyCode === 68 || event.keyCode === 39)
        //d
        socket.emit("keyPress", { inputId: "right", state: true });
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
// function newGame(data) {
//     ctx.clearRect(0, 0, 500, 500);

//     for (var i = 0; i < data.length; i++) {
//         console.log(data[i].score);
//         playerName.value = data[i].number;
//         playerScore.value = data[i].score;

//         for (var e in data[i].balls) {
//             ctx.beginPath();

//             ctx.arc(
//                 data[i].balls[e].x,
//                 data[i].balls[e].y,
//                 data[i].balls[e].radius,
//                 data[i].balls[e].start,
//                 data[i].balls[e].angle,
//                 false
//             );
//             ctx.stroke();
//             ctx.fillStyle = "#FF4422";
//             ctx.fill();
//         }
//         ctx.fillStyle = "#000000";
//         ctx.fillRect(data[i].x, data[i].y, 20, 20);
//     }
// }

socket.on("newPositions", function (data) {
    // newGame(data);
    ctx.clearRect(0, 0, 500, 500);

    // paintGame(playerName, playerScore, data,ctx);
    if(data[0]==null) return ;
    for (var i = 0; i < data.length; i++) {
        console.log(data[i]);
        playerName.value = data[i].number;
        playerScore.value = data[i].score;
    
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
        ctx.fillStyle = PLAYER_COLOUR;
        ctx.fillRect(data[i].x, data[i].y, 20, 20);
      }
});