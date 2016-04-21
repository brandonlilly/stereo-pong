class AutoStereogram {
  constructor(ctx, options) {
    this.ctx = ctx;
    this.options = options;
    this.baseRelations = AutoStereogram.mapPixelRelations(
      () => { return 0; },
      this.options
    );
  }

  drawWithSurface(depthFn) {
    let relations = AutoStereogram.mapPixelRelations(
      depthFn,
      this.options,
      this.baseRelations
    );
    AutoStereogram.drawRelations(this.ctx, relations, this.options);
  }

  /*
   * Algorithm by Ian H. Witten, Stuart Inglis and Harold W. Thimbleby
   * http://www.cs.waikato.ac.nz/pubs/wp/1993/uow-cs-wp-1993-02.pdf
   */
  static mapPixelRelations(depthFn, options, baseSame) {
    const { width, height, dpi, mu } = options;
    let newSame = new Uint16Array(width * height);

    let x, y;

    if (!baseSame) {
      baseSame = new Uint16Array(width * height);
      for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
          baseSame[y * width + x] = x;
        }
      }
    }

    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        newSame[y * width + x] = baseSame[y * width + x];
        let depth = depthFn(x, y);

        if (depth === false) {
          continue;
        }

        let sep = this._separation(depth, mu, dpi);

        let left = x - Math.round(sep / 2);
        let right = left + sep;
        if (left >= 0 && right < width) {
          newSame[y * width + left] = right;
        }
      }
    }

    return newSame;
  }

  static drawColors(ctx, pixels, options) {
    const { width, height, colors } = options;
    let canvasData = ctx.createImageData(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = options.colors[pixels[y * width + x]];
        const index = (x + y * width) * 4;
        canvasData.data[index + 0] = color[0];
        canvasData.data[index + 1] = color[1];
        canvasData.data[index + 2] = color[2];
        canvasData.data[index + 3] = 255;
      }
    }
    ctx.putImageData(canvasData, 0, 0);
  }

  static generatePixels(samePixels, options) {
    const { width, height, colors } = options;
    let pixels = new Uint16Array(width * height);

    let x, y;
    for (y = 0; y < height; y++) {
      for (x = (width - 1); x >= 0; x--) {
        if (samePixels[y * width + x] === x) {
          pixels[y * width + x] = Math.floor(Math.random() * colors.length);
        } else {
          pixels[y * width + x] = pixels[y * width + samePixels[y * width + x]];
        }
      }
    }

    return pixels;
  }

  // Represent and draw pixel relationships in color
  // generatePixels and drawColors functions combined (minor optimization)
  static drawRelations(ctx, samePixels, options) {
    const { width, height, colors } = options;
    let canvasData = ctx.createImageData(width, height);

    let x, y;
    for (y = 0; y < height; y++) {
      for (x = (width - 1); x >= 0; x--) {
        let index = (x + y * width) * 4;
        if (samePixels[y * width + x] === x) {
          let color = colors[Math.floor(Math.random() * colors.length)];
          canvasData.data[index + 0] = color[0];
          canvasData.data[index + 1] = color[1];
          canvasData.data[index + 2] = color[2];
          canvasData.data[index + 3] = 255;
        } else {
          let copyIndex = (y * width + samePixels[y * width + x]) * 4;
          canvasData.data[index + 0] = canvasData.data[copyIndex + 0]
          canvasData.data[index + 1] = canvasData.data[copyIndex + 1]
          canvasData.data[index + 2] = canvasData.data[copyIndex + 2]
          canvasData.data[index + 3] = 255;
        }
      }
    }
    ctx.putImageData(canvasData, 0, 0);
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
