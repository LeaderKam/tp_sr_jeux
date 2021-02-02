class Circle {
    constructor(id) {
        this.id = id;
        this.x = 10;
        this.y = 10;
        this.radius = 10;
        this.angle = Math.PI * 2;
        this.start = 0;
    }
}

class Player {
    constructor(id) {
        this.x = 250;
        this.y = 250;
        this.id = id;
        this.number = "" + Math.floor(100 * Math.random());
        this.pressingRight = false;
        this.pressingLeft = false;
        this.pressingUp = false;
        this.pressingDown = false;
        this.maxSpd = 10;
        this.score = 0;
        this.color = '#';
    }
    updatePosition(circles) {
        if (this.pressingRight)
            this.x += this.maxSpd;
        if (this.pressingLeft)
            this.x -= this.maxSpd;
        if (this.pressingDown)
            this.y += this.maxSpd;
        if (this.pressingUp)
            this.y -= this.maxSpd;
        for (const key in circles) {
            if ((this.x + 10) === circles[key].x && (this.y + 10) === circles[key].y) {
                delete circles[key];
                this.score += 1;
            }
        }
    }
    updateState(WINNER, circles, pack, i) {
        pack.push({
            x: this.x,
            y: this.y,
            number: this.number,
            score: this.score,
            color: this.color,
            balls: circles
        });
        WINNER[i] = this.score
    }
    onConnect(socket){
        socket.on('keyPress', function (data) {
            if (data.inputId === 'left')
                this.pressingLeft = data.state;
            else if (data.inputId === 'right')
                this.pressingRight = data.state;
            else if (data.inputId === 'up')
                this.pressingUp = data.state;
            else if (data.inputId === 'down')
                this.pressingDown = data.state;
        });
    }
    // onDisconnect(socket,PLAYER_LIST) {
    //     delete PLAYER_LIST[socket.id];
    // }
}
function verifyKeyPressed(SOCKET_LIST,gameActive){
    if (!gameActive) {
        for (var i in SOCKET_LIST) {
            var socket = SOCKET_LIST[i];
            socket.emit("start");
        }
        gameActive = true;
    }
}
var verifyWin = function (circles, WINNER, PLAYER_LIST, SOCKET_LIST, pack) {
    if (Object.keys(circles).length === 0) {
        for (const key in PLAYER_LIST) {
            if (Math.max(...Object.values(WINNER)) === PLAYER_LIST[key].score) {
                for (var i in SOCKET_LIST) {
                    var socket = SOCKET_LIST[i];
                    socket.emit('winner', PLAYER_LIST[key].number);
                }
                pack = [];
                WINNER={};
                return true;
            }
        }
    }

}

//function to send Data to all client
function sendDataToClient(SOCKET_LIST, pack) {
    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions', pack);
    }
}

//function to update all Client frame
function updateClientFrame(PLAYER_LIST, WINNER, circles, pack) {
    for (var i in PLAYER_LIST) {
        var player = PLAYER_LIST[i];
        player.updatePosition(circles);
        player.updateState(WINNER, circles, pack, i);
    }
}

var position = new Array(48).fill(1).map((_, i) => i * 10);
var generateBall = function (BALLS) {

    for (var i = 0; i < 20; i++) {
        var circle = new Circle(i);
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
module.exports = { Circle, Player, verifyWin, generateBall, sendDataToClient, updateClientFrame,verifyKeyPressed }
