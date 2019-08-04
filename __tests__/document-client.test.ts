import { DynamoDB } from 'aws-sdk';
import DocumentClient from '../src/document-client';

jest.mock('aws-sdk');

const awsDocumentClient = (DynamoDB.DocumentClient as jest.Mock<DynamoDB.DocumentClient>);

const data = jest.fn();
const error = jest.fn();
const awsPromise = jest.fn();

const documentClient = new DocumentClient();

beforeEach(() => {
  awsDocumentClient.mockClear();
  jest.resetAllMocks();
});

describe('batchGet', () => {
  const params: DynamoDB.DocumentClient.BatchGetItemInput = {
    RequestItems: {
      Table: {
        Keys: [{ id: 1 }],
      },
    },
  };

  beforeEach(() => {
    awsDocumentClient.prototype.batchGet.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient batchGet', () => {
    expect.assertions(1);
    documentClient.batchGet(params);
    expect(awsDocumentClient.prototype.batchGet).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if batchGet operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.batchGet(params)).resolves.toBe(data);
  });

  it('rejects with the error if batchGet operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.batchGet(params)).rejects.toBe(error);
  });
});

describe('batchWrite', () => {
  const params: DynamoDB.DocumentClient.BatchWriteItemInput = {
    RequestItems: {
      Table: [{
        DeleteRequest: {
          Key: { id: 1 },
        },
      }],
    },
  };

  beforeEach(() => {
    awsDocumentClient.prototype.batchWrite.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient batchWrite', () => {
    expect.assertions(1);
    documentClient.batchWrite(params);
    expect(awsDocumentClient.prototype.batchWrite).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if batchWrite operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.batchWrite(params)).resolves.toBe(data);
  });

  it('rejects with the error if batchWrite operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.batchWrite(params)).rejects.toBe(error);
  });
});

describe('createSet', () => {
  const params = [1, 2, 3];

  it('calls the AWS DocumentClient createSet', () => {
    expect.assertions(1);
    documentClient.createSet(params);
    expect(awsDocumentClient.prototype.createSet).toHaveBeenCalledWith(params);
  });

  it('returns the result of AWS DocumentClient createSet', () => {
    expect.assertions(1);
    const expected = jest.fn();
    awsDocumentClient.prototype.createSet.mockReturnValue(expected);
    const result = documentClient.createSet(params);
    expect(result).toBe(expected);
  });
});

describe('delete', () => {
  const params: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
    Key: { id: 1 },
    TableName: 'table',
  };

  beforeEach(() => {
    awsDocumentClient.prototype.delete.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient delete', () => {
    expect.assertions(1);
    documentClient.delete(params);
    expect(awsDocumentClient.prototype.delete).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if delete operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.delete(params)).resolves.toBe(data);
  });

  it('rejects with the error if delete operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.delete(params)).rejects.toBe(error);
  });
});

describe('get', () => {
  const params: DynamoDB.DocumentClient.GetItemInput = {
    Key: { id: 1 },
    TableName: 'table',
  };

  beforeEach(() => {
    awsDocumentClient.prototype.get.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient get', () => {
    expect.assertions(1);
    documentClient.get(params);
    expect(awsDocumentClient.prototype.get).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if get operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.get(params)).resolves.toBe(data);
  });

  it('rejects with the error if get operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.get(params)).rejects.toBe(error);
  });
});

describe('put', () => {
  const params: DynamoDB.DocumentClient.PutItemInput = {
    Item: { id: 1 },
    TableName: 'table',
  };

  beforeEach(() => {
    awsDocumentClient.prototype.put.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient put', () => {
    expect.assertions(1);
    documentClient.put(params);
    expect(awsDocumentClient.prototype.put).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if put operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.put(params)).resolves.toBe(data);
  });

  it('rejects with the error if put operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.put(params)).rejects.toBe(error);
  });
});

describe('query', () => {
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: 'table',
  };

  beforeEach(() => {
    awsDocumentClient.prototype.query.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient query', () => {
    expect.assertions(1);
    documentClient.query(params);
    expect(awsDocumentClient.prototype.query).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if query operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.query(params)).resolves.toBe(data);
  });

  it('rejects with the error if query operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.query(params)).rejects.toBe(error);
  });
});

describe('scan', () => {
  const params: DynamoDB.DocumentClient.ScanInput = {
    TableName: 'table',
  };

  beforeEach(() => {
    awsDocumentClient.prototype.scan.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient scan', () => {
    expect.assertions(1);
    documentClient.scan(params);
    expect(awsDocumentClient.prototype.scan).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if scan operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.scan(params)).resolves.toBe(data);
  });

  it('rejects with the error if scan operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.scan(params)).rejects.toBe(error);
  });
});

describe('transactGet', () => {
  const params: DynamoDB.DocumentClient.TransactGetItemsInput = {
    TransactItems: [{
      Get: {
        Key: { id: 1 },
        TableName: 'table',
      },
    }],
  };

  beforeEach(() => {
    awsDocumentClient.prototype.transactGet.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient transactGet', () => {
    expect.assertions(1);
    documentClient.transactGet(params);
    expect(awsDocumentClient.prototype.transactGet).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if transactGet operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.transactGet(params)).resolves.toBe(data);
  });

  it('rejects with the error if transactGet operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.transactGet(params)).rejects.toBe(error);
  });
});

describe('transactWrite', () => {
  const params: DynamoDB.DocumentClient.TransactWriteItemsInput = {
    TransactItems: [{
      Delete: {
        Key: { id: 1 },
        TableName: 'table',
      },
    }],
  };

  beforeEach(() => {
    awsDocumentClient.prototype.transactWrite.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient transactWrite', () => {
    expect.assertions(1);
    documentClient.transactWrite(params);
    expect(awsDocumentClient.prototype.transactWrite).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if transactWrite operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.transactWrite(params)).resolves.toBe(data);
  });

  it('rejects with the error if transactWrite operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.transactWrite(params)).rejects.toBe(error);
  });
});

describe('update', () => {
  const params: DynamoDB.DocumentClient.UpdateItemInput = {
    Key: { id: 1 },
    TableName: 'table',
  };
  beforeEach(() => {
    awsDocumentClient.prototype.update.mockReturnValue({
      promise: awsPromise,
    });
  });

  it('calls the AWS DocumentClient update', () => {
    expect.assertions(1);
    documentClient.update(params);
    expect(awsDocumentClient.prototype.update).toHaveBeenCalledWith(params);
  });

  it('resolves with the data if update operation is successful', () => {
    awsPromise.mockResolvedValue(data);
    expect.assertions(1);
    expect(documentClient.update(params)).resolves.toBe(data);
  });

  it('rejects with the error if update operation errors', () => {
    expect.assertions(1);
    awsPromise.mockRejectedValue(error);
    expect(documentClient.update(params)).rejects.toBe(error);
  });
});
