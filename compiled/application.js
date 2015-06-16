"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AutoStereogram = (function () {
  function AutoStereogram(ctx, options) {
    _classCallCheck(this, AutoStereogram);

    this.ctx = ctx;
    this.options = options;
    this.baseRelations = AutoStereogram.generatePixelRelations(function () {
      return 0;
    }, this.options);
  }

  _createClass(AutoStereogram, [{
    key: "drawWithSurface",
    value: function drawWithSurface(depth, surfaceFn) {
      var relations = AutoStereogram.mapSurfaceRelations(this.baseRelations, surfaceFn, {
        mu: this.options.mu,
        dpi: this.options.dpi,
        depth: depth,
        width: this.options.width,
        height: this.options.height
      });
      var pixels = AutoStereogram.drawSame(relations, this.options);
      AutoStereogram.drawPixels(this.ctx, pixels, this.options);
    }
  }], [{
    key: "drawPixels",
    value: function drawPixels(ctx, pixels, options) {
      var width = options.width;
      var height = options.height;
      var colors = options.colors;

      var canvasData = ctx.getImageData(0, 0, width, height);
      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          var color = options.colors[pixels[y * width + x]];
          var index = (x + y * width) * 4;
          canvasData.data[index + 0] = color[0];
          canvasData.data[index + 1] = color[1];
          canvasData.data[index + 2] = color[2];
          canvasData.data[index + 3] = 255;
        }
      }
      ctx.putImageData(canvasData, 0, 0);
    }
  }, {
    key: "generatePixels",

    /*
     * Algorithm by Ian H. Witten, Stuart Inglis and Harold W. Thimbleby
     * http://www.cs.waikato.ac.nz/pubs/wp/1993/uow-cs-wp-1993-02.pdf
     */
    value: function generatePixels(depthMap, options) {
      var width = options.width;
      var height = options.height;
      var dpi = options.dpi;
      var mu = options.mu;

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

        for (var x = width - 1; x >= 0; x--) {
          if (same[x] === x) {
            pixels[y][x] = Math.floor(Math.random() * 5);
          } else {
            pixels[y][x] = pixels[y][same[x]];
          }
        }
      }

      return pixels;
    }
  }, {
    key: "drawSurface",
    value: function drawSurface(basePixels, mapFn, options) {
      var width = options.width;
      var height = options.height;
      var dpi = options.dpi;
      var mu = options.mu;
      var depth = options.depth;

      var sep = this._separation(depth, mu, dpi);

      var pixels = [];

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

        for (var x = width - 1; x >= 0; x--) {
          if (same[x] === x) {
            pixels[y][x] = basePixels[y][x];
          } else {
            pixels[y][x] = pixels[y][same[x]];
          }
        }
      }

      return pixels;
    }
  }, {
    key: "generatePixelRelations",

    /*
     * Algorithm by Ian H. Witten, Stuart Inglis and Harold W. Thimbleby
     * http://www.cs.waikato.ac.nz/pubs/wp/1993/uow-cs-wp-1993-02.pdf
     */
    value: function generatePixelRelations(depthFn, options) {
      var width = options.width;
      var height = options.height;
      var dpi = options.dpi;
      var mu = options.mu;

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
  }, {
    key: "mapSurfaceRelations",
    value: function mapSurfaceRelations(samePixels, mapFn, options) {
      var width = options.width;
      var height = options.height;
      var dpi = options.dpi;
      var mu = options.mu;
      var depth = options.depth;

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
  }, {
    key: "drawSame",
    value: function drawSame(samePixels, options) {
      var width = options.width;
      var height = options.height;

      var pixels = new Uint16Array(width * height);
      for (var y = 0; y < height; y++) {
        for (var x = width - 1; x >= 0; x--) {
          if (samePixels[y * width + x] === x) {
            pixels[y * width + x] = Math.floor(Math.random() * 5);
          } else {
            pixels[y * width + x] = pixels[y * width + samePixels[y * width + x]];
          }
        }
      }

      return pixels;
    }
  }, {
    key: "_separation",

    // Stereo separation corresponding to position Z
    value: function _separation(z, mu, dpi) {
      return Math.round((1 - mu * z) * this._eyeDistance(dpi) / (2 - mu * z));
    }
  }, {
    key: "_eyeDistance",

    // Eye separation assumed to be 2.5 inches
    value: function _eyeDistance(dpi) {
      return Math.round(2.5 * dpi);
    }
  }]);

  return AutoStereogram;
})();
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Pong = (function () {
  function Pong(ctx, width, height) {
    _classCallCheck(this, Pong);

    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.ball = this.newBall();

    this.stereogram = new AutoStereogram(ctx, {
      width: width,
      height: height,
      dpi: 72,
      mu: 1 / 3,
      colors: [[71, 113, 134], [110, 146, 161], [17, 60, 81], [3, 37, 54], [54, 130, 127]]
    });
  }

  _createClass(Pong, [{
    key: "newBall",
    value: function newBall() {
      return new Ball({
        radius: 30,
        x: this.width / 2,
        y: this.height / 2,
        xVel: 4,
        yVel: 4
      });
    }
  }, {
    key: "step",
    value: function step() {
      this.ball.update();
      this.render();
    }
  }, {
    key: "render",
    value: function render() {
      var _this = this;

      this.stereogram.drawWithSurface(0.7, function (x, y) {
        return _this.ball.shape(x, y);
      });
    }
  }]);

  return Pong;
})();

var Paddle = function Paddle(options) {
  _classCallCheck(this, Paddle);

  var _options = options;
  var x = _options.x;
  var y = _options.y;

  this.pos = { x: x, y: y };
  this.width = options.width;
  this.height = options.height;
  this.shape = Shapes.defineRect(this.width, this.height, this.pos);
};

var Ball = (function () {
  function Ball(options) {
    _classCallCheck(this, Ball);

    var x = options.x;
    var y = options.y;

    this.pos = { x: x, y: y };
    this.xVel = options.xVel;
    this.yVel = options.yVel;
    this.radius = options.radius;
    this.shape = Shapes.defineCircle(this.radius, this.pos);
  }

  _createClass(Ball, [{
    key: "update",
    value: function update() {
      this.pos.x += this.xVel;
      this.pos.y += this.yVel;

      if (this.pos.y - this.radius < 0 || this.pos.y + this.radius > 400) {
        this.yVel *= -1;
      }
    }
  }]);

  return Ball;
})();
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Shapes = (function () {
  function Shapes() {
    _classCallCheck(this, Shapes);
  }

  _createClass(Shapes, null, [{
    key: "defineRect",
    value: function defineRect(w, h, pos) {
      return function (x, y) {
        return x < pos.x + w / 2 && x > pos.x - w / 2 && (y < pos.y + h / 2 && y > pos.y - h / 2);
      };
    }
  }, {
    key: "defineCircle",
    value: function defineCircle(r, pos) {
      return function (x, y) {
        return Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)) < r;
      };
    }
  }]);

  return Shapes;
})();