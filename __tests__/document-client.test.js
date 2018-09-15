const AWS = require('aws-sdk');
const DocumentClient = require('../src/document-client');

jest.mock('aws-sdk');

let data;
let error;
let params;

const successful = (p, callback) => {
  callback(null, data);
};

const unsuccessful = (p, callback) => {
  callback(error);
};

beforeEach(() => {
  AWS.DynamoDB.DocumentClient.mockClear();
  data = jest.fn();
  error = jest.fn();
  params = jest.fn();
});

describe('batchGet', () => {
  it('calls the AWS DocumentClient batchGet', () => {
    expect.assertions(1);
    DocumentClient.batchGet(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.batchGet).toHaveBeenCalledWith(params, expect.any(Function));
  });

  it('resolves with the data if batchGet operation is successful', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.batchGet.mockImplementation(successful);
    expect(DocumentClient.batchGet(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if batchGet operation errors', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.batchGet.mockImplementation(unsuccessful);
    expect(DocumentClient.batchGet(jest.fn())).rejects.toBe(error);
  });
});

describe('batchWrite', () => {
  it('calls the AWS DocumentClient batchWrite', () => {
    expect.assertions(1);
    DocumentClient.batchWrite(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.batchWrite).toHaveBeenCalledWith(params, expect.any(Function));
  });

  it('resolves with the data if batchWrite operation is successful', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.batchWrite.mockImplementation(successful);
    expect(DocumentClient.batchWrite(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if batchWrite operation errors', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.batchWrite.mockImplementation(unsuccessful);
    expect(DocumentClient.batchWrite(jest.fn())).rejects.toBe(error);
  });
});

describe('delete', () => {
  it('calls the AWS DocumentClient delete', () => {
    expect.assertions(1);
    DocumentClient.delete(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.delete).toHaveBeenCalledWith(params, expect.any(Function));
  });

  it('resolves with the data if delete operation is successful', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.delete.mockImplementation(successful);
    expect(DocumentClient.delete(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if delete operation errors', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.delete.mockImplementation(unsuccessful);
    expect(DocumentClient.delete(jest.fn())).rejects.toBe(error);
  });
});

describe('get', () => {
  it('calls the AWS DocumentClient get', () => {
    expect.assertions(1);
    DocumentClient.get(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.get).toHaveBeenCalledWith(params, expect.any(Function));
  });

  it('resolves with the data if get operation is successful', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.get.mockImplementation(successful);
    expect(DocumentClient.get(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if get operation errors', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.get.mockImplementation(unsuccessful);
    expect(DocumentClient.get(jest.fn())).rejects.toBe(error);
  });
});

describe('put', () => {
  it('calls the AWS DocumentClient put', () => {
    expect.assertions(1);
    DocumentClient.put(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.put).toHaveBeenCalledWith(params, expect.any(Function));
  });

  it('resolves with the data if put operation is successful', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.put.mockImplementation(successful);
    expect(DocumentClient.put(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if put operation errors', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.put.mockImplementation(unsuccessful);
    expect(DocumentClient.put(jest.fn())).rejects.toBe(error);
  });
});

describe('query', () => {
  it('calls the AWS DocumentClient query', () => {
    expect.assertions(1);
    DocumentClient.query(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.query).toHaveBeenCalledWith(params, expect.any(Function));
  });

  it('resolves with the data if query operation is successful', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.query.mockImplementation(successful);
    expect(DocumentClient.query(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if query operation errors', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.query.mockImplementation(unsuccessful);
    expect(DocumentClient.query(jest.fn())).rejects.toBe(error);
  });
});

describe('scan', () => {
  it('calls the AWS DocumentClient scan', () => {
    expect.assertions(1);
    DocumentClient.scan(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.scan).toHaveBeenCalledWith(params, expect.any(Function));
  });

  it('resolves with the data if scan operation is successful', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.scan.mockImplementation(successful);
    expect(DocumentClient.scan(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if scan operation errors', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.scan.mockImplementation(unsuccessful);
    expect(DocumentClient.scan(jest.fn())).rejects.toBe(error);
  });
});

describe('update', () => {
  it('calls the AWS DocumentClient update', () => {
    expect.assertions(1);
    DocumentClient.update(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.update).toHaveBeenCalledWith(params, expect.any(Function));
  });

  it('resolves with the data if update operation is successful', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.update.mockImplementation(successful);
    expect(DocumentClient.update(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if update operation errors', () => {
    expect.assertions(1);
    AWS.DynamoDB.DocumentClient.prototype.update.mockImplementation(unsuccessful);
    expect(DocumentClient.update(jest.fn())).rejects.toBe(error);
  });
});
