import defs from '../data/defs.json';

export default class Segment {
  constructor(name, data) {
    this.fields = {};

    this.name = name;

    if (data) {
      this.set(data);
    }
  }

  set(data) {
    Object.getOwnPropertyNames(data).forEach(k => {
      this.setField(k, data[k]);
    });

    return this;
  }

  setField(name, value) {
    const segDef = defs.Segment[this.name][1];

    let fieldIdx = null;
    let fieldDef = null;
    for (let i=0;i<segDef.length;i++) {
      let f = defs.Field[segDef[i][0]];

      if (f && f[2].toLowerCase() === name.toLowerCase()) {
        fieldIdx = i;
        fieldDef = f;
      }
    }

    if (!fieldDef) {
      const options = segDef.map(s => defs.Field[s[0]][2].toLowerCase());
      throw new Error(`segment ${this.name} has no field ${name}; available fields are: ${fields.join(', ')}`);
    }

    this.fields[fieldIdx] = value;
  }
}
