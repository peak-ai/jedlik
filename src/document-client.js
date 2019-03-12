const AWS = require('aws-sdk');
const {
  getExpressionAttributeNames,
  getExpressionAttributeValues,
  getKeyConditionExpression,
} = require('./query-helpers');

class DocumentClient extends AWS.DynamoDB.DocumentClient {
  constructor(params, table) {
    const clientConfig = {
      ...params,
      params: {
        ...params.params,
        TableName: table,
      },
    };
    super(clientConfig);
  }

  batchGet(params) {
    return super.batchGet(params).promise();
  }

  batchWrite(params) {
    return super.batchWrite(params).promise();
  }

  createSet(params) {
    return super.createSet(params).promise();
  }

  delete(params) {
    return super.delete(params).promise();
  }

  async get(params) {
    const res = await super.get(params).promise();
    if (!res || !res.Item) {
      return null;
    }
    return res.Item;
  }

  put(params) {
    return super.put(params).promise();
  }

  async query(key, index) {
    const params = {
      KeyConditionExpression: getKeyConditionExpression(key),
      ExpressionAttributeNames: getExpressionAttributeNames(key),
      ExpressionAttributeValues: getExpressionAttributeValues(key),
    };
    if (index) {
      params.IndexName = index;
    }
    const res = await super.query(params).promise();
    if (!res) {
      return null;
    }
    return res.Items;
  }

  async scan(params) {
    const res = await super.scan(params).promise();
    if (!res) {
      return null;
    }
    return res.Items;
  }

  transactGet(params) {
    return super.transactGet(params).promise();
  }

  transactWrite(params) {
    return super.transactWrite(params).promise();
  }

  update(params) {
    return super.update(params).promise();
  }
}

module.exports = DocumentClient;
