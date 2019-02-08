const AWS = require('aws-sdk');

class DocumentClient extends AWS.DynamoDB.DocumentClient {
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

  get(params) {
    return super.get(params).promise();
  }

  put(params) {
    return super.put(params).promise();
  }

  query(params) {
    return super.query(params).promise();
  }

  scan(params) {
    return super.scan(params).promise();
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
