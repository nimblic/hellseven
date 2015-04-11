"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var defs = _interopRequire(require("../data/defs.json"));

var Component = _interopRequire(require("./component"));

var Field = (function () {
  function Field(id) {
    var data = arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Field);

    var fieldDef = defs.Field[id];

    this.id = id;
    this.type = fieldDef[1];
    this.name = fieldDef[2];
    this.values = {};

    if (Array.isArray(data)) {
      this.setArray(data);
    } else {
      this.setObject(data);
    }
  }

  _createClass(Field, {
    toString: {
      value: function toString() {
        var _this = this;

        return Object.getOwnPropertyNames(this.values).reduce(function (i, v) {
          return i + _this.values[v];
        }, "");
      }
    },
    setObject: {
      value: function setObject(data) {
        var _this = this;

        console.log("Field.setObject data=%j", data);

        Object.getOwnPropertyNames(data).forEach(function (k) {
          return _this.setByName(k, data[k]);
        });

        return this;
      }
    },
    setArray: {
      value: function setArray(data) {
        var _this = this;

        console.log("Field.setArray data=%j", data);

        data.forEach(function (v, i) {
          return v && _this.setByIndex(i, v);
        });

        return this;
      }
    },
    setByName: {
      value: function setByName(name, value) {
        console.log("Field.setByName name=%s value=%j", name, value);

        var fieldDef = defs.Field[this.id][1];

        // let fieldIdx = null;
        // let fieldDef = null;
        // for (let i=0;i<segDef.length;i++) {
        //   let f = defs.Field[segDef[i][0]];

        //   if (f && f[2].toLowerCase() === name.toLowerCase()) {
        //     fieldIdx = i;
        //     fieldDef = f;
        //   }
        // }

        // if (!fieldDef) {
        //   let options = segDef.map(s => defs.Field[s[0]][2].toLowerCase());
        //   throw new Error(`segment ${this.id} has no field ${name}; options are: ${options.join(', ')}`);
        // }

        // this.setByIndex(fieldIdx, value);
      }
    },
    setByIndex: {
      value: function setByIndex(index, value) {
        console.log("Field.setByIndex index=%d value=%j", index, value);

        var fieldDef = defs.Field[this.id];

        if (defs.Component[fieldDef[1]]) {
          var fieldTypeDef = defs.Component[fieldDef[1]][1];

          if (!fieldTypeDef[index]) {
            var options = fieldTypeDef.map(function (s) {
              return defs.Component[s[0]][2].toLowerCase();
            });
            throw new Error("segment " + this.id + " only has " + fieldTypeDef.length + " fields (" + options.join(", ") + "), but you tried to set field " + index + " to " + JSON.stringify(value));
          }

          var cmpTypeDef = defs.Component[fieldTypeDef[index][0]];

          this.values[index] = Component.load(cmpTypeDef[1], cmpTypeDef[2], value);
        } else {
          this.values[index] = Component.load(fieldDef[1], fieldDef[2], value);
        }
      }
    },
    getComponent: {
      value: function getComponent(index) {
        return this.values[index];
      }
    },
    build: {
      value: function build() {
        console.log("Field.build");

        if (!defs.Component[this.type]) {
          return this.values[0].build();
        }

        var a = [];

        for (var i = 0; i < defs.Field[this.id][1].length; i++) {
          if (this.values[i]) {
            a.push(this.values[i].build());
          } else {
            a.push(null);
          }
        }

        return a;
      }
    },
    buildObject: {
      value: function buildObject() {
        var _this = this;

        if (!defs.Component[this.type]) {
          return this.values[0].buildObject();
        }

        return Object.getOwnPropertyNames(this.values).reduce(function (i, v) {
          i[_this.values[v].name.toLowerCase()] = _this.values[v].buildObject();
          return i;
        }, {});
      }
    },
    compile: {
      value: function compile() {
        console.log("Field.compile");

        if (!defs.Component[this.type]) {
          return this.values[0].compile();
        }

        var a = [];

        for (var i = 0; i < defs.Component[this.type][1].length; i++) {
          if (this.values[i]) {
            a.push(this.values[i].compile());
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

        return a.join("^");
      }
    }
  }, {
    load: {
      value: function load(id, input) {
        console.log("Field.load id=%s input=%j", id, input);

        if (typeof input !== "object" || !input.field) {
          input = { field: [input] };
        }

        return new Field(id).setArray(input.field);
      }
    }
  });

  return Field;
})();

module.exports = Field;