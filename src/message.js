import defs from '../data/defs.json';
import Segment from './segment';

export default class Message {
  constructor(name, segments) {
    this.name = name;
    this.segments = [];

    if (!defs.Message[name]) {
      const options = Object.getOwnPropertyNames(defs.Message);
      throw new Error(`message ${name} doesn't exist; options are: ${options.join(', ')}`);
    }

    if (segments) {
      segments.forEach(s => this.addSegment(this.createSegment(s[0], s[1])));
    }
  }

  addSegment(segment) {
    this.segments.push(segment);

    return this;
  }

  createSegment(name, props) {
    if (!defs.Message[this.name][1].reduce((i, v) => i || v[0] === name, false)) {
      const options = defs.Message[this.name][1].map(e => e[0]);
      throw new Error(`message ${this.name} has no segment ${name}; options are: ${options.join(', ')}`);
    }

    return new Segment(name, props);
  }
}
