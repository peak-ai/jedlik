const AWS = require('aws-sdk');
const DocumentClient = require('../src/document-client');

jest.mock('aws-sdk');

const data = jest.fn();
const error = jest.fn();
const params = jest.fn();
const awsPromise = jest.fn();

const documentClient = new DocumentClient();

beforeEach(() => {
  AWS.DynamoDB.DocumentClient.mockClear();
  jest.resetAllMocks();
});

describe('constructor', () => {
  it('is an instance of AWS.DynamoDB.DocumentClient', () => {
    expect(documentClient).toBeInstanceOf(AWS.DynamoDB.DocumentClient);
  });
});

describe('batchGet', () => {
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient.prototype.batchGet.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient batchGet', () => {
    expect.assertions(1);
    documentClient.batchGet(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.batchGet).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if batchGet operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.batchGet(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if batchGet operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.batchGet(jest.fn())).rejects.toBe(error);
  });
});

describe('batchWrite', () => {
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient.prototype.batchWrite.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient batchWrite', () => {
    expect.assertions(1);
    documentClient.batchWrite(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.batchWrite).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if batchWrite operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.batchWrite(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if batchWrite operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.batchWrite(jest.fn())).rejects.toBe(error);
  });
});

describe('createSet', () => {
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient.prototype.createSet.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient createSet', () => {
    expect.assertions(1);
    documentClient.createSet(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.createSet).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if createSet operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.createSet(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if createSet operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.createSet(jest.fn())).rejects.toBe(error);
  });
});

describe('delete', () => {
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient.prototype.delete.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient delete', () => {
    expect.assertions(1);
    documentClient.delete(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.delete).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if delete operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.delete(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if delete operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.delete(jest.fn())).rejects.toBe(error);
  });
});

describe('get', () => {
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient.prototype.get.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient get', () => {
    expect.assertions(1);
    documentClient.get(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.get).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if get operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.get(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if get operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.get(jest.fn())).rejects.toBe(error);
  });
});

describe('put', () => {
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient.prototype.put.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient put', () => {
    expect.assertions(1);
    documentClient.put(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.put).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if put operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.put(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if put operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.put(jest.fn())).rejects.toBe(error);
  });
});

describe('query', () => {
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient.prototype.query.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient query', () => {
    expect.assertions(1);
    documentClient.query(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.query).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if query operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.query(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if query operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.query(jest.fn())).rejects.toBe(error);
  });
});

describe('scan', () => {
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient.prototype.scan.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient scan', () => {
    expect.assertions(1);
    documentClient.scan(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.scan).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if scan operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.scan(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if scan operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.scan(jest.fn())).rejects.toBe(error);
  });
});

describe('transactGet', () => {
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient.prototype.transactGet.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient transactGet', () => {
    expect.assertions(1);
    documentClient.transactGet(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.transactGet).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if transactGet operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.transactGet(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if transactGet operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.transactGet(jest.fn())).rejects.toBe(error);
  });
});

describe('transactWrite', () => {
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient.prototype.transactWrite.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient transactWrite', () => {
    expect.assertions(1);
    documentClient.transactWrite(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.transactWrite).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if transactWrite operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.transactWrite(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if transactWrite operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.transactWrite(jest.fn())).rejects.toBe(error);
  });
});

describe('update', () => {
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient.prototype.update.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient update', () => {
    expect.assertions(1);
    documentClient.update(params);
    expect(AWS.DynamoDB.DocumentClient.prototype.update).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if update operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.update(jest.fn())).resolves.toBe(data);
  });

  it('rejects with the error if update operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.update(jest.fn())).rejects.toBe(error);
  });
});
