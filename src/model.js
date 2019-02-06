const DocumentClient = require('./document-client');
const {
  getExpressionAttributeNames,
  getExpressionAttributeValues,
  getKeyConditionExpression,
} = require('./query-helpers');

class Model {
  constructor() {
    this.db = new DocumentClient({
      params: { TableName: this.constructor.tableName },
    });
  }

  static async query(key, index = null) {
    const params = {
      TableName: this.tableName,
      KeyConditionExpression: getKeyConditionExpression(key),
      ExpressionAttributeNames: getExpressionAttributeNames(key),
      ExpressionAttributeValues: getExpressionAttributeValues(key),
    };

    if (index) {
      params.IndexName = index;
    }

    const { Items } = await new DocumentClient().query(params);

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
    const { Item } = await new DocumentClient().get({
      TableName: this.tableName,
      Key: key,
    });

    if (!Item) {
      return null;
    }

    return new this(Item);
  }

  static async delete(key) {
    await new DocumentClient().delete({
      TableName: this.tableName,
      Key: key,
    });

    return null;
  }

  async save() {
    await this.db.put({ Item: this });
    return this;
  }
}

module.exports = Model;
