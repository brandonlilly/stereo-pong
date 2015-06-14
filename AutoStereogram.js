AutoStereogram = {

  // Stereo separation corresponding to position Z
  separation: function(z, mu, dpi) {
    return Math.round((1 - (mu * z)) * this.eyeDistance(dpi) / (2 - (mu * z)));
  },

  eyeDistance: function(dpi) {
    // eye separation assumed to be 2.5 inches
    return Math.round(2.5 * dpi);
  },

  /*
   * Algorithm by Ian H. Witten, Stuart Inglis and Harold W. Thimbleby
   * http://www.cs.waikato.ac.nz/pubs/wp/1993/uow-cs-wp-1993-02.pdf
   */
  generatePixels: function(depthMap, options) {
    var width = options.width;
    var height = options.height;
    var dpi = options.dpi;
    var mu = options.mu;

    var pixels = [];
    for (var y = 0; y < height; y++) {

      // Pixels on the right constrained to be this color
      var same = [];
      for (var x = 0; x < width; x++) {
        same[x] = x;
      }

      for (var x = 0; x < width; x++) {
        var depth = depthMap[y][x];
        var sep = this.separation(depth, mu, dpi);

        var left = x - Math.round(sep / 2);
        // var left = Math.round(x - ((sep + (sep & y & 1)) / 2));
        var right = left + sep;

        // var t = 1;
        // do {
        //   var zt = depth + (2 * (2 - (mu * depth)) * t / (mu * this.eyeDistance(dpi)));
        //   var visible = (depthMap[y][x-t] < zt) && (depthMap[y][x+t] < zt);
        //   t++;
        // } while (visible && zt < 1)
        var visible = true;

        var inBounds = (left >= 0 && right < width);

        if (inBounds && visible) {
          // var l = same[left];
          // while (l !== left && l !== right) {
          //   if (l < right) {
          //     left = l;
          //     l = same[left];
          //   } else {
          //     same[left] = right;
          //     left = right;
          //     // l = same[left];
          //     // right = l;
          //     l = right;
          //   }
          // }
          for (var k = same[left]; k !== left && k !== right; k = same[left]) {
            if (k < right) {
              left = k;
            } else {
              left = right;
              right = k;
            }
          }
          same[left] = right;
        }
      }

      pixels[y] = [];

      for (var x = (width - 1); x >= 0; x--) {
        if (same[x] === x) {
          pixels[y][x] = Math.floor(Math.random()*5);
        } else {
          pixels[y][x] = pixels[y][same[x]];
        }
      }
    }

    return pixels;
  },

  drawSurface: function(basePixels, mapFn, options) {
    var width = options.width;
    var height = options.height;
    var dpi = options.dpi;
    var mu = options.mu;


    var depth = options.depth;

    var sep = this.separation(depth, mu, dpi);

    var pixels = []

    for (var y = 0; y < height; y++) {

      // Pixels on the right constrained to be this color
      var same = [];
      for (var x = 0; x < width; x++) {
        same[x] = x;
      }

      for (var x = 0; x < width; x++) {
        if (!mapFn(x, y)) {
          continue;
        }

        var left = x - Math.round(sep / 2);
        var right = left + sep;

        if (left >= 0 && right < width) {
          for (var k = same[left]; k !== left && k !== right; k = same[left]) {
            if (k < right) {
              left = k;
            } else {
              left = right;
              right = k;
            }
          }
          same[left] = right;
        }
      }

      pixels[y] = [];

      for (var x = (width - 1); x >= 0; x--) {
        if (same[x] === x) {
          pixels[y][x] = basePixels[y][x]
        } else {
          // pixels[y][x] = 0;
          pixels[y][x] = pixels[y][same[x]];
          // pixels[y][x] = Math.floor(Math.random()*5);
          // pixels[y][same[x]] = 0;
        }
      }
    }

    return pixels;
  },

  /*
   * Algorithm by Ian H. Witten, Stuart Inglis and Harold W. Thimbleby
   * http://www.cs.waikato.ac.nz/pubs/wp/1993/uow-cs-wp-1993-02.pdf
   */
  generateSame: function(depthFn, options) {
    var width = options.width;
    var height = options.height;
    var dpi = options.dpi;
    var mu = options.mu;

    var samePixels = [];
    for (var y = 0; y < height; y++) {

      // Pixels on the right constrained to be this color
      var same = [];
      for (var x = 0; x < width; x++) {
        same[x] = x;
      }

      for (var x = 0; x < width; x++) {
        var depth = depthFn(x, y);
        var sep = this.separation(depth, mu, dpi);

        var left = x - Math.round(sep / 2);
        // var left = Math.round(x - ((sep + (sep & y & 1)) / 2));
        var right = left + sep;

        if (left >= 0 && right < width) {
          for (var k = same[left]; k !== left && k !== right; k = same[left]) {
            if (k < right) {
              left = k;
            } else {
              left = right;
              right = k;
            }
          }
          same[left] = right;
        }
      }

      samePixels[y] = same;
    }

    return samePixels;
  },

  drawSameSurface: function(samePixels, mapFn, options) {
    var width = options.width;
    var height = options.height;
    var dpi = options.dpi;
    var mu = options.mu;


    var depth = options.depth;

    var sep = this.separation(depth, mu, dpi);

    for (var y = 0; y < height; y++) {

      // Pixels on the right constrained to be this color
      // var samePixels[y] = samePixels[y]

      for (var x = 0; x < width; x++) {
        if (!mapFn(x, y)) {
          continue;
        }

        var left = x - Math.round(sep / 2);
        var right = left + sep;

        if (left >= 0 && right < width) {
          // var l = samePixels[y][left];
          // while (l !== left && l !== right) {
          //   if (l < right) {
          //     left = l;
          //     l = samePixels[y][left];
          //   } else {
          //     samePixels[y][left] = right;
          //     left = right;
          //     // l = same[left];
          //     // right = l;
          //     l = right;
          //   }
          // }
          samePixels[y][left] = right;
        }
      }
    }

    return samePixels;
  },

  drawSame: function(samePixels, options) {
    var width = options.width;
    var height = options.height;

    pixels = [];
    for (var y = 0; y < height; y++) {
      pixels[y] = [];
      for (var x = (width - 1); x >= 0; x--) {
        if (samePixels[y][x] === x) {
          pixels[y][x] = Math.floor(Math.random()*5);
        } else {
          pixels[y][x] = pixels[y][samePixels[y][x]];
        }
      }
    }

    return pixels;
  },
}
