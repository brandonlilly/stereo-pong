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
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Human = (function () {
  function Human() {
    var upKey = arguments[0] === undefined ? 'w' : arguments[0];
    var downKey = arguments[1] === undefined ? 's' : arguments[1];

    _classCallCheck(this, Human);

    this.upKey = upKey;
    this.downKey = downKey;

    this.paddle = new Paddle({
      width: 24,
      height: 80
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
      height: 80
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
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Pong = (function () {
  function Pong(ctx, player1, player2, width, height) {
    _classCallCheck(this, Pong);

    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.ball = this.newBall();
    this.player1 = player1;
    this.player2 = player2;
    this.paddles = [player1.paddle, player2.paddle];
    this.player1.paddle.pos.y = this.height / 2;
    this.player2.paddle.pos.y = this.height / 2;

    this.stereogram = new AutoStereogram(ctx, {
      width: width,
      height: height,
      dpi: 72,
      mu: 1 / 3,
      colors: [[71, 113, 134], [110, 146, 161], [17, 60, 81], [3, 37, 54], [54, 130, 127]]
    });

    this.leftScore = 0;
    this.rightScore = 0;
  }

  _createClass(Pong, [{
    key: "newBall",
    value: function newBall() {
      return new Ball({
        radius: 28,
        x: this.width / 2,
        y: this.height / 2,
        xVel: Math.floor(Math.random() * 5 + 5) * (Math.round(Math.random()) * 2 - 1),
        yVel: Math.floor(Math.random() * 12) * (Math.round(Math.random()) * 2 - 1)
      });
    }
  }, {
    key: "step",
    value: function step() {
      this.enforceBoundaries();
      this.paddles.forEach(function (paddle) {
        paddle.update();
      });
      this.ball.update(this.paddles, this.width, this.height);

      if (this.ball.pos.x < 100) {
        this.leftScore++;
        this.ball = this.newBall();
      }

      if (this.ball.pos.x > this.width - 100) {
        this.rightScore++;
        this.ball = this.newBall();
      }

      this.render();
    }
  }, {
    key: "enforceBoundaries",
    value: function enforceBoundaries() {
      var _this = this;

      this.paddles.forEach(function (paddle) {
        if (paddle.top() < 0) {
          paddle.pos.y = paddle.height / 2;
        }

        if (paddle.bottom() > _this.height) {
          paddle.pos.y = _this.height - paddle.height / 2;
        }
      });

      this.player1.paddle.pos.x = 150;
      this.player2.paddle.pos.x = this.width - 150;
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      this.stereogram.drawWithSurface(0.7, function (x, y) {
        return _this2.ball.shape(x, y) || _this2.paddles[0].shape(x, y) || _this2.paddles[1].shape(x, y);
      });
    }
  }]);

  return Pong;
})();

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
    this.shape = Shapes.defineRect(this.width, this.height, this.pos);
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
    value: function update(paddles, width, height) {
      var _this3 = this;

      this.pos.x += this.xVel;
      this.pos.y += this.yVel;

      if (this.top() < 0 || this.bottom() > height) {
        this.yVel *= -1;
      }

      if (this.pos.x - this.radius < 0 || this.pos.x + this.radius > 800) {
        this.xVel *= -1;
      }

      paddles.forEach(function (paddle) {
        if (_this3.isCollidedWith(paddle)) {
          _this3.xVel *= -1;
          _this3.yVel += paddle.yVel * 0.7;
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
      var leftCollision = this.left() < obj.right() && this.left() > obj.left() && this.xVel < 0;
      var rightCollision = this.right() > obj.left() && this.right() < obj.right() && this.xVel > 0;
      var bottomCollision = this.bottom() > obj.top() && this.bottom() < obj.bottom();
      var topCollision = this.top() < obj.bottom() && this.top() > obj.top();

      if ((bottomCollision || topCollision) && (leftCollision || rightCollision)) {
        console.log(bottomCollision, topCollision, leftCollision, rightCollision);
      }

      return (bottomCollision || topCollision) && (leftCollision || rightCollision);
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
  }, {
    key: "defineSphere",

    // todo
    value: function defineSphere(r, pos) {
      var depth = 0.5;
      return function (x, y) {
        return Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)) < r;
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