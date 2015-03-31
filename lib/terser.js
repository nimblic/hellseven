"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var TERSER_REGEX = /^([A-Za-z0-9]+)(?:\(([0-9]+)\))?(?:-([0-9]+)(?:\(([0-9]+)\))?(?:-([0-9]+)(?:-([0-9]+))?)?)?$/;

var Terser = (function () {
  function Terser(query) {
    _classCallCheck(this, Terser);

    this.query = query;

    var matches = TERSER_REGEX.exec(query);
    if (!matches) {
      throw new Error("invalid query syntax");
    }

    this.segment = matches[1];
    this.segmentRepetition = matches[2] ? parseInt(matches[2], 10) : 0;
    this.field = matches[3] ? parseInt(matches[3], 10) : null;
    this.fieldRepetition = matches[4] ? parseInt(matches[4], 10) : 0;
    this.component = matches[5] ? parseInt(matches[5], 10) : null;
    this.subcomponent = matches[6] ? parseInt(matches[6], 10) : null;
  }

  _createClass(Terser, {
    read: {
      value: function read(message) {
        var segment = message.getSegment(this.segment, this.segmentRepetition);

        if (segment === null) {
          return null;
        }

        if (this.field === null) {
          return segment;
        }

        var field = segment.getField(this.field, this.fieldRepetition);

        if (field === null) {
          return null;
        }

        if (this.component === null) {
          return field;
        }

        var component = field.getComponent(this.component);

        if (component === null) {
          return null;
        }

        if (this.subcomponent === null) {
          return component;
        }

        var subcomponent = component.getSubcomponent(this.subcomponent);

        return subcomponent;
      }
    }
  });

  return Terser;
})();

module.exports = Terser;