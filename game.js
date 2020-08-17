/*
    SETUP
*/
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;

let numberOfMissiles = 10; // initial number
const grid = 40;
const FPS = 60;
let gameSpeed = 0.3;
let timeInSec = 0;
let frame = 0;
let lastCollisionFrame = 0;
const respawnTimeInSec = 3;
let collisions = 0;
let canBeCrashed = true;

const keys = [];
let missiles = [];

/*
    SPACESHIP
*/
class Spaceship {
    constructor() {
        this.width = 20;
        this.height = 30;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height * 2;
        this.speed = 0;
        this.floating = 0;
        this.floatingDirection;
    }

    draw() {
        ctx.lineWidth = 2;

        const gradientLeft = ctx.createLinearGradient(
            this.x - this.width / 2,
            this.y,
            this.x + this.width / 2,
            this.y
        );
        gradientLeft.addColorStop('0', 'rgba(0,0,0,1)');
        gradientLeft.addColorStop('1', 'rgba(0,0,0,0.3)');

        const gradientRight = ctx.createLinearGradient(
            this.x - this.width / 2,
            this.y,
            this.x + this.width / 2,
            this.y
        );
        gradientRight.addColorStop('0', 'rgba(0,0,0,0.3)');
        gradientRight.addColorStop('1', 'rgba(0,0,0,1)');

        if (keys[37]) {
            // TURN LEFT
            ctx.fillStyle = gradientLeft;
            ctx.strokeStyle = gradientLeft;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height);
            ctx.lineTo(this.x - this.width / 2 + 5, this.y + this.height - 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (keys[39]) {
            // TURN RIGHT
            ctx.fillStyle = gradientRight;
            ctx.strokeStyle = gradientRight;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width / 2 - 5, this.y + this.height - 5);
            ctx.lineTo(this.x - this.width / 2, this.y + this.height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else {
            // INITIAL POSITION
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height);
            ctx.lineTo(this.x - this.width / 2, this.y + this.height);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            if (keys[38] && frame % Math.floor(Math.random() * 10) === 0) {
                // add flame when spaceship accelerates
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.moveTo(this.x - 4, this.y + this.height);
                ctx.lineTo(this.x + 4, this.y + this.height);
                ctx.lineTo(this.x, this.y + this.height + 8);
                ctx.fill();
            }
        }
    }

    update() {
        // UP / DOWN
        // stop spaceship at the bottom of the canvas
        if (this.y >= canvas.height - this.height * 2) {
            this.speed = 0;
        }

        // gradually increase spaceship's speed and limit it's max top position
        if (keys[38] && this.y > this.height) {
            this.speed += 0.1;
            this.y -= this.speed;
        }

        // when there's no up arrow pressed decrease the speed and move space ship to the bottom of the canvas
        else if (!keys[38] && this.speed > 0) {
            this.speed = this.speed > 0.7 ? this.speed - 0.007 : 0.7;
            this.y += this.speed;
        }

        // LEFT / RIGHT
        // TURN LEFT - increase spaceship's floating rate and limit it's position at the left edge
        if (keys[37] && this.x > this.width) {
            this.floating += 0.03;
            this.x -= this.floating;
        }

        // TURN RIGHT - increase spaceship's floating rate and limit it's position at the right edge
        if (keys[39] && this.x < canvas.width - this.width * 1.5) {
            this.floating = this.floating >= 4 ? 4 : this.floating + 0.15;
            this.x += this.floating;
        }

        // Make spaceship floats when neither left arrow nor right one is pressed
        if (
            !keys[37] &&
            !keys[39] &&
            this.floating > 0 &&
            this.x > this.width &&
            this.x < canvas.width - this.width * 1.5
        ) {
            this.floating = this.floating > 0.7 ? this.floating - 0.03 : 0.7;
            this.x =
                this.floatingDirection === 'left'
                    ? this.x - this.floating
                    : this.x + this.floating;
        }
    }
}

const spaceship = new Spaceship();

/*
    MISSILE
*/
class Missile {
    constructor() {
        this.height = 45;
        this.width = 16;
        this.x =
            Math.floor(Math.random() * (canvas.width / grid)) * grid +
            this.width;
        this.y = 0 - this.height;
        this.speed = Math.floor(Math.random() * 10) + 1;
    }

    draw() {
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + 4, this.y - 8);
        ctx.lineTo(this.x + 4, this.y - 30);
        ctx.lineTo(this.x + 8, this.y - 45);
        ctx.lineTo(this.x - 8, this.y - 45);
        ctx.lineTo(this.x - 4, this.y - 30);
        ctx.lineTo(this.x - 4, this.y - 8);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        this.y += gameSpeed * this.speed;

        if (this.y > canvas.height + this.height) {
            this.y = 0 - this.height;
            this.speed = Math.floor(Math.random() * 10) + 1;
            this.x =
                Math.floor(Math.random() * (canvas.width / grid)) * grid +
                this.width;
        }
    }
}

for (let i = 0; i < numberOfMissiles; i++) {
    missiles.push(new Missile());
}

function handleMissiles() {
    if (missiles.length > 0) {
        for (let i = 0; i < missiles.length; i++) {
            missiles[i].draw();
            missiles[i].update();
        }
    }
}

/*
    UTILITIES
*/

// TIMER

function updateTimer() {
    const timerMinutes = Math.floor(timeInSec / 60);
    const timerSeconds =
        timeInSec % 60 < 10 ? `0${timeInSec % 60}` : timeInSec % 60;

    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.font = '20px Arial';
    ctx.fillText(`${timerMinutes}:${timerSeconds}`, 20, 30);
    ctx.textAlign = 'right';
    ctx.fillText(`Game speed: ${gameSpeed.toFixed(2)}`, canvas.width - 20, 30);
    ctx.fillText(`Collisions: ${collisions}`, canvas.width - 20, 60);
}

setInterval(() => {
    timeInSec++;
    if (timeInSec % 30 === 0 && timeInSec > 0) {
        gameSpeed += 0.05;
    }
    if (timeInSec % 60 === 0 && timeInSec > 0) {
        missiles.push(new Missile());
    }
}, 1000);

// COLLISIONS

function detectCollision(objA, objB) {
    if (
        // LEFT & RIGHT EDGES
        // LEFT
        ((objA.x - objA.width / 2 >= objB.x - objB.width / 2 &&
            objA.x - objA.width / 2 <= objB.x + objB.width / 2) ||
            // RIGHT
            (objA.x + objA.width / 2 <= objB.x + objB.width / 2 &&
                objA.x + objA.width / 2 >= objB.x - objB.width / 2)) &&
        // TOP & BOTTOM EDGES
        // TOP
        ((objA.y <= objB.y && objA.y >= objB.y - objB.height) ||
            // BOTTOM
            (objA.y + objA.height <= objB.y &&
                objA.y + objA.height >= objB.y - objB.height))
    ) {
        return true;
    }
    return false;
}

function drawCollision() {
    // reset spaceship's starting point of coordinates system to top-left corner
    const startPointX = spaceship.x - spaceship.width / 2;

    ctx.strokeStyle = '#F1C40F';
    ctx.lineWidth = 5;
    ctx.fillStyle = '#E74C3C';

    // show explosion for 1sec after collision
    if (lastCollisionFrame + 10 >= frame && lastCollisionFrame > 0) {
        ctx.beginPath();
        ctx.moveTo(startPointX, spaceship.y);
        ctx.lineTo(startPointX + 6, spaceship.y + 6);
        ctx.lineTo(startPointX + 12, spaceship.y);
        ctx.lineTo(startPointX + 12, spaceship.y + 6);
        ctx.lineTo(startPointX + 18, spaceship.y + 9);
        ctx.lineTo(startPointX + 12, spaceship.y + 12);
        ctx.lineTo(startPointX + 15, spaceship.y + 18);
        ctx.lineTo(startPointX + 6, spaceship.y + 12);
        ctx.lineTo(startPointX - 3, spaceship.y + 18);
        ctx.lineTo(startPointX, spaceship.y + 12);
        ctx.lineTo(startPointX - 3, spaceship.y + 9);
        ctx.lineTo(startPointX - 6, spaceship.y + 9);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }
}

function collisionHandler() {
    if (!canBeCrashed) {
        return;
    }
    for (let i = 0; i < missiles.length; i++) {
        if (detectCollision(spaceship, missiles[i])) {
            gameOverHandler();
        }
    }
}

// HANDLE GAME OVER AND RESPAWNING

function gameOverHandler() {
    // GLOBAL
    gameSpeed = 0.3;
    timeInSec = 0;
    collisions++;
    lastCollisionFrame = frame;

    // SPACESHIP
    spaceship.x = canvas.width / 2 - spaceship.width / 2;
    spaceship.y = canvas.height - spaceship.height * 2;
    spaceship.speed = 0;
    spaceship.floating = 0;
    spaceship.floatingDirection;

    // RESET NUMBER OF MISSILES
    missiles.length = numberOfMissiles;
}

function respawnHandler() {
    ctx.fillStyle = 'tomato';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    let respawnTime =
        lastCollisionFrame + respawnTimeInSec * FPS - frame >= 0
            ? (
                  (lastCollisionFrame + respawnTimeInSec * FPS - frame) /
                  60
              ).toFixed(2)
            : 0;
    if (respawnTime > 0 && lastCollisionFrame > 0) {
        ctx.fillText(
            `Respawn in: ${respawnTime}`,
            canvas.width / 2,
            canvas.height / 2 - 50
        );
        canBeCrashed = false;
    } else {
        canBeCrashed = true;
    }
}

// ANIMATION & EVENT LISTENERS

function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spaceship.draw();
    spaceship.update();
    handleMissiles();
    collisionHandler();
    drawCollision();
    respawnHandler();
    updateTimer();
    requestAnimationFrame(animate);
}
animate();

window.addEventListener('keydown', (e) => {
    if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39) {
        keys[e.keyCode] = true;
    }

    if (e.keyCode === 37) spaceship.floatingDirection = 'left';
    if (e.keyCode === 39) spaceship.floatingDirection = 'right';
});
window.addEventListener('keyup', (e) => {
    delete keys[e.keyCode];

    if (e.keyCode === 38) {
        spaceship.speed = 2;
    }
});
