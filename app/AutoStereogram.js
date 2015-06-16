class AutoStereogram {

  /*
   * Algorithm by Ian H. Witten, Stuart Inglis and Harold W. Thimbleby
   * http://www.cs.waikato.ac.nz/pubs/wp/1993/uow-cs-wp-1993-02.pdf
   */
  generatePixels(depthMap, options) {
    const { width, height, dpi, mu } = options;

    var pixels = [];
    for (var y = 0; y < height; y++) {

      var same = [];
      for (var x = 0; x < width; x++) {
        same[x] = x;
      }

      for (var x = 0; x < width; x++) {
        var depth = depthMap[y][x];
        var sep = this._separation(depth, mu, dpi);

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
          pixels[y][x] = Math.floor(Math.random()*5);
        } else {
          pixels[y][x] = pixels[y][same[x]];
        }
      }
    }

    return pixels;
  }

  drawSurface(basePixels, mapFn, options) {
    const { width, height, dpi, mu, depth } = options;

    var sep = this._separation(depth, mu, dpi);

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
          same[left] = right;
        }
      }

      pixels[y] = [];

      for (var x = (width - 1); x >= 0; x--) {
        if (same[x] === x) {
          pixels[y][x] = basePixels[y][x]
        } else {
          pixels[y][x] = pixels[y][same[x]];
        }
      }
    }

    return pixels;
  }

  /*
   * Algorithm by Ian H. Witten, Stuart Inglis and Harold W. Thimbleby
   * http://www.cs.waikato.ac.nz/pubs/wp/1993/uow-cs-wp-1993-02.pdf
   */
  static generatePixelRelations(depthFn, options) {
    const { width, height, dpi, mu } = options;

    var samePixels = new Uint16Array(width * height);

    for (var y = 0; y < height; y++) {

      for (var x = 0; x < width; x++) {
        samePixels[y * width + x] = x;
      }

      for (var x = 0; x < width; x++) {
        var depth = depthFn(x, y);
        var sep = this._separation(depth, mu, dpi);

        var left = x - Math.round(sep / 2);
        var right = left + sep;

        if (left >= 0 && right < width) {
          samePixels[y * width + left] = right;
        }
      }
    }

    return samePixels;
  }

  static mapSurfaceRelations(samePixels, mapFn, options) {
    const { width, height, dpi, mu, depth } = options;

    var sep = this._separation(depth, mu, dpi);
    var newSame = new Uint16Array(width * height);

    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        newSame[y * width + x] = samePixels[y * width + x];

        if (!mapFn(x, y)) {
          continue;
        }

        var left = x - Math.round(sep / 2);
        var right = left + sep;

        if (left >= 0 && right < width) {
          newSame[y * width + left] = right;
        }
      }
    }

    return newSame;
  }

  static drawSame(samePixels, options) {
    var width = options.width;
    var height = options.height;

    let pixels = new Uint16Array(width * height);
    for (var y = 0; y < height; y++) {
      for (var x = (width - 1); x >= 0; x--) {
        if (samePixels[y * width + x] === x) {
          pixels[y * width + x] = Math.floor(Math.random()*5);
        } else {
          pixels[y * width + x] = pixels[y * width + samePixels[y * width + x]];
        }
      }
    }

    return pixels;
  }

  // Stereo separation corresponding to position Z
  static _separation(z, mu, dpi) {
    return Math.round((1 - (mu * z)) * this._eyeDistance(dpi) / (2 - (mu * z)));
  }

  // Eye separation assumed to be 2.5 inches
  static _eyeDistance(dpi) {
    return Math.round(2.5 * dpi);
  }
}
