// const socket = io('https://sleepy-island-33889.herokuapp.com/');
const { BG_COLOUR, PLAYER_COLOUR, CIRCLES_COLOUR } = require("./constantClient");

function newGame() {
  socket.emit('newGame');
  init();
}

let canvas, ctx;
let gameActive = false;

function init(gameActive) {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 500;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
  gameActive = true;
}

// function keydown(e) {
//   socket.emit('keydown', e.keyCode);
// }


function paintGame(playerName,playerScore,data,ctx) {
  for (var i = 0; i < data.length; i++) {
    console.log(data[i].score);
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
}

function drawPlayer(){
console.log("dfghjk");
}

function drawCircle(){
console.log("sdfghjk");
}

module.exports={paintGame,drawPlayer,drawCircle}