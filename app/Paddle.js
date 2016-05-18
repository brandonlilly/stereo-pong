class Paddle {
  constructor(options) {
    const { x, y } = options;
    this.pos = { x, y };
    this.xVel = 0;
    this.yVel = 0;
    this.width = options.width;
    this.height = options.height;
    this.depth = options.depth;
    this.shape = Shapes.defineRect(this.width, this.height, this.depth, this.pos);
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
