"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var defs = _interopRequire(require("../data/defs.json"));

var Component = _interopRequire(require("./component"));

var Field = _interopRequire(require("./field"));

var Segment = (function () {
  function Segment(name) {
    var data = arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Segment);

    this.name = name;
    this.fields = {};

    if (Array.isArray(data)) {
      this.setArray(data);
    } else {
      this.setObject(data);
    }
  }

  _createClass(Segment, {
    setObject: {
      value: function setObject(data) {
        var _this = this;

        // console.log("Segment.setObject data=%j", data);

        Object.getOwnPropertyNames(data).forEach(function (k) {
          return _this.setByName(k, data[k]);
        });

        return this;
      }
    },
    setArray: {
      value: function setArray(data) {
        var _this = this;

        // console.log("Segment.setArray data=%j", data);

        data.forEach(function (v, i) {
          return v && i && _this.setByIndex(i, v);
        });

        return this;
      }
    },
    setByName: {
      value: function setByName(name, value) {
        // console.log("Segment.setByName name=%s value=%j", name, value);

        var segDef = defs.Segment[this.name][1];

        var fieldIdx = null;
        var fieldDef = null;
        for (var i = 0; i < segDef.length; i++) {
          var f = defs.Field[segDef[i][0]];

          if (f && f[2].toLowerCase() === name.toLowerCase()) {
            fieldIdx = i + 1;
            fieldDef = f;
          }
        }

        if (!fieldDef) {
          var options = segDef.map(function (s) {
            return defs.Field[s[0]][2].toLowerCase();
          });
          throw new Error("segment " + this.name + " has no field " + name + "; options are: " + options.join(", "));
        }

        this.setByIndex(fieldIdx, value);
      }
    },
    setByIndex: {
      value: function setByIndex(index, value) {
        // console.log("Segment.setByIndex index=%d value=%j", index, value);

        if (index === 0) {
          throw new Error("can't set the first field of a segment after creation");
        }

        if (this.fields[index]) {
          this.fields[index] = null;
        }

        this.addByIndex(index, value);
      }
    },
    addByIndex: {
      value: function addByIndex(index, value) {
        // console.log("Segment.addByIndex index=%d value=%j", index, value);

        if (index === 0) {
          throw new Error("can't set the first field of a segment after creation");
        }

        if (typeof value === "object" && value.repeated) {
          value.repeated.forEach(this.addByIndex.bind(this, index));

          return;
        }

        var segDef = defs.Segment[this.name][1];
        if (!segDef[index]) {
          var options = segDef.map(function (s) {
            return defs.Field[s[0]][2].toLowerCase();
          });
          throw new Error("segment " + this.name + " only has " + segDef.length + " fields (" + options.join(", ") + "), but you tried to set field " + index + " to " + JSON.stringify(value));
        }

        value = Field.load(segDef[index - 1][0], value);

        if (!this.fields[index]) {
          this.fields[index] = [];
        }

        this.fields[index].push(value);
      }
    },
    getField: {
      value: function getField(index) {
        var repetition = arguments[1] === undefined ? 0 : arguments[1];

        return this.fields[index][repetition];
      }
    },
    build: {
      value: function build() {
        // console.log("Segment.build");

        var a = [this.name];

        for (var i = 1; i < defs.Segment[this.name][1].length; i++) {
          if (Object.hasOwnProperty.call(this.fields, i)) {
            a.push(this.fields[i].map(function (e) {
              return e.build();
            }));
          } else {
            a.push(null);
          }
        }

        return a;
      }
    },
    buildObject: {
      value: function buildObject() {
        var a = {};

        for (var i = 0; i < defs.Segment[this.name][1].length; i++) {
          var _defs$Segment$name$1$i$1 = _slicedToArray(defs.Segment[this.name][1][i][1], 2);

          var min = _defs$Segment$name$1$i$1[0];
          var max = _defs$Segment$name$1$i$1[1];

          if (Object.hasOwnProperty.call(this.fields, i)) {
            var k = this.fields[i][0].name.toLowerCase();

            a[k] = this.fields[i].map(function (e) {
              return e.buildObject();
            });

            if (max === 1) {
              a[k] = a[k][0];
            }
          }
        }

        return [this.name, a];
      }
    },
    compile: {
      value: function compile() {
        // console.log("Segment.compile");

        var a = [this.name];

        for (var i = 1; i < defs.Segment[this.name][1].length; i++) {
          if (this.name === "MSH" && i === 1) {
            continue;
          }

          if (Object.hasOwnProperty.call(this.fields, i)) {
            a.push(this.fields[i].map(function (e) {
              return e.compile();
            }).join("~"));
          } else {
            a.push("");
          }
        }

        while (true) {
          if (a[a.length - 1] !== "") {
            break;
          }

          a = a.slice(0, a.length - 1);
        }

        return a.join("|");
      }
    }
  }, {
    load: {
      value: function load(input) {
        // console.log("Segment.load input=%j", input);

        if (typeof input !== "object" || !input.segment) {
          input = { segment: [input] };
        }

        return new Segment(input.segment[0]).setArray(input.segment);
      }
    }
  });

  return Segment;
})();

module.exports = Segment;