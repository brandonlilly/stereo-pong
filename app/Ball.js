class Ball {
  constructor({ angle, radius, depth, speed, x, y }) {
    this.pos = { x, y };
    this.radius = radius;
    this.depth =  depth;
    this.speed =  speed;

    this.shape = Shapes.defineSphere(radius, depth, this.pos);

    this.xVel = speed * Math.cos(angle);
    this.yVel = speed * Math.sin(angle);
  }

  update(paddles, width, height) {
    this.pos.x += this.xVel;
    this.pos.y += this.yVel;

    const topCollision = this.top() < 0 && this.yVel < 0;
    const bottomCollision = this.bottom() > height && this.yVel > 0;
    if (topCollision || bottomCollision) {
      this.yVel *= -1;
    }

    paddles.forEach((paddle) => {
      if (this.isCollidedWith(paddle)) {
        this.xVel *= -1;
        this.yVel += paddle.yVel * 0.7;

        const MAX_ANGLE = 2.5 * Math.PI / 12;
        const relativeIntersection = ((paddle.pos.y - this.pos.y) / (paddle.height / 2));
        const bounceAngle = relativeIntersection * MAX_ANGLE;

        this.xVel = this.speed * Math.cos(bounceAngle) * Math.sign(this.xVel);
        this.yVel = this.speed * -Math.sin(bounceAngle);
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
