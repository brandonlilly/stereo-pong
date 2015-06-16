class Pong {

  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.ball = this.newBall();

    this.stereogram = new AutoStereogram(ctx, {
      width,
      height,
      dpi: 72,
      mu: (1/3),
      colors: [
        [71, 113, 134],
        [110, 146, 161],
        [17, 60, 81],
        [3, 37, 54],
        [54, 130, 127],
      ],
    });

  }

  newBall() {
    return new Ball({
      radius: 30,
      x: this.width / 2,
      y: this.height / 2,
      xVel: 4,
      yVel: 4,
    });
  }

  step() {
    this.ball.update();
    this.render();
  }

  render() {
    this.stereogram.drawWithSurface(
      0.7,
      (x, y) => {
        return this.ball.shape(x, y)
      }
    );
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

    if (this.pos.y - this.radius < 0 || this.pos.y + this.radius > 400 ) {
      this.yVel *= -1;
    }
  }

}
