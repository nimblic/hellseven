"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var defs = _interopRequire(require("../data/defs.json"));

var Component = (function () {
  function Component(type, name) {
    var data = arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, Component);

    this.type = type;
    this.name = name;
    this.values = {};

    if (Array.isArray(data)) {
      this.setArray(data);
    } else {
      this.setObject(data);
    }
  }

  _createClass(Component, {
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

        console.log("Component.setObject data=%j", data);

        Object.getOwnPropertyNames(data).forEach(function (k) {
          return _this.setByName(k, data[k]);
        });

        return this;
      }
    },
    setArray: {
      value: function setArray(data) {
        var _this = this;

        console.log("Component.setArray data=%j", data);

        data.forEach(function (v, i) {
          return v && _this.setByIndex(i, v);
        });

        return this;
      }
    },
    setByName: {
      value: function setByName(name, value) {
        console.log("Component.setByName name=%s value=%j", name, value);
      }
    },
    setByIndex: {
      value: function setByIndex(index, value) {
        console.log("Component.setByIndex index=%d value=%j", index, value);

        if (typeof value === "object" && value.message_code === "ACK") {
          debugger;
        }

        if (defs.Component[this.type]) {
          var cmpTypeDef = defs.Component[this.type][1];

          console.log("cmpTypeDef=%j", cmpTypeDef);

          if (!cmpTypeDef[index]) {
            var options = cmpTypeDef.map(function (s) {
              return defs.Component[s[0]][2].toLowerCase();
            });
            throw new Error("segment " + this.name + " only has " + cmpTypeDef.length + " fields (" + options.join(", ") + "), but you tried to set field " + index + " to " + JSON.stringify(value));
          }

          var subTypeDef = defs.Component[cmpTypeDef[index][0]];

          this.values[index] = Component.load(subTypeDef[1], subTypeDef[2], value);
        } else {
          this.values[index] = value;
        }
      }
    },
    getSubcomponent: {
      value: function getSubcomponent(index) {
        return this.values[index];
      }
    },
    build: {
      value: function build() {
        console.log("Component.build");

        var cmpDef = defs.Component[this.type];

        if (!cmpDef) {
          return this.values[0];
        }

        var a = [];

        for (var i = 0; i < cmpDef[1].length; i++) {
          if (Object.hasOwnProperty.call(this.values, i)) {
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

        var cmpDef = defs.Component[this.type];

        if (!cmpDef) {
          return this.values[0];
        }

        return Object.getOwnPropertyNames(this.values).reduce(function (i, v) {
          i[defs.Component[cmpDef[1][v][0]][2].toLowerCase()] = _this.values[v].buildObject();
          return i;
        }, {});
      }
    },
    compile: {
      value: function compile() {
        console.log("Component.compile");

        var cmpDef = defs.Component[this.type];

        if (!cmpDef) {
          return this.values[0];
        }

        var a = [];

        for (var i = 0; i < cmpDef[1].length; i++) {
          if (Object.hasOwnProperty.call(this.values, i)) {
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

        return a.join("&");
      }
    }
  }, {
    load: {
      value: function load(type, name, input) {
        console.log("Component.load type=%s name=%s input=%j", type, name, input);

        if (typeof input !== "object" || !input.component) {
          input = { component: [input] };
        }

        return new Component(type, name).setArray(input.component);
      }
    }
  });

  return Component;
})();

module.exports = Component;