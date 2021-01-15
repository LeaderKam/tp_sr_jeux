// const BG_COLOUR = '#faebd7';
// const PLAYER_COLOUR = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
// const CIRCLES_COLOUR = 'red';

// const socket = io('https://sleepy-island-33889.herokuapp.com/');

// socket.on('init', handleInit);
// socket.on('gameState', handleGameState);
// socket.on('gameOver', handleGameOver);
// socket.on('gameCode', handleGameCode);
// socket.on('unknownCode', handleUnknownCode);
// socket.on('tooManyPlayers', handleTooManyPlayers);

// const gameScreen = document.getElementById('gameScreen');
// const initialScreen = document.getElementById('initialScreen');
// const newGameBtn = document.getElementById('newGameButton');
// const joinGameBtn = document.getElementById('joinGameButton');
// const gameCodeInput = document.getElementById('gameCodeInput');
// const gameCodeDisplay = document.getElementById('gameCodeDisplay');

// newGameBtn.addEventListener('click', newGame);
// joinGameBtn.addEventListener('click', joinGame);


// function newGame() {
//   socket.emit('newGame');
//   init();
// }

// function joinGame() {
//   const code = gameCodeInput.value;
//   socket.emit('joinGame', code);
//   init();
// }

// let canvas, ctx;
// let playerNumber;
// let gameActive = false;

// function init() {
//   initialScreen.style.display = "none";
//   gameScreen.style.display = "block";

//   canvas = document.getElementById('canvas');
//   ctx = canvas.getContext('2d');

//   canvas.width = canvas.height = 500;

//   ctx.fillStyle = BG_COLOUR;
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   document.addEventListener('keydown', keydown);
//   gameActive = true;
// }

// function keydown(e) {
//   socket.emit('keydown', e.keyCode);
// }

// function paintGame(state) {
//   ctx.fillStyle = BG_COLOUR;
//   ctx.fillRect(0, 0, canvas.width, canvas.height);

//   const food = state.food;
//   const gridsize = state.gridsize;
//   const size = canvas.width / gridsize;

//   ctx.fillStyle = FOOD_COLOUR;
//   ctx.fillRect(food.x * size, food.y * size, size, size);

//   for (const key in PLAYER_LIST) {
//     paintPlayer(state.players[i], size, PLAYER_COLOUR);
//   }
//   // paintPlayer(state.players[0], size, SNAKE_COLOUR);
//   // paintPlayer(state.players[1], size, 'red');
// }

// function paintPlayer(playerState, size, colour) {
//   const player = playerState.snake;

//   ctx.fillStyle = colour;
//   for (let cell of player) {
//     ctx.fillRect(cell.x * size, cell.y * size, size, size);
//   }
// }

// function handleInit(number) {
//   playerNumber = number;
// }

// function handleGameState(gameState) {
//   if (!gameActive) {
//     return;
//   }
//   gameState = JSON.parse(gameState);
//   requestAnimationFrame(() => paintGame(gameState));
// }

// function handleGameOver(data) {
//   if (!gameActive) {
//     return;
//   }
//   data = JSON.parse(data);

//   gameActive = false;

//   if (data.winner === playerNumber) {
//     alert('You Win!');
//   } else {
//     alert('You Lose :(');
//   }
// }

// function handleGameCode(gameCode) {
//   gameCodeDisplay.innerText = gameCode;
// }

// function handleUnknownCode() {
//   reset();
//   alert('Unknown Game Code')
// }

// function handleTooManyPlayers() {
//   reset();
//   alert('This game is already in progress');
// }

// function reset() {
//   playerNumber = null;
//   gameCodeInput.value = '';
//   initialScreen.style.display = "block";
//   gameScreen.style.display = "none";
// }









// {/* <script src="https://cdn.socket.io/socket.io-1.4.5.js"></script>

//   var ctx = document.getElementById("ctx").getContext("2d");
//   ctx.font = "30px Arial";

//   var socket = io();
//   // var happy= function(){socket.emit('happy',{
//   //     reason:'from client'+random
//   // });
//   // }

//   var signDiv = document.getElementById("signDiv");
//   var signDivUsername = document.getElementById("signDiv-username");
//   var signDivSignIn = document.getElementById("signDiv-signIn");
//   var signDivSignUp = document.getElementById("signDiv-signUp");
//   var signDivPassword = document.getElementById("signDiv-password");
//   var playerScore=document.getElementById("score");
//   var playerName=document.getElementById("playerName")

//   signDivSignIn.onclick = function () {
//     socket.emit("signIn", {
//       username: signDivUsername.value,
//       password: signDivPassword.value,
//     });
//   };
//   signDivSignUp.onclick = function () {
//     socket.emit("signUp", {
//       username: signDivUsername.value,
//       password: signDivPassword.value,
//     });
//   };
//   socket.on("signInResponse", function (data) {
//     if (data.success) {
//       signDiv.style.display = "none";
//       gameDiv.style.display = "inline-block";
//     } else alert("Sign in unsuccessul.");
//   });
//   socket.on("signUpResponse", function (data) {
//     if (data.success) {
//       alert("Sign up successul.");
//     } else alert("Sign up unsuccessul.");
//   });

//   socket.on("winner",function(data){
//     signDiv.style.display="block";
//     gameDiv.style.display="none";
//   })
//   socket.on("newPositions", function (data) {
//     ctx.clearRect(0, 0, 500, 500);

//     for (var i = 0; i < data.length; i++) {
//       // console.log(data[i].score);
//       playerName.value=data[i].number;
//       playerScore.value=data[i].score;

//       for (var e in data[i].balls) {
//         ctx.beginPath();

//         ctx.arc(
//           data[i].balls[e].x,
//           data[i].balls[e].y,
//           data[i].balls[e].radius,
//           data[i].balls[e].start,
//           data[i].balls[e].angle,
//           false
//         );
//         ctx.stroke();
//         ctx.fillStyle = "#FF4422";
//         ctx.fill();
//       }
//       ctx.fillStyle = "#000000";
//       ctx.fillRect(data[i].x, data[i].y, 20, 20);
//     }
//   });

//   document.onkeydown = function (event) {
//     if (event.keyCode === 68 || event.keyCode === 39)
//       //d
//       socket.emit("keyPress", { inputId: "right", state: true });
//     else if (event.keyCode === 83 || event.keyCode === 40)
//       //s
//       socket.emit("keyPress", { inputId: "down", state: true });
//     else if (event.keyCode === 81 || event.keyCode === 37)
//       //a
//       socket.emit("keyPress", { inputId: "left", state: true });
//     else if (event.keyCode === 90 || event.keyCode === 38)
//       //w
//       socket.emit("keyPress", { inputId: "up", state: true });
//   };

//   document.onkeyup = function (event) {
//     if (event.keyCode === 68 || event.keyCode === 39)
//       //d
//       socket.emit("keyPress", { inputId: "right", state: false });
//     else if (event.keyCode === 83 || event.keyCode === 40)
//       //s
//       socket.emit("keyPress", { inputId: "down", state: false });
//     else if (event.keyCode === 81 || event.keyCode === 37)
//       //a
//       socket.emit("keyPress", { inputId: "left", state: false });
//     else if (event.keyCode === 90 || event.keyCode === 38)
//       //w
//       socket.emit("keyPress", { inputId: "up", state: false });
//   }; */}
