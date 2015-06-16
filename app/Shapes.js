class Shapes {

  static defineRect(w, h, pos) {
    return function(x, y) {
      return (x < pos.x + w/2 && x > pos.x - w/2) &&
             (y < pos.y + h/2 && y > pos.y - h/2);
    };
  }

  static defineCircle(r, pos) {
    return function(x, y) {
      return Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)) < r;
    };
  }

}
