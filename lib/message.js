"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var defs = _interopRequire(require("../data/defs.json"));

var Segment = _interopRequire(require("./segment"));

var Message = (function () {
  function Message(name, segments) {
    var _this = this;

    _classCallCheck(this, Message);

    this.name = name;
    this.segments = [];

    if (!defs.Message[name]) {
      var options = Object.getOwnPropertyNames(defs.Message);
      throw new Error("message " + name + " doesn't exist; options are: " + options.join(", "));
    }

    if (segments) {
      segments.forEach(function (s) {
        return _this.addSegment(_this.createSegment(s[0], s[1]));
      });
    }
  }

  _createClass(Message, {
    addSegment: {
      value: function addSegment(segment) {
        this.segments.push(segment);

        return this;
      }
    },
    createSegment: {
      value: function createSegment(name, props) {
        if (!defs.Message[this.name][1].reduce(function (i, v) {
          return i || v[0] === name;
        }, false)) {
          var options = defs.Message[this.name][1].map(function (e) {
            return e[0];
          });
          throw new Error("message " + this.name + " has no segment " + name + "; options are: " + options.join(", "));
        }

        return new Segment(name, props);
      }
    }
  });

  return Message;
})();

module.exports = Message;