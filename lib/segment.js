"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var defs = _interopRequire(require("../data/defs.json"));

var Segment = (function () {
  function Segment(name, data) {
    _classCallCheck(this, Segment);

    this.fields = {};

    this.name = name;

    if (data) {
      this.set(data);
    }
  }

  _createClass(Segment, {
    set: {
      value: function set(data) {
        var _this = this;

        Object.getOwnPropertyNames(data).forEach(function (k) {
          _this.setField(k, data[k]);
        });

        return this;
      }
    },
    setField: {
      value: function setField(name, value) {
        var segDef = defs.Segment[this.name][1];

        var fieldIdx = null;
        var fieldDef = null;
        for (var i = 0; i < segDef.length; i++) {
          var f = defs.Field[segDef[i][0]];

          if (f && f[2].toLowerCase() === name.toLowerCase()) {
            fieldIdx = i;
            fieldDef = f;
          }
        }

        if (!fieldDef) {
          var options = segDef.map(function (s) {
            return defs.Field[s[0]][2].toLowerCase();
          });
          throw new Error("segment " + this.name + " has no field " + name + "; available fields are: " + fields.join(", "));
        }

        this.fields[fieldIdx] = value;
      }
    }
  });

  return Segment;
})();

module.exports = Segment;