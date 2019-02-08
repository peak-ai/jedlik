class JedlikError extends Error {
  constructor(opts) {
    super(opts);
    this.name = this.constructor.name;
  }
}

class ValidationError extends Error {
  constructor(opts) {
    super(opts);
    this.name = this.constructor.name;
  }
}

module.exports = {
  JedlikError,
  ValidationError,
};
