const moment = require('moment');
const DocumentClient = require('./document-client');
const { JedlikError } = require('./errors');
const applySchema = require('./apply-schema');
const {
  getExpressionAttributeNames,
  getExpressionAttributeValues,
  getKeyConditionExpression,
  getCreateKeyConditionExpression,
} = require('./query-helpers');

const defaults = {
  timestamps: false,
  dynamoConfig: {},
};

module.exports = ({
  table,
  schema,
  dynamoConfig = defaults.dynamoConfig,
  timestamps = defaults.timestamps,
} = defaults) => {
  if (!table) {
    throw new JedlikError('"table" option is required.');
  }

  if (!schema) {
    throw new JedlikError('"schema" option is required.');
  }

  const clientConfig = {
    ...dynamoConfig,
    params: {
      ...dynamoConfig.params,
      TableName: table,
    },
  };

  const db = new DocumentClient(clientConfig);

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

    static async create(values, uniqKey) {
      const item = new this(values);
      return item.save(uniqKey);
    }

    static async query(key, index = null) {
      const params = {
        KeyConditionExpression: getKeyConditionExpression(key),
        ExpressionAttributeNames: getExpressionAttributeNames(key),
        ExpressionAttributeValues: getExpressionAttributeValues(key),
      };

      if (index) {
        params.IndexName = index;
      }

      const { Items } = await db.query(params);

      return Items.map(item => new this(item));
    }

    static async first(key, index = null) {
      const items = await this.query(key, index);

      if (items.length === 0) {
        return null;
      }

      return items[0];
    }

    static async get(key) {
      const { Item } = await db.get({
        Key: key,
      });

      if (!Item) {
        return null;
      }

      return new this(Item);
    }

    static async delete(key) {
      await db.delete({
        Key: key,
      });

      return null;
    }

    async save(uniqKey, exists = false) {
      if (timestamps) {
        const timestamp = (typeof timestamps === 'function' ? timestamps() : moment.utc().valueOf());
        if (this.createdAt) {
          this.updatedAt = timestamp;
        } else {
          this.createdAt = timestamp;
          this.updatedAt = null;
        }
      }

      const createParameters = {
        Item: this.toObject(),
      };

      if (uniqKey && !exists) {
        createParameters.KeyConditionExpression = getCreateKeyConditionExpression(uniqKey, exists);
      }

      if (uniqKey && exists) {
        createParameters.KeyConditionExpression = getCreateKeyConditionExpression(uniqKey, exists);
      }

      await this.db.put(createParameters);
      return this;
    }

    toObject() {
      return applySchema(schema, this, { timestamps });
    }
  }

  return Model;
};
