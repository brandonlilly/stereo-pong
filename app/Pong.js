class Pong {

  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.ball = this.newBall();
  }

  newBall() {
    return new Ball({
      radius: 30,
      x: this.width / 2,
      y: this.height / 2,
      xVel: 0,
      yVel: 0,
    });
  }

  step() {
    this.ball.update();

  }

}


class Paddle {

  constructor(options) {
    const { x, y } = options;
    this.pos = { x, y };
    this.width = options.width;
    this.height = options.height;
    this.shape = Shapes.defineRect(this.width, this.height, this.pos);
  }

}


class Ball {

  constructor(options) {
    const { x, y } = options;
    this.pos = { x, y };
    this.xVel = options.xVel;
    this.yVel = options.yVel;
    this.radius = options.radius;
    this.shape = Shapes.defineCircle(this.radius, this.pos);
  }

  update() {
    this.pos.x += this.xVel;
    this.pos.y += this.yVel;
  }

}
