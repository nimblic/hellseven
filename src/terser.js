const TERSER_REGEX = /^([A-Za-z0-9]+)(?:\(([0-9]+)\))?(?:-([0-9]+)(?:\(([0-9]+)\))?(?:-([0-9]+)(?:-([0-9]+))?)?)?$/;

export default class Terser {
  constructor(query) {
    this.query = query;

    let matches = TERSER_REGEX.exec(query);
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

  read(message) {
    let segment = message.getSegment(this.segment, this.segmentRepetition);

    if (segment === null) {
      return null;
    }

    if (this.field === null) {
      return segment;
    }

    let field = segment.getField(this.field, this.fieldRepetition);

    if (field === null) {
      return null;
    }

    if (this.component === null) {
      return field;
    }

    let component = field.getComponent(this.component);

    if (component === null) {
      return null;
    }

    if (this.subcomponent === null) {
      return component;
    }

    let subcomponent = component.getSubcomponent(this.subcomponent);

    return subcomponent;
  }
}
