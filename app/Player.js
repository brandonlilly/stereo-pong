class Human {

  constructor(upKey = 'w', downKey = 's') {
    this.upKey = upKey;
    this.downKey = downKey;

    this.paddle = new Paddle({
      width: 24,
      height: 80,
    });
  }

  step() {
    this.paddle.yVel = 0;

    if (key.isPressed(this.upKey)) {
      this.paddle.yVel += -8;
    }

    if (key.isPressed(this.downKey)) {
      this.paddle.yVel += 8;
    }
  }

}

class Computer {

  constructor() {
    this.paddle = new Paddle({
      width: 24,
      height: 80,
    });

  }

  step(ball) {
    const dist = ball.pos.y - this.paddle.pos.y;
    const maxSpeed = 4;

    this.paddle.yVel = 0;

    // only move if ball is moving toward us
    if ((ball.pos.x > this.paddle.pos.x && ball.xVel > 0) ||
        (ball.pos.x < this.paddle.pos.x && ball.xVel < 0))
    {
      return;
    }

    if (dist > 0) {
      this.paddle.yVel = Math.min(dist, maxSpeed);
    }

    if (dist < 0) {
      this.paddle.yVel = -Math.min(dist * -1, maxSpeed);
    }
  }

}
