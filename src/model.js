const DocumentClient = require('./document-client');
const {
  getExpressionAttributeNames,
  getExpressionAttributeValues,
  getKeyConditionExpression,
} = require('./query-helpers');

module.exports = ({ TableName }) => {
  const db = new DocumentClient({
    params: { TableName },
  });

  class Model {
    constructor() {
      this.db = db;
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
      await this.db.put({ Item: this });
      return this;
    }
  }

  return Model;
};
