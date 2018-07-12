var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _class, _temp;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from "react";

var _default = (_temp = _class = function (_Component) {
  _inherits(_default, _Component);

  function _default(props) {
    _classCallCheck(this, _default);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.getSaveData = function () {
      var saveData = {
        linesArray: _this.linesArray,
        width: _this.props.canvasWidth,
        height: _this.props.canvasHeight
      };
      return JSON.stringify(saveData);
    };

    _this.loadSaveData = function (saveData, immediate) {
      try {
        if (typeof saveData !== "string") {
          throw new Error("saveData needs to be a stringified array!");
        }
        // parse first to catch any possible errors before clear()

        var _JSON$parse = JSON.parse(saveData),
            linesArray = _JSON$parse.linesArray,
            width = _JSON$parse.width,
            height = _JSON$parse.height;

        if (!linesArray || typeof linesArray.push !== "function") {
          throw new Error("linesArray needs to be an array!");
        }

        // start the load-process
        _this.clear();

        if (width === _this.props.canvasWidth && height === _this.props.canvasHeight) {
          _this.linesArray = linesArray;
        } else {
          // we need to rescale the lines based on saved & current dimensions
          var scaleX = _this.props.canvasWidth / width;
          var scaleY = _this.props.canvasHeight / height;
          var scaleAvg = (scaleX + scaleY) / 2;

          _this.linesArray = linesArray.map(function (line) {
            return _extends({}, line, {
              endX: line.endX * scaleX,
              endY: line.endY * scaleY,
              startX: line.startX * scaleX,
              startY: line.startY * scaleY,
              size: line.size * scaleAvg
            });
          });
        }

        _this.redraw(immediate);
      } catch (err) {
        throw err;
      }
    };

    _this.redraw = function (immediate) {
      if (_this.ctx) {
        _this.ctx.clearRect(0, 0, _this.props.canvasWidth, _this.props.canvasHeight);
      }

      _this.timeoutValidity++;
      var timeoutValidity = _this.timeoutValidity;
      _this.linesArray.forEach(function (line, idx) {
        // draw the line with a time offset
        // creates the cool drawing-animation effect
        if (!immediate) {
          window.setTimeout(function () {
            if (timeoutValidity === _this.timeoutValidity) {
              _this.drawLine(line);
            }
          }, idx * _this.props.loadTimeOffset);
        } else {
          // if the immediate flag is true, draw without timeout
          _this.drawLine(line);
        }
      });
    };

    _this.getMousePos = function (e) {
      var rect = _this.canvas.getBoundingClientRect();

      // use cursor pos as default
      var clientX = e.clientX;
      var clientY = e.clientY;

      // use first touch if available
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      // return mouse/touch position inside canvas
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    _this.clear = function () {
      if (_this.ctx) {
        _this.ctx.clearRect(0, 0, _this.props.canvasWidth, _this.props.canvasHeight);
      }
      _this.timeoutValidity++;
      _this.linesArray = [];
      _this.startDrawIdx = [];
    };

    _this.undo = function () {
      if (_this.startDrawIdx.length > 0) {
        _this.linesArray.splice(_this.startDrawIdx.pop());
        _this.redraw(true);
        return true;
      }
      return false;
    };

    _this.drawLine = function (line) {
      if (!_this.ctx) return;

      _this.ctx.strokeStyle = line.color;
      _this.ctx.lineWidth = line.size;
      _this.ctx.lineCap = "round";
      _this.ctx.beginPath();
      _this.ctx.moveTo(line.startX, line.startY);
      _this.ctx.lineTo(line.endX, line.endY);
      _this.ctx.stroke();
    };

    _this.drawStart = function (e) {
      _this.isMouseDown = true;
      _this.startDrawIdx.push(_this.linesArray.length);

      var _this$getMousePos = _this.getMousePos(e),
          x = _this$getMousePos.x,
          y = _this$getMousePos.y;

      _this.x = x;
      _this.y = y;

      // make sure we start painting, useful to draw simple dots
      _this.draw(e);
    };

    _this.drawEnd = function () {
      _this.isMouseDown = false;
    };

    _this.draw = function (e) {
      if (!_this.isMouseDown || _this.props.disabled) return;

      // calculate the current x, y coords

      var _this$getMousePos2 = _this.getMousePos(e),
          x = _this$getMousePos2.x,
          y = _this$getMousePos2.y;

      // Offset by 1 to ensure drawing a dot on click


      var newX = x + 1;
      var newY = y + 1;

      // create current line object
      var line = {
        color: _this.props.brushColor,
        size: _this.props.brushSize,
        startX: _this.x,
        startY: _this.y,
        endX: newX,
        endY: newY
      };

      // actually draw the line
      _this.drawLine(line);

      // push it to our array of lines
      _this.linesArray.push(line);

      // notify parent that a new line was added
      if (typeof _this.props.onChange === "function") {
        _this.props.onChange(_this.linesArray);
      }

      // set current x, y coords
      _this.x = newX;
      _this.y = newY;
    };

    _this.isMouseDown = false;
    _this.linesArray = [];
    _this.startDrawIdx = [];
    _this.timeoutValidity = 0;
    return _this;
  }

  _default.prototype.render = function render() {
    var _this2 = this;

    return React.createElement("canvas", {
      width: this.props.canvasWidth,
      height: this.props.canvasHeight,
      style: _extends({
        display: "block",
        background: "#fff",
        touchAction: "none"
      }, this.props.style),
      ref: function ref(canvas) {
        if (canvas) {
          _this2.canvas = canvas;
          _this2.ctx = canvas.getContext("2d");
        }
      },
      onMouseDown: this.drawStart,
      onClick: function onClick() {
        return false;
      },
      onMouseUp: this.drawEnd,
      onMouseOut: this.drawEnd,
      onMouseMove: this.draw,
      onTouchStart: this.drawStart,
      onTouchMove: this.draw,
      onTouchEnd: this.drawEnd,
      onTouchCancel: this.drawEnd
    });
  };

  return _default;
}(Component), _class.defaultProps = {
  loadTimeOffset: 5,
  brushSize: 6,
  brushColor: "#444",
  canvasWidth: 400,
  canvasHeight: 400,
  disabled: false
}, _temp);

export { _default as default };