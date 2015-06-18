class Pong {

  constructor(options) {
    let { ctx, player1, player2, leftScoreEl, rightScoreEl } = options;
    const { width, height, colors } = options;
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.player1 = player1;
    this.player2 = player2;
    this.paddles = [this.player1.paddle, this.player2.paddle];
    this.leftScoreEl = leftScoreEl;
    this.rightScoreEl = rightScoreEl;

    this.ball = this.newBall();

    this.stereogram = new AutoStereogram(ctx, {
      width,
      height,
      colors,
      dpi: 72,
      mu: (1/3),
    });

    this.paddles.forEach((paddle) => { paddle.pos.y = this.height / 2 });
    this.leftScore = 0;
    this.rightScore = 0;
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

  newBall() {
    return new Ball({
      radius: 28,
      x: this.width / 2,
      y: this.height / 2,
      depth: 0.5,
      xVel: Math.floor(Math.random() * 5 + 5) * (Math.round(Math.random()) * 2 - 1),
      yVel: Math.floor(Math.random() * 12) * (Math.round(Math.random()) * 2 - 1),
    });
  }

  step() {
    this.paddles.forEach((paddle) => { paddle.update() });
    this.ball.update(this.paddles, this.width, this.height);
    this.enforceBoundaries();

    if (this.ball.pos.x < 100) {
      this.rightScore++;
      this.rightScoreEl.innerHTML = this.rightScore;
      this.ball = this.newBall();
    }

    if (this.ball.pos.x > this.width - 100) {
      this.leftScore++;
      this.leftScoreEl.innerHTML = this.leftScore;
      this.ball = this.newBall();
    }
  }

  render() {
    this.stereogram.drawWithSurface((x, y) => {
      return this.paddles[0].shape(x, y) ||
             this.paddles[1].shape(x, y) ||
             this.ball.shape(x, y);
    });
  }

}
