/*
    SETUP
*/
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;

const numberOfMissilesInARow = 3;
let frame = 0;

const keys = [];

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
        ctx.strokeStyle = 'black';

        if (keys[37]) {
            // TURN LEFT
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height);
            ctx.lineTo(this.x - this.width / 2 + 5, this.y + this.height - 5);
            ctx.closePath();
            ctx.stroke();
        } else if (keys[39]) {
            // TURN RIGHT
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width / 2 - 5, this.y + this.height - 5);
            ctx.lineTo(this.x - this.width / 2, this.y + this.height);
            ctx.closePath();
            ctx.stroke();
        } else {
            // INITIAL POSITION
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height);
            ctx.lineTo(this.x - this.width / 2, this.y + this.height);
            ctx.closePath();
            ctx.stroke();

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
    UTILITIES
*/

function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spaceship.draw();
    spaceship.update();
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
