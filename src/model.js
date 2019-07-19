const moment = require('moment');
const DocumentClient = require('./document-client');
const { JedlikError } = require('./errors');
const applySchema = require('./apply-schema');

const defaults = {
  timestamps: false,
  config: {},
};

module.exports = ({
  table,
  schema,
  config = defaults.config,
  timestamps = defaults.timestamps,
  client = null,
} = defaults) => {
  if (!table) {
    throw new JedlikError('"table" option is required.');
  }

  if (!schema) {
    throw new JedlikError('"schema" option is required.');
  }

  let db = new DocumentClient(config, table);
  if (client != null) {
    db = client;
  }

  class Model {
    constructor() {
      this.db = db;
    }

    static get db() {
      return db;
    }

    static get table() {
      return table;
    }

    static async create(values) {
      const item = new this(values);
      return item.save();
    }

    static async query(key, index) {
      const items = await db.query(key, index);

      if (!items || items.length === 0) {
        return [];
      }
      return items.map(item => new this(item));
    }

    static async first(key, index) {
      const items = await this.query(key, index);

      if (!items || items.length === 0) {
        return null;
      }

      return items[0];
    }

    static async get(key) {
      const item = await db.get({
        Key: key,
      });

      if (!item) {
        return null;
      }

      return new this(item);
    }

    static async delete(key) {
      await db.delete({
        Key: key,
      });

      return null;
    }

    async save() {
      if (timestamps) {
        const timestamp = (typeof timestamps === 'function' ? timestamps() : moment.utc().valueOf());
        if (this.createdAt) {
          this.updatedAt = timestamp;
        } else {
          this.createdAt = timestamp;
          this.updatedAt = null;
        }
      }

      await this.db.put({ Item: this.toObject() });
      return this;
    }

    toObject() {
      return applySchema(schema, this, { timestamps });
    }
  }

  return Model;
};
