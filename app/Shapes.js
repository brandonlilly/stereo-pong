class Shapes {
  static defineRect(w, h, depth, pos) {
    return function(x, y) {
      if ((x < pos.x + w/2 && x > pos.x - w/2) &&
          (y < pos.y + h/2 && y > pos.y - h/2)) {
        return depth;
      }
      return false;
    };
  }

  static defineCircle(r, depth, pos) {
    return function(x, y) {
      if (Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)) < r) {
        return depth;
      }
      return false;
    };
  }

  static defineSphere(r, depth, pos) {
    return function(x, y) {
      const rDist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (rDist > r) {
        return false;
      }
      const z = Math.sqrt(Math.pow(r, 2) - Math.pow(rDist, 2));
      return 0.25 * z / r + depth;
    };
  }
}
