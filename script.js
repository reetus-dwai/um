"use strict";
const socket = io();
var player,
    enemies = [],
    shots = [];
var packet = {
    shots: []
}
class ship {
    constructor(x, y, color) { //need params for classes
        this.x = x;
        this.y = y;
        this.a = 0; //delta angle
        this.w = 15; //width
        this.h = 15; //height
        this.p = [
            { x: this.x - (this.w / 2), y: this.y - (this.h / 2) },
            { x: this.x + this.w + (this.w / 2), y: this.y - (this.h / 2) },
            { x: this.x + this.w + (this.w / 2), y: this.y + this.h + (this.h / 2) },
            { x: this.x - (this.w / 2), y: this.y + this.h + (this.h / 2) }
        ];

        this.ta = 0; //delta angle
        this.tat = 0;
        this.tw = 4;
        this.th = 40;
        this.tp = [
            { x: this.x - (this.tw / 2), y: this.y - (this.tw / 2) - this.th },
            { x: this.x + (this.tw / 2), y: this.y - (this.tw / 2) - this.th },
            { x: this.x + (this.tw / 2), y: this.y - (this.tw / 2) + this.th },
            { x: this.x - (this.tw / 2), y: this.y - (this.tw / 2) + this.th }
        ];

        this.color = color;
    }
    shoot() {
        packet.shots.push({
            x: player.x,
            y: player.y,
            a: player.ta
        });
    }
}
function setup() {
    let c = createCanvas(600, 600);
    c.canvas.focus();
    player = new ship(300, 300, '#0000FF');
}
var m = 0;
socket.on('update', (players, shoots) => {
    if (m < 5) {
        console.log(players);
        console.log(shoots);
        m++;
    }
    enemies = players;
    shots = shoots;
});

document.onclick = () => {
    player.shoot();
}

function update() {
    packet.player = player;
    socket.emit('update', packet);
    packet.shots = [];
}
setInterval(update, 50);

function draw() {
    background(0);

    //process keys
    if (keyIsDown(LEFT_ARROW || 65)) { //turn left
        player.a -= 0.01;
        player.ta -= 0.01;
    }
    if (keyIsDown(RIGHT_ARROW || 68)) { //turn right
        player.a += 0.01;
        player.ta += 0.01;
    }
    if (keyIsDown(UP_ARROW || 87)) { //forward
        player.x += -5 * Math.cos(player.a);
		player.y += -5 * Math.sin(player.a);
    }
    if (keyIsDown(DOWN_ARROW || 83)) { //backward
        player.x -= -2.5 * Math.cos(player.a);
		player.y -= -2.5 * Math.sin(player.a);
    }

    //angle turret
    let x = (player.x - mouseX);
    let y = (player.y - mouseY);
    player.tat = Math.atan2(y, x);

    player.ta = player.tat; //need to set limited turret speed

    //set points of turret and hull based on tank's x, y, a, and ta
    { //hull
        player.p[0].x = player.x - (player.w / 2) * (Math.cos(player.a) - Math.sin(player.a));
        player.p[0].y = player.y - (player.h / 2) * (Math.sin(player.a) + Math.cos(player.a));

        player.p[1].x = player.x + (player.w / 2) * (Math.cos(player.a) - Math.sin(player.a));
        player.p[1].y = player.y - (player.h / 2) * (Math.sin(player.a) + Math.cos(player.a));

        player.p[2].x = player.x + (player.w / 2) * (Math.cos(player.a) - Math.sin(player.a));
        player.p[2].y = player.y + (player.h / 2) * (Math.sin(player.a) + Math.cos(player.a));

        player.p[3].x = player.x - (player.w / 2) * (Math.cos(player.a) - Math.sin(player.a));
        player.p[3].y = player.y + (player.h / 2) * (Math.sin(player.a) + Math.cos(player.a));
    }

    push(); //turret
    beginShape();
    stroke(0, 255, 0);
    fill(0, 255, 0);
    player.tp.map(obj => {
        vertex(obj.x, obj.y);
    });
    endShape(CLOSE);
    pop();

    push(); //hull
    beginShape();
    stroke(255);
    fill(255);
    player.p.map(obj => {
        vertex(obj.x, obj.y);
    });
    endShape(CLOSE);
    strokeWeight(10);
    stroke(255, 0, 0);
    point(player.p[0].x, player.p[0].y);
    stroke(0, 255, 0);
    point(player.p[1].x, player.p[1].y);
    stroke(0, 0, 255);
    point(player.p[2].x, player.p[2].y);
    stroke(255, 255, 0);
    point(player.p[3].x, player.p[3].y);
    pop();

    push(); //enemies
    fill(255);
    for (var p in enemies) {
        if (p != socket.id) {
            let obj = enemies[p];
            circle(obj.x, obj.y, 10);
        }
    }
    pop();

    push(); //shots
    fill(255, 0, 0);
    shots.map(shot => {
        circle(shot.x, shot.y, 5, 5);
    });
    pop();
}