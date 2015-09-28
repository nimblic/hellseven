import defs from '../data/defs.json';

import Component from './component';
import Field from './field';

export default class Segment {
  constructor(name, data={}) {
    this.name = name;
    this.fields = {};

    if (Array.isArray(data)) {
      this.setArray(data);
    } else {
      this.setObject(data);
    }
  }

  setObject(data) {
    // console.log("Segment.setObject data=%j", data);

    Object.getOwnPropertyNames(data).forEach(k => this.setByName(k, data[k]));

    return this;
  }

  setArray(data) {
    // console.log("Segment.setArray data=%j", data);

    data.forEach((v, i) => v && i && this.setByIndex(i, v));

    return this;
  }

  setByName(name, value) {
    // console.log("Segment.setByName name=%s value=%j", name, value);

    let segDef = defs.Segment[this.name][1];

    let fieldIdx = null;
    let fieldDef = null;
    for (let i=0;i<segDef.length;i++) {
      let f = defs.Field[segDef[i][0]];

      if (f && f[2].toLowerCase() === name.toLowerCase()) {
        fieldIdx = i+1;
        fieldDef = f;
      }
    }

    if (!fieldDef) {
      let options = segDef.map(s => defs.Field[s[0]][2].toLowerCase());
      throw new Error(`segment ${this.name} has no field ${name}; options are: ${options.join(', ')}`);
    }

    this.setByIndex(fieldIdx, value);
  }

  setByIndex(index, value) {
    // console.log("Segment.setByIndex index=%d value=%j", index, value);

    if (index === 0) {
      throw new Error("can't set the first field of a segment after creation");
    }

    if (this.fields[index]) {
      this.fields[index] = null;
    }

    this.addByIndex(index, value);
  }

  addByIndex(index, value) {
    // console.log("Segment.addByIndex index=%d value=%j", index, value);

    if (index === 0) {
      throw new Error("can't set the first field of a segment after creation");
    }

    if (typeof value === "object" && value.repeated) {
      value.repeated.forEach(this.addByIndex.bind(this, index));

      return;
    }

    let segDef = defs.Segment[this.name][1];
    if (!segDef[index]) {
      let options = segDef.map(s => defs.Field[s[0]][2].toLowerCase());
      throw new Error(`segment ${this.name} only has ${segDef.length} fields (${options.join(", ")}), but you tried to set field ${index} to ${JSON.stringify(value)}`);
    }

    value = Field.load(segDef[index-1][0], value);

    if (!this.fields[index]) {
      this.fields[index] = [];
    }

    this.fields[index].push(value);
  }

  getField(index, repetition=0) {
    return this.fields[index][repetition];
  }

  build() {
    // console.log("Segment.build");

    let a = [this.name];

    for (let i=1;i<defs.Segment[this.name][1].length;i++) {
      if (Object.hasOwnProperty.call(this.fields, i)) {
        a.push(this.fields[i].map(e => e.build()));
      } else {
        a.push(null);
      }
    }

    return a;
  }

  buildObject() {
    let a = {};

    for (let i=0;i<defs.Segment[this.name][1].length;i++) {
      let [min, max] = defs.Segment[this.name][1][i][1];

      if (Object.hasOwnProperty.call(this.fields, i)) {
        let k = this.fields[i][0].name.toLowerCase();

        a[k] = this.fields[i].map(e => e.buildObject());

        if (max === 1) {
          a[k] = a[k][0];
        }
      }
    }

    return [this.name, a];
  }

  compile() {
    // console.log("Segment.compile");

    let a = [this.name];

    for (let i=1;i<defs.Segment[this.name][1].length;i++) {
      if (this.name === "MSH" && i === 1) {
        continue;
      }

      if (Object.hasOwnProperty.call(this.fields, i)) {
        a.push(this.fields[i].map(e => e.compile()).join("~"));
      } else {
        a.push("");
      }
    }

    while (true) {
      if (a[a.length-1] !== "") {
        break;
      }

      a = a.slice(0, a.length-1);
    }

    return a.join("|");
  }

  static load(input) {
    // console.log("Segment.load input=%j", input);

    if (typeof input !== "object" || !input.segment) {
      input = {segment: [input]};
    }

    return new Segment(input.segment[0]).setArray(input.segment);
  }
}
