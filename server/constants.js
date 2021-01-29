
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
        this.number = "" + Math.floor(10 * Math.random()),
            this.pressingRight = false;
        this.pressingLeft = false;
        this.pressingUp = false;
        this.pressingDown = false;
        this.maxSpd = 10;
        this.score = 0;
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
    updateState(WINNER, circles, pack, player, i) {
        pack.push({
            x: player.x,
            y: player.y,
            number: player.number,
            score: player.score,
            balls: circles
        });
        WINNER[i] = player.score
    }

}
var verifyWin = function (circles, WINNER, PLAYER_LIST, SOCKET_LIST,pack) {
    if (Object.keys(circles).length === 18) {
        for (const key in PLAYER_LIST) {
            if (Math.max(...Object.values(WINNER)) === PLAYER_LIST[key].score) {
                console.log(PLAYER_LIST[key].number + " win")
                for (var i in SOCKET_LIST) {
                    var socket = SOCKET_LIST[i];
                    socket.emit('winner', PLAYER_LIST[key].number);
                }
                
                    for (i=0;i<pack.length;i++) {
                        delete pack[i];  
                    } 
                    // socket.emit('winner', PLAYER_LIST[key].number);
                
            }
        }
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
module.exports = { Circle, Player,verifyWin,generateBall }

