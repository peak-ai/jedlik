import moment from 'moment';
import DocumentClient from './document-client';
import { JedlikError } from './errors';
import applySchema from './apply-schema';
import {
  getExpressionAttributeNames,
  getExpressionAttributeValues,
  getKeyConditionExpression,
} from './query-helpers/index';

const defaults = {
  timestamps: false,
  dynamoConfig: {},
};

export default ({
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

    static get table() {
      return table;
    }

    static get db() {
      return db;
    }

    static async create(values) {
      const item = new this(values);
      return item.save();
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

      const payload = applySchema(schema, this, { timestamps });

      await this.db.put({ Item: payload });
      return this;
    }
  }

  return Model;
};
