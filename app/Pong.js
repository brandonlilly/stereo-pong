class Pong {

  constructor(ctx, player1, player2, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.ball = this.newBall();
    this.player1 = player1;
    this.player2 = player2;
    this.paddles = [player1.paddle, player2.paddle];
    this.player1.paddle.pos.y = this.height / 2;
    this.player2.paddle.pos.y = this.height / 2;

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

    this.leftScore = 0;
    this.rightScore = 0;
  }

  newBall() {
    return new Ball({
      radius: 28,
      x: this.width / 2,
      y: this.height / 2,
      xVel: Math.floor(Math.random() * 5 + 5) * (Math.round(Math.random()) * 2 - 1),
      yVel: Math.floor(Math.random() * 12) * (Math.round(Math.random()) * 2 - 1),
    });
  }

  step() {
    this.enforceBoundaries();
    this.paddles.forEach((paddle) => { paddle.update() });
    this.ball.update(this.paddles, this.width, this.height);

    if (this.ball.pos.x < 100) {
      this.leftScore++;
      this.ball = this.newBall();
    }

    if (this.ball.pos.x > this.width - 100) {
      this.rightScore++;
      this.ball = this.newBall();
    }

    this.render();
  }

  enforceBoundaries() {
    this.paddles.forEach((paddle) => {
      if (paddle.top() < 0) {
        paddle.pos.y = paddle.height / 2;
      }

      if (paddle.bottom() > this.height) {
        paddle.pos.y = this.height - paddle.height / 2;
      }
    });

    this.player1.paddle.pos.x = 150;
    this.player2.paddle.pos.x = this.width - 150;
  }

  render() {
    this.stereogram.drawWithSurface(
      0.7,
      (x, y) => {
        return this.ball.shape(x, y) ||
               this.paddles[0].shape(x, y) ||
               this.paddles[1].shape(x, y);
      }
    );
  }

}


class Paddle {

  constructor(options) {
    const { x, y } = options;
    this.pos = { x, y };
    this.xVel = 0;
    this.yVel = 0;
    this.width = options.width;
    this.height = options.height;
    this.shape = Shapes.defineRect(this.width, this.height, this.pos);
  }

  update() {
    this.pos.x += this.xVel;
    this.pos.y += this.yVel;
  }

  top() {
    return this.pos.y - this.height / 2;
  }

  bottom() {
    return this.pos.y + this.height / 2;
  }

  left() {
    return this.pos.x - this.width / 2;
  }

  right() {
    return this.pos.x + this.width / 2;
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

  update(paddles, width, height) {
    this.pos.x += this.xVel;
    this.pos.y += this.yVel;

    if (this.top() < 0 || this.bottom() > height) {
      this.yVel *= -1;
    }

    if (this.pos.x - this.radius < 0 || this.pos.x + this.radius > 800 ) {
      this.xVel *= -1;
    }

    paddles.forEach((paddle) => {
      if (this.isCollidedWith(paddle)) {
        this.xVel *= -1;
        this.yVel += paddle.yVel * 0.7;
      }
    });

  }

  top() {
    return this.pos.y - this.radius;
  }

  bottom() {
    return this.pos.y + this.radius;
  }

  left() {
    return this.pos.x - this.radius;
  }

  right() {
    return this.pos.x + this.radius;
  }

  isCollidedWith(obj) {
    const leftCollision = this.left() < obj.right() && this.left() > obj.left() && this.xVel < 0;
    const rightCollision = this.right() > obj.left() && this.right() < obj.right() && this.xVel > 0;
    const bottomCollision = this.bottom() > obj.top() && this.bottom() < obj.bottom();
    const topCollision = this.top() < obj.bottom() && this.top() > obj.top();

    if ((bottomCollision || topCollision) && (leftCollision || rightCollision)) {
      console.log(bottomCollision, topCollision, leftCollision, rightCollision);
    }

    return (bottomCollision || topCollision) && (leftCollision || rightCollision);
  }

}
