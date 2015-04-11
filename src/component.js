import defs from '../data/defs.json';

export default class Component {
  constructor(type, name, data={}) {
    this.type = type;
    this.name = name;
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
    console.log("Component.setObject data=%j", data);

    Object.getOwnPropertyNames(data).forEach(k => this.setByName(k, data[k]));

    return this;
  }

  setArray(data) {
    console.log("Component.setArray data=%j", data);

    data.forEach((v, i) => v && this.setByIndex(i, v));

    return this;
  }

  setByName(name, value) {
    console.log("Component.setByName name=%s value=%j", name, value);
  }

  setByIndex(index, value) {
    console.log("Component.setByIndex index=%d value=%j", index, value);

    if (typeof value === "object" && value.message_code === "ACK") {
      debugger;
    }

    if (defs.Component[this.type]) {
      let cmpTypeDef = defs.Component[this.type][1];

      console.log("cmpTypeDef=%j", cmpTypeDef);

      if (!cmpTypeDef[index]) {
        let options = cmpTypeDef.map(s => defs.Component[s[0]][2].toLowerCase());
        throw new Error(`segment ${this.name} only has ${cmpTypeDef.length} fields (${options.join(", ")}), but you tried to set field ${index} to ${JSON.stringify(value)}`);
      }

      let subTypeDef = defs.Component[cmpTypeDef[index][0]];

      this.values[index] = Component.load(subTypeDef[1], subTypeDef[2], value);
    } else {
      this.values[index] = value;
    }
  }

  getSubcomponent(index) {
    return this.values[index];
  }

  build() {
    console.log("Component.build");

    let cmpDef = defs.Component[this.type];

    if (!cmpDef) {
      return this.values[0];
    }

    let a = [];

    for (let i=0;i<cmpDef[1].length;i++) {
      if (Object.hasOwnProperty.call(this.values, i)) {
        a.push(this.values[i].build());
      } else {
        a.push(null);
      }
    }

    return a;
  }

  buildObject() {
    let cmpDef = defs.Component[this.type];

    if (!cmpDef) {
      return this.values[0];
    }

    return Object.getOwnPropertyNames(this.values).reduce((i, v) => {
      i[defs.Component[cmpDef[1][v][0]][2].toLowerCase()] = this.values[v].buildObject();
      return i;
    }, {});
  }

  static load(type, name, input) {
    console.log("Component.load type=%s name=%s input=%j", type, name, input);

    if (typeof input !== "object" || !input.component) {
      input = {component: [input]};
    }

    return new Component(type, name).setArray(input.component);
  }
}
