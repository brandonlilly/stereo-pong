class Ball {

  constructor(options) {
    const { x, y } = options;
    this.pos = { x, y };
    this.xVel = options.xVel;
    this.yVel = options.yVel;
    this.radius = options.radius;
    this.depth = options.depth;
    this.shape = Shapes.defineSphere(this.radius, this.depth, this.pos);
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
    const leftCollision = this.left() < obj.right() && this.pos.x > obj.pos.x && this.xVel < 0;
    const rightCollision = this.right() > obj.left() && this.pos.x < obj.pos.x && this.xVel > 0;
    const verticalCollision = this.top() < obj.bottom() && this.bottom() > obj.top();

    return verticalCollision && (leftCollision || rightCollision);
  }

}
