"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var defs = _interopRequire(require("../data/defs.json"));

var Segment = _interopRequire(require("./segment"));

var Terser = _interopRequire(require("./terser"));

var Message = (function () {
  function Message(name) {
    var _this = this;

    var segments = arguments[1] === undefined ? [] : arguments[1];

    _classCallCheck(this, Message);

    this.name = name;
    this.segments = [];

    if (!defs.Message[name]) {
      var options = Object.getOwnPropertyNames(defs.Message).sort();
      throw new Error("message " + name + " doesn't exist; options are: " + options.join(", "));
    }

    segments.forEach(function (s) {
      return _this.addSegment(_this.createSegment(s[0], s[1]));
    });
  }

  _createClass(Message, {
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
    },
    addSegment: {
      value: function addSegment(segment) {
        this.segments.push(segment);

        return this;
      }
    },
    getSegment: {
      value: function getSegment(name) {
        var index = arguments[1] === undefined ? 0 : arguments[1];

        var c = 0;
        for (var i = 0; i < this.segments.length; i++) {
          if (this.segments[i].name === name) {
            if (c++ === index) {
              return this.segments[i];
            }
          }
        }
      }
    },
    get: {
      value: function get(query) {
        return new Terser(query).read(this);
      }
    },
    getString: {
      value: function getString(query) {
        return this.get(query) + "";
      }
    },
    build: {
      value: function build() {
        return this.segments.map(function (e) {
          return e.build();
        });
      }
    },
    buildObject: {
      value: function buildObject() {
        return [this.name, this.segments.map(function (e) {
          return e.buildObject();
        })];
      }
    }
  }, {
    load: {
      value: function load(input) {
        var segments = input.message.map(Segment.load);

        var name = segments[0].name;
        if (name !== "MSH") {
          throw new Error("first segment of a message must be \"MSH\"; instead got " + name);
        }

        return segments.reduce(function (i, v) {
          return i.addSegment(v);
        }, new Message(segments[0].getField(9).getComponent(0) + "_" + segments[0].getField(9).getComponent(1)));
      }
    }
  });

  return Message;
})();

module.exports = Message;