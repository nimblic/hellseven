import defs from '../data/defs.json';

import Component from './component';

export default class Field {
  constructor(id, data={}) {
    let fieldDef = defs.Field[id];

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

  toString() {
    return Object.getOwnPropertyNames(this.values).reduce((i, v) => i + this.values[v], "");
  }

  setObject(data) {
    console.log("Field.setObject data=%j", data);

    Object.getOwnPropertyNames(data).forEach(k => this.setByName(k, data[k]));

    return this;
  }

  setArray(data) {
    console.log("Field.setArray data=%j", data);

    data.forEach((v, i) => v && this.setByIndex(i, v));

    return this;
  }

  setByName(name, value) {
    console.log("Field.setByName name=%s value=%j", name, value);

    let fieldDef = defs.Field[this.id][1];

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

  setByIndex(index, value) {
    console.log("Field.setByIndex index=%d value=%j", index, value);

    let fieldDef = defs.Field[this.id];

    if (defs.Component[fieldDef[1]]) {
      let fieldTypeDef = defs.Component[fieldDef[1]][1];

      if (!fieldTypeDef[index]) {
        let options = fieldTypeDef.map(s => defs.Component[s[0]][2].toLowerCase());
        throw new Error(`segment ${this.id} only has ${fieldTypeDef.length} fields (${options.join(", ")}), but you tried to set field ${index} to ${JSON.stringify(value)}`);
      }

      let cmpTypeDef = defs.Component[fieldTypeDef[index][0]];

      this.values[index] = Component.load(cmpTypeDef[1], cmpTypeDef[2], value);
    } else {
      this.values[index] = Component.load(fieldDef[1], fieldDef[2], value);
    }
  }

  getComponent(index) {
    return this.values[index];
  }

  build() {
    console.log("Field.build");

    if (!defs.Component[this.type]) {
      return this.values[0].build();
    }

    let a = [];

    for (let i=0;i<defs.Field[this.id][1].length;i++) {
      if (this.values[i]) {
        a.push(this.values[i].build());
      } else {
        a.push(null);
      }
    }

    return a;
  }

  buildObject() {
    if (!defs.Component[this.type]) {
      return this.values[0].buildObject();
    }

    return Object.getOwnPropertyNames(this.values).reduce((i, v) => {
      i[this.values[v].name.toLowerCase()] = this.values[v].buildObject();
      return i;
    }, {});
  }

  compile() {
    console.log("Field.compile");

    if (!defs.Component[this.type]) {
      return this.values[0].compile();
    }

    let a = [];

    for (let i=0;i<defs.Component[this.type][1].length;i++) {
      if (this.values[i]) {
        a.push(this.values[i].compile());
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

    return a.join("^");
  }

  static load(id, input) {
    console.log("Field.load id=%s input=%j", id, input);

    if (typeof input !== "object" || !input.field) {
      input = {field: [input]};
    }

    return new Field(id).setArray(input.field);
  }
}
