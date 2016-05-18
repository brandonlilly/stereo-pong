"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AutoStereogram = (function () {
  function AutoStereogram(ctx, options) {
    _classCallCheck(this, AutoStereogram);

    this.ctx = ctx;
    this.options = options;
    this.baseRelations = AutoStereogram.mapPixelRelations(function () {
      return 0;
    }, this.options);
  }

  _createClass(AutoStereogram, [{
    key: "drawWithSurface",
    value: function drawWithSurface(depthFn) {
      var relations = AutoStereogram.mapPixelRelations(depthFn, this.options, this.baseRelations);
      AutoStereogram.drawRelations(this.ctx, relations, this.options);
    }

    /*
     * Algorithm by Ian H. Witten, Stuart Inglis and Harold W. Thimbleby
     * http://www.cs.waikato.ac.nz/pubs/wp/1993/uow-cs-wp-1993-02.pdf
     */
  }], [{
    key: "mapPixelRelations",
    value: function mapPixelRelations(depthFn, options, baseSame) {
      var width = options.width;
      var height = options.height;
      var dpi = options.dpi;
      var mu = options.mu;

      var newSame = new Uint16Array(width * height);

      var x = undefined,
          y = undefined;

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
          var depth = depthFn(x, y);

          if (depth === false) {
            continue;
          }

          var sep = this._separation(depth, mu, dpi);

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
    key: "drawColors",
    value: function drawColors(ctx, pixels, options) {
      var width = options.width;
      var height = options.height;
      var colors = options.colors;

      var canvasData = ctx.createImageData(width, height);

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
    value: function generatePixels(samePixels, options) {
      var width = options.width;
      var height = options.height;
      var colors = options.colors;

      var pixels = new Uint16Array(width * height);

      var x = undefined,
          y = undefined;
      for (y = 0; y < height; y++) {
        for (x = width - 1; x >= 0; x--) {
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
  }, {
    key: "drawRelations",
    value: function drawRelations(ctx, samePixels, options) {
      var width = options.width;
      var height = options.height;
      var colors = options.colors;

      var canvasData = ctx.createImageData(width, height);

      var x = undefined,
          y = undefined;
      for (y = 0; y < height; y++) {
        for (x = width - 1; x >= 0; x--) {
          var index = (x + y * width) * 4;
          if (samePixels[y * width + x] === x) {
            var color = colors[Math.floor(Math.random() * colors.length)];
            canvasData.data[index + 0] = color[0];
            canvasData.data[index + 1] = color[1];
            canvasData.data[index + 2] = color[2];
            canvasData.data[index + 3] = 255;
          } else {
            var copyIndex = (y * width + samePixels[y * width + x]) * 4;
            canvasData.data[index + 0] = canvasData.data[copyIndex + 0];
            canvasData.data[index + 1] = canvasData.data[copyIndex + 1];
            canvasData.data[index + 2] = canvasData.data[copyIndex + 2];
            canvasData.data[index + 3] = 255;
          }
        }
      }
      ctx.putImageData(canvasData, 0, 0);
    }

    // Stereo separation corresponding to position Z
  }, {
    key: "_separation",
    value: function _separation(z, mu, dpi) {
      return Math.round((1 - mu * z) * this._eyeDistance(dpi) / (2 - mu * z));
    }

    // Eye separation assumed to be 2.5 inches
  }, {
    key: "_eyeDistance",
    value: function _eyeDistance(dpi) {
      return Math.round(2.5 * dpi);
    }
  }]);

  return AutoStereogram;
})();
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Ball = (function () {
  function Ball(_ref) {
    var angle = _ref.angle;
    var radius = _ref.radius;
    var depth = _ref.depth;
    var speed = _ref.speed;
    var x = _ref.x;
    var y = _ref.y;

    _classCallCheck(this, Ball);

    this.pos = { x: x, y: y };
    this.radius = radius;
    this.depth = depth;
    this.speed = speed;

    this.shape = Shapes.defineSphere(radius, depth, this.pos);

    this.xVel = speed * Math.cos(angle);
    this.yVel = speed * Math.sin(angle);
  }

  _createClass(Ball, [{
    key: "update",
    value: function update(paddles, width, height) {
      var _this = this;

      this.pos.x += this.xVel;
      this.pos.y += this.yVel;

      var topCollision = this.top() < 0 && this.yVel < 0;
      var bottomCollision = this.bottom() > height && this.yVel > 0;
      if (topCollision || bottomCollision) {
        this.yVel *= -1;
      }

      paddles.forEach(function (paddle) {
        if (_this.isCollidedWith(paddle)) {
          _this.xVel *= -1;
          _this.yVel += paddle.yVel * 0.7;

          var MAX_ANGLE = 2.5 * Math.PI / 12;
          var relativeIntersection = (paddle.pos.y - _this.pos.y) / (paddle.height / 2);
          var bounceAngle = relativeIntersection * MAX_ANGLE;

          _this.xVel = _this.speed * Math.cos(bounceAngle) * Math.sign(_this.xVel);
          _this.yVel = _this.speed * -Math.sin(bounceAngle);
        }
      });
    }
  }, {
    key: "top",
    value: function top() {
      return this.pos.y - this.radius;
    }
  }, {
    key: "bottom",
    value: function bottom() {
      return this.pos.y + this.radius;
    }
  }, {
    key: "left",
    value: function left() {
      return this.pos.x - this.radius;
    }
  }, {
    key: "right",
    value: function right() {
      return this.pos.x + this.radius;
    }
  }, {
    key: "isCollidedWith",
    value: function isCollidedWith(obj) {
      var leftCollision = this.left() < obj.right() && this.pos.x > obj.pos.x && this.xVel < 0;
      var rightCollision = this.right() > obj.left() && this.pos.x < obj.pos.x && this.xVel > 0;
      var verticalCollision = this.top() < obj.bottom() && this.bottom() > obj.top();

      return verticalCollision && (leftCollision || rightCollision);
    }
  }]);

  return Ball;
})();
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Paddle = (function () {
  function Paddle(options) {
    _classCallCheck(this, Paddle);

    var x = options.x;
    var y = options.y;

    this.pos = { x: x, y: y };
    this.xVel = 0;
    this.yVel = 0;
    this.width = options.width;
    this.height = options.height;
    this.depth = options.depth;
    this.shape = Shapes.defineRect(this.width, this.height, this.depth, this.pos);
  }

  _createClass(Paddle, [{
    key: "update",
    value: function update() {
      this.pos.x += this.xVel;
      this.pos.y += this.yVel;
    }
  }, {
    key: "top",
    value: function top() {
      return this.pos.y - this.height / 2;
    }
  }, {
    key: "bottom",
    value: function bottom() {
      return this.pos.y + this.height / 2;
    }
  }, {
    key: "left",
    value: function left() {
      return this.pos.x - this.width / 2;
    }
  }, {
    key: "right",
    value: function right() {
      return this.pos.x + this.width / 2;
    }
  }]);

  return Paddle;
})();
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Human = (function () {
  function Human() {
    var upKey = arguments.length <= 0 || arguments[0] === undefined ? 'w' : arguments[0];
    var downKey = arguments.length <= 1 || arguments[1] === undefined ? 's' : arguments[1];

    _classCallCheck(this, Human);

    this.upKey = upKey;
    this.downKey = downKey;

    this.paddle = new Paddle({
      width: 24,
      height: 80,
      depth: 0.75
    });
  }

  _createClass(Human, [{
    key: 'step',
    value: function step() {
      this.paddle.yVel = 0;

      if (key.isPressed(this.upKey)) {
        this.paddle.yVel += -8;
      }

      if (key.isPressed(this.downKey)) {
        this.paddle.yVel += 8;
      }
    }
  }]);

  return Human;
})();

var Computer = (function () {
  function Computer() {
    _classCallCheck(this, Computer);

    this.paddle = new Paddle({
      width: 24,
      height: 80,
      depth: 0.75
    });
  }

  _createClass(Computer, [{
    key: 'step',
    value: function step(ball) {
      var dist = ball.pos.y - this.paddle.pos.y;
      var maxSpeed = 4;

      this.paddle.yVel = 0;

      // only move if ball is moving toward us
      if (ball.pos.x > this.paddle.pos.x && ball.xVel > 0 || ball.pos.x < this.paddle.pos.x && ball.xVel < 0) {
        return;
      }

      if (dist > 0) {
        this.paddle.yVel = Math.min(dist, maxSpeed);
      }

      if (dist < 0) {
        this.paddle.yVel = -Math.min(dist * -1, maxSpeed);
      }
    }
  }]);

  return Computer;
})();
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Pong = (function () {
  function Pong(_ref) {
    var _this = this;

    var ctx = _ref.ctx;
    var player1 = _ref.player1;
    var player2 = _ref.player2;
    var leftScoreEl = _ref.leftScoreEl;
    var rightScoreEl = _ref.rightScoreEl;
    var width = _ref.width;
    var height = _ref.height;
    var colors = _ref.colors;

    _classCallCheck(this, Pong);

    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.player1 = player1;
    this.player2 = player2;
    this.paddles = [this.player1.paddle, this.player2.paddle];
    this.leftScoreEl = leftScoreEl;
    this.rightScoreEl = rightScoreEl;

    this.stereographic = true;
    this.ball = this.newBall();

    this.stereogram = new AutoStereogram(ctx, {
      width: width,
      height: height,
      colors: colors,
      dpi: 72,
      mu: 1 / 3
    });

    this.paddles.forEach(function (paddle) {
      paddle.pos.y = _this.height / 2;
    });
    this.enforceBoundaries();
    this.leftScore = 0;
    this.rightScore = 0;

    this.surface = function (x, y) {
      return _this.paddles[0].shape(x, y) || _this.paddles[1].shape(x, y) || _this.ball.shape(x, y);
    };
  }

  _createClass(Pong, [{
    key: 'enforceBoundaries',
    value: function enforceBoundaries() {
      var _this2 = this;

      this.paddles.forEach(function (paddle) {
        if (paddle.top() < 0) {
          paddle.pos.y = paddle.height / 2;
        }

        if (paddle.bottom() > _this2.height) {
          paddle.pos.y = _this2.height - paddle.height / 2;
        }
      });

      this.player1.paddle.pos.x = 150;
      this.player2.paddle.pos.x = this.width - 150;
    }
  }, {
    key: 'newBall',
    value: function newBall() {
      var angle = (Math.random() * 2 - 1) * Math.PI / 2.5 + Math.PI * Math.round(Math.random());

      return new Ball({
        radius: 28,
        x: this.width / 2,
        y: this.height / 2,
        depth: 0.5,
        angle: angle,
        speed: 10
      });
    }
  }, {
    key: 'step',
    value: function step() {
      this.paddles.forEach(function (paddle) {
        paddle.update();
      });
      this.ball.update(this.paddles, this.width, this.height, this);
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
  }, {
    key: 'render',
    value: function render() {
      if (this.stereographic) {
        this.stereogram.drawWithSurface(this.surface);
      } else {
        this.drawFlat();
      }
    }
  }, {
    key: 'drawFlat',
    value: function drawFlat() {
      this.ctx.fillStyle = '#295278';
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.drawPaddle(this.paddles[0], '#23709c');
      this.drawPaddle(this.paddles[1], '#23709c');
      this.drawBall(this.ball, '#23709c');
    }
  }, {
    key: 'drawPaddle',
    value: function drawPaddle(_ref2, color) {
      var pos = _ref2.pos;
      var width = _ref2.width;
      var height = _ref2.height;

      this.ctx.fillStyle = color;
      this.ctx.fillRect(pos.x - width / 2, pos.y - height / 2, width, height);
    }
  }, {
    key: 'drawBall',
    value: function drawBall(_ref3, color) {
      var pos = _ref3.pos;
      var radius = _ref3.radius;

      this.ctx.fillStyle = '#23709c';
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
      this.ctx.fill();
    }
  }]);

  return Pong;
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
    value: function defineRect(w, h, depth, pos) {
      return function (x, y) {
        if (x < pos.x + w / 2 && x > pos.x - w / 2 && y < pos.y + h / 2 && y > pos.y - h / 2) {
          return depth;
        }
        return false;
      };
    }
  }, {
    key: "defineCircle",
    value: function defineCircle(r, depth, pos) {
      return function (x, y) {
        if (Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)) < r) {
          return depth;
        }
        return false;
      };
    }
  }, {
    key: "defineSphere",
    value: function defineSphere(r, depth, pos) {
      return function (x, y) {
        var rDist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
        if (rDist > r) {
          return false;
        }
        var z = Math.sqrt(Math.pow(r, 2) - Math.pow(rDist, 2));
        return 0.25 * z / r + depth;
      };
    }
  }]);

  return Shapes;
})();
//     keymaster.js
//     (c) 2011-2013 Thomas Fuchs
//     keymaster.js may be freely distributed under the MIT license.
//
//     https://github.com/madrobby/keymaster

'use strict';

var global = window;
var k,
    _handlers = {},
    _mods = { 16: false, 18: false, 17: false, 91: false },
    _scope = 'all',

// modifier keys
_MODIFIERS = {
  '⇧': 16, shift: 16,
  '⌥': 18, alt: 18, option: 18,
  '⌃': 17, ctrl: 17, control: 17,
  '⌘': 91, command: 91
},

// special keys
_MAP = {
  backspace: 8, tab: 9, clear: 12,
  enter: 13, 'return': 13,
  esc: 27, escape: 27, space: 32,
  left: 37, up: 38,
  right: 39, down: 40,
  del: 46, 'delete': 46,
  home: 36, end: 35,
  pageup: 33, pagedown: 34,
  ',': 188, '.': 190, '/': 191,
  '`': 192, '-': 189, '=': 187,
  ';': 186, '\'': 222,
  '[': 219, ']': 221, '\\': 220
},
    code = function code(x) {
  return _MAP[x] || x.toUpperCase().charCodeAt(0);
},
    _downKeys = [];

for (k = 1; k < 20; k++) _MAP['f' + k] = 111 + k;

// IE doesn't support Array#indexOf, so have a simple replacement
function index(array, item) {
  var i = array.length;
  while (i--) if (array[i] === item) return i;
  return -1;
}

// for comparing mods before unassignment
function compareArray(a1, a2) {
  if (a1.length != a2.length) return false;
  for (var i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) return false;
  }
  return true;
}

var modifierMap = {
  16: 'shiftKey',
  18: 'altKey',
  17: 'ctrlKey',
  91: 'metaKey'
};
function updateModifierKey(event) {
  for (k in _mods) _mods[k] = event[modifierMap[k]];
};

// handle keydown event
function dispatch(event) {
  var key, handler, k, i, modifiersMatch, scope;
  key = event.keyCode;

  if (index(_downKeys, key) == -1) {
    _downKeys.push(key);
  }

  // if a modifier key, set the key.<modifierkeyname> property to true and return
  if (key == 93 || key == 224) key = 91; // right command on webkit, command on Gecko
  if (key in _mods) {
    _mods[key] = true;
    // 'assignKey' from inside this closure is exported to window.key
    for (k in _MODIFIERS) if (_MODIFIERS[k] == key) assignKey[k] = true;
    return;
  }
  updateModifierKey(event);

  // see if we need to ignore the keypress (filter() can can be overridden)
  // by default ignore key presses if a select, textarea, or input is focused
  if (!assignKey.filter.call(this, event)) return;

  // abort if no potentially matching shortcuts found
  if (!(key in _handlers)) return;

  scope = getScope();

  // for each potential shortcut
  for (i = 0; i < _handlers[key].length; i++) {
    handler = _handlers[key][i];

    // see if it's in the current scope
    if (handler.scope == scope || handler.scope == 'all') {
      // check if modifiers match if any
      modifiersMatch = handler.mods.length > 0;
      for (k in _mods) if (!_mods[k] && index(handler.mods, +k) > -1 || _mods[k] && index(handler.mods, +k) == -1) modifiersMatch = false;
      // call the handler and stop the event if neccessary
      if (handler.mods.length == 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91] || modifiersMatch) {
        if (handler.method(event, handler) === false) {
          if (event.preventDefault) event.preventDefault();else event.returnValue = false;
          if (event.stopPropagation) event.stopPropagation();
          if (event.cancelBubble) event.cancelBubble = true;
        }
      }
    }
  }
};

// unset modifier keys on keyup
function clearModifier(event) {
  var key = event.keyCode,
      k,
      i = index(_downKeys, key);

  // remove key from _downKeys
  if (i >= 0) {
    _downKeys.splice(i, 1);
  }

  if (key == 93 || key == 224) key = 91;
  if (key in _mods) {
    _mods[key] = false;
    for (k in _MODIFIERS) if (_MODIFIERS[k] == key) assignKey[k] = false;
  }
};

function resetModifiers() {
  for (k in _mods) _mods[k] = false;
  for (k in _MODIFIERS) assignKey[k] = false;
};

// parse and assign shortcut
function assignKey(key, scope, method) {
  var keys, mods;
  keys = getKeys(key);
  if (method === undefined) {
    method = scope;
    scope = 'all';
  }

  // for each shortcut
  for (var i = 0; i < keys.length; i++) {
    // set modifier keys if any
    mods = [];
    key = keys[i].split('+');
    if (key.length > 1) {
      mods = getMods(key);
      key = [key[key.length - 1]];
    }
    // convert to keycode and...
    key = key[0];
    key = code(key);
    // ...store handler
    if (!(key in _handlers)) _handlers[key] = [];
    _handlers[key].push({ shortcut: keys[i], scope: scope, method: method, key: keys[i], mods: mods });
  }
};

// unbind all handlers for given key in current scope
function unbindKey(key, scope) {
  var multipleKeys,
      keys,
      mods = [],
      i,
      j,
      obj;

  multipleKeys = getKeys(key);

  for (j = 0; j < multipleKeys.length; j++) {
    keys = multipleKeys[j].split('+');

    if (keys.length > 1) {
      mods = getMods(keys);
      key = keys[keys.length - 1];
    }

    key = code(key);

    if (scope === undefined) {
      scope = getScope();
    }
    if (!_handlers[key]) {
      return;
    }
    for (i = 0; i < _handlers[key].length; i++) {
      obj = _handlers[key][i];
      // only clear handlers if correct scope and mods match
      if (obj.scope === scope && compareArray(obj.mods, mods)) {
        _handlers[key][i] = {};
      }
    }
  }
};

// Returns true if the key with code 'keyCode' is currently down
// Converts strings into key codes.
function isPressed(keyCode) {
  if (typeof keyCode == 'string') {
    keyCode = code(keyCode);
  }
  return index(_downKeys, keyCode) != -1;
}

function getPressedKeyCodes() {
  return _downKeys.slice(0);
}

function filter(event) {
  var tagName = (event.target || event.srcElement).tagName;
  // ignore keypressed in any elements that support keyboard data input
  return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
}

// initialize key.<modifier> to false
for (k in _MODIFIERS) assignKey[k] = false;

// set current scope (default 'all')
function setScope(scope) {
  _scope = scope || 'all';
};
function getScope() {
  return _scope || 'all';
};

// delete all handlers for a given scope
function deleteScope(scope) {
  var key, handlers, i;

  for (key in _handlers) {
    handlers = _handlers[key];
    for (i = 0; i < handlers.length;) {
      if (handlers[i].scope === scope) handlers.splice(i, 1);else i++;
    }
  }
};

// abstract key logic for assign and unassign
function getKeys(key) {
  var keys;
  key = key.replace(/\s/g, '');
  keys = key.split(',');
  if (keys[keys.length - 1] == '') {
    keys[keys.length - 2] += ',';
  }
  return keys;
}

// abstract mods logic for assign and unassign
function getMods(key) {
  var mods = key.slice(0, key.length - 1);
  for (var mi = 0; mi < mods.length; mi++) mods[mi] = _MODIFIERS[mods[mi]];
  return mods;
}

// cross-browser events
function addEvent(object, event, method) {
  if (object.addEventListener) object.addEventListener(event, method, false);else if (object.attachEvent) object.attachEvent('on' + event, function () {
    method(window.event);
  });
};

// set the handlers globally on document
addEvent(document, 'keydown', function (event) {
  dispatch(event);
}); // Passing _scope to a callback to ensure it remains the same by execution. Fixes #48
addEvent(document, 'keyup', clearModifier);

// reset modifiers to false whenever the window is (re)focused.
addEvent(window, 'focus', resetModifiers);

// store previously defined key
var previousKey = global.key;

// restore previously defined key and return reference to our key object
function noConflict() {
  var k = global.key;
  global.key = previousKey;
  return k;
}

// set window.key and window.key.set/get/deleteScope, and the default filter
global.key = assignKey;
global.key.setScope = setScope;
global.key.getScope = getScope;
global.key.deleteScope = deleteScope;
global.key.filter = filter;
global.key.isPressed = isPressed;
global.key.getPressedKeyCodes = getPressedKeyCodes;
global.key.noConflict = noConflict;
global.key.unbind = unbindKey;

if (typeof module !== 'undefined') module.exports = assignKey;

// })(this);