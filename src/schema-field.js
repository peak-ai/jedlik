const { JedlikError } = require('./errors');

const primitives = [String, Number, Boolean];

const setInt = value => (
  (parseInt(value, 10) || parseInt(value, 10) === 0) ? parseInt(value, 10) : null
);

const setMatch = (value) => {
  if (typeof value === 'function' || value.constructor === RegExp) {
    return value;
  }

  if (typeof value === 'string') {
    return new RegExp(value);
  }

  return null;
};

class SchemaField {
  constructor(opts) {
    if (!opts.type) {
      throw new JedlikError('"type" is a required field in SchemaField');
    }

    if (!primitives.includes(opts.type)) {
      throw new JedlikError('"type" should be a primitive type in SchemaField');
    }

    this.type = opts.type;
    this.required = Boolean(opts.required);
    this.min = null;
    this.max = null;
    this.minLength = null;
    this.maxLength = null;
    this.match = null;

    if (opts.type === Number) {
      this.min = setInt(opts.min);
      this.max = setInt(opts.max);
    }

    if (opts.type === String) {
      this.minLength = setInt(opts.minLength);
      this.maxLength = setInt(opts.maxLength);
      this.match = setMatch(opts.match);
    }
  }
}

module.exports = SchemaField;
