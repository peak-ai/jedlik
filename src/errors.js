export class JedlikError extends Error {
  constructor(opts) {
    super(opts);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends Error {
  constructor(opts) {
    super(opts);
    this.name = this.constructor.name;
  }
}
