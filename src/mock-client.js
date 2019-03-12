const { head } = require('lodash');

class MockClient {
  constructor({
    item,
    list,
    createError,
    updateError,
    deleteError,
  }) {
    this.item = item;
    this.list = list;
    this.createError = createError;
    this.updateError = updateError;
    this.deleteError = deleteError;
  }

  async create() {
    if (this.createError) {
      return new Error(this.createError);
    }
    return true;
  }

  async scan() {
    return this.list;
  }

  async query() {
    return this.list;
  }

  async first() {
    return head(this.list);
  }

  async get() {
    return this.item;
  }

  async delete() {
    if (this.deleteError) {
      return new Error(this.deleteError);
    }
    return true;
  }

  async put() {
    if (this.updateError) {
      return new Error(this.updateError);
    }
    return this.item;
  }
}

module.exports = MockClient;
