const AWS = require('aws-sdk');

const callback = (resolve, reject) => (error, data) => {
  if (error) {
    reject(error);
  } else {
    resolve(data);
  }
};

class DocumentClient extends AWS.DynamoDB.DocumentClient {
  batchGet(params) {
    return new Promise((resolve, reject) => {
      super.batchGet(params, callback(resolve, reject));
    });
  }

  batchWrite(params) {
    return new Promise((resolve, reject) => {
      super.batchWrite(params, callback(resolve, reject));
    });
  }

  delete(params) {
    return new Promise((resolve, reject) => {
      super.delete(params, callback(resolve, reject));
    });
  }

  get(params) {
    return new Promise((resolve, reject) => {
      super.get(params, callback(resolve, reject));
    });
  }

  put(params) {
    return new Promise((resolve, reject) => {
      super.put(params, callback(resolve, reject));
    });
  }

  query(params) {
    return new Promise((resolve, reject) => {
      super.query(params, callback(resolve, reject));
    });
  }

  scan(params) {
    return new Promise((resolve, reject) => {
      super.scan(params, callback(resolve, reject));
    });
  }

  update(params) {
    return new Promise((resolve, reject) => {
      super.update(params, callback(resolve, reject));
    });
  }
}

module.exports = new DocumentClient();
