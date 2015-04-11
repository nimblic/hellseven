import defs from '../data/defs.json';
import Segment from './segment';
import Terser from './terser';

export default class Message {
  constructor(name, segments=[]) {
    this.name = name;
    this.segments = [];

    if (!defs.Message[name]) {
      const options = Object.getOwnPropertyNames(defs.Message).sort();
      throw new Error(`message ${name} doesn't exist; options are: ${options.join(', ')}`);
    }

    segments.forEach(s => this.addSegment(this.createSegment(s[0], s[1])));
  }

  createSegment(name, props) {
    if (!defs.Message[this.name][1].reduce((i, v) => i || v[0] === name, false)) {
      const options = defs.Message[this.name][1].map(e => e[0]);
      throw new Error(`message ${this.name} has no segment ${name}; options are: ${options.join(', ')}`);
    }

    return new Segment(name, props);
  }

  addSegment(segment) {
    this.segments.push(segment);

    return this;
  }

  getSegment(name, index=0) {
    let c = 0;
    for (let i=0;i<this.segments.length;i++) {
      if (this.segments[i].name === name) {
        if (c++ === index) {
          return this.segments[i];
        }
      }
    }
  }

  get(query) {
    return (new Terser(query)).read(this);
  }

  getString(query) {
    return this.get(query) + "";
  }

  build() {
    console.log("Message.build");

    return this.segments.map(e => e.build());
  }

  buildObject() {
    return [this.name, this.segments.map(e => e.buildObject())];
  }

  static load(input) {
    let segments = input.message.map(Segment.load);

    let name = segments[0].name;
    if (name !== "MSH") {
      throw new Error(`first segment of a message must be "MSH"; instead got ${name}`);
    }

    return segments.reduce((i, v) => i.addSegment(v), new Message(segments[0].getField(9).getComponent(0) + "_" + segments[0].getField(9).getComponent(1)));
  }
}
