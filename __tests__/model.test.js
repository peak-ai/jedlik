const Model = require('../src/model');
const DocumentClient = require('../src/document-client');
const QueryHelpers = require('../src/query-helpers');

jest.mock('../src/document-client');
jest.mock('../src/query-helpers');

class TestClass extends Model {
  static get tableName() {
    return 'test-table';
  }

  constructor({ id, date, foobar }) {
    super();
    this.id = id;
    this.date = date;
    this.foobar = foobar;
  }
}

let mockExpressionAttributeNames;
let mockExpressionAttributeValues;
let mockKeyConditionExpression;

beforeEach(() => {
  jest.resetAllMocks();

  mockExpressionAttributeNames = jest.fn();
  mockExpressionAttributeValues = jest.fn();
  mockKeyConditionExpression = jest.fn();

  QueryHelpers.getExpressionAttributeNames.mockReturnValue(mockExpressionAttributeNames);
  QueryHelpers.getExpressionAttributeValues.mockReturnValue(mockExpressionAttributeValues);
  QueryHelpers.getKeyConditionExpression.mockReturnValue(mockKeyConditionExpression);
});

describe('instance methods', () => {
  let item;
  beforeEach(() => {
    item = new TestClass({ id: 123, date: 111, foobar: 'foo' });
  });
  describe('save', () => {
    it('makes correct put request to the document client with the instance', () => {
      item.save();
      expect(DocumentClient.put).toHaveBeenCalledWith({
        TableName: TestClass.tableName,
        Item: item,
      });
    });

    it('resolves with the instance', (done) => {
      expect.assertions(1);
      DocumentClient.put.mockResolvedValue(null);
      item.save().then((data) => {
        expect(data).toBe(item);
        done();
      });
    });

    it('rejects with the document client error', (done) => {
      expect.assertions(1);
      const error = jest.fn();
      DocumentClient.put.mockRejectedValue(error);
      item.save().catch((e) => {
        expect(e).toBe(error);
        done();
      });
    });
  });
});

describe('query', () => {
  it('resolves with instances of the model from the returned data', (done) => {
    const Items = [
      { id: 123, date: 111, foobar: 'foo' },
      { id: 456, date: 222, foobar: 'bar' },
    ];
    DocumentClient.query.mockResolvedValue({ Items });
    expect.assertions(Items.length * 2);
    TestClass.query(jest.fn()).then((items) => {
      items.forEach((item, i) => {
        expect(item).toBeInstanceOf(TestClass);
        expect(item).toEqual(items[i]);
      });
      done();
    });
  });

  it('rejects with the document client error', (done) => {
    expect.assertions(1);
    const error = jest.fn();
    DocumentClient.query.mockRejectedValue(error);
    TestClass.query(jest.fn()).catch((e) => {
      expect(e).toBe(error);
      done();
    });
  });

  describe('query structure', () => {
    beforeEach(() => {
      DocumentClient.query.mockResolvedValue({ Items: [] });
    });

    it('executes the correct query', () => {
      TestClass.query({ id: 123 });
      expect(DocumentClient.query).toHaveBeenCalledWith({
        TableName: TestClass.tableName,
        KeyConditionExpression: mockKeyConditionExpression,
        ExpressionAttributeNames: mockExpressionAttributeNames,
        ExpressionAttributeValues: mockExpressionAttributeValues,
      });
    });

    it('queries the given index', () => {
      TestClass.query({ test: 'foobar' }, 'test-index');
      expect(DocumentClient.query).toHaveBeenCalledWith({
        TableName: TestClass.tableName,
        IndexName: 'test-index',
        KeyConditionExpression: mockKeyConditionExpression,
        ExpressionAttributeNames: mockExpressionAttributeNames,
        ExpressionAttributeValues: mockExpressionAttributeValues,
      });
    });
  });
});

describe('first', () => {
  it('resolves with an instance of the model from the first returned item', (done) => {
    const Items = [
      { id: 123, date: 111, foobar: 'foo' },
      { id: 456, date: 222, foobar: 'bar' },
    ];
    DocumentClient.query.mockResolvedValue({ Items });
    expect.assertions(2);
    TestClass.first(jest.fn()).then((item) => {
      expect(item).toBeInstanceOf(TestClass);
      expect(item).toEqual(Items[0]);
      done();
    });
  });

  it('rejects with the document client error', (done) => {
    expect.assertions(1);
    const error = jest.fn();
    DocumentClient.query.mockRejectedValue(error);
    TestClass.first(jest.fn()).catch((e) => {
      expect(e).toBe(error);
      done();
    });
  });

  describe('query structure', () => {
    beforeEach(() => {
      DocumentClient.query.mockResolvedValue({ Items: [] });
    });

    it('executes the correct basic query', () => {
      TestClass.first({ id: 123 });
      expect(DocumentClient.query).toHaveBeenCalledWith({
        TableName: TestClass.tableName,
        KeyConditionExpression: mockKeyConditionExpression,
        ExpressionAttributeNames: mockExpressionAttributeNames,
        ExpressionAttributeValues: mockExpressionAttributeValues,
      });
    });

    it('queries the given index', () => {
      TestClass.first({ test: 'foobar' }, 'test-index');
      expect(DocumentClient.query).toHaveBeenCalledWith({
        TableName: TestClass.tableName,
        IndexName: 'test-index',
        KeyConditionExpression: mockKeyConditionExpression,
        ExpressionAttributeNames: mockExpressionAttributeNames,
        ExpressionAttributeValues: mockExpressionAttributeValues,
      });
    });
  });
});

describe('get', () => {
  it('resolves with instances of the model from the returned data', (done) => {
    const Item = { id: 123, date: 111, foobar: 'foo' };
    DocumentClient.get.mockResolvedValue({ Item });
    expect.assertions(2);
    TestClass.get(jest.fn()).then((item) => {
      expect(item).toBeInstanceOf(TestClass);
      expect(item).toEqual(Item);
      done();
    });
  });

  it('resolves with null if the item is not found', (done) => {
    DocumentClient.get.mockResolvedValue({});
    expect.assertions(1);
    TestClass.get(jest.fn()).then((item) => {
      expect(item).toBeNull();
      done();
    });
  });

  it('rejects with the document client error', (done) => {
    expect.assertions(1);
    const error = jest.fn();
    DocumentClient.get.mockRejectedValue(error);
    TestClass.get(jest.fn()).catch((e) => {
      expect(e).toBe(error);
      done();
    });
  });

  it('executes the correct query', () => {
    DocumentClient.get.mockResolvedValue(jest.fn());
    TestClass.get({ id: 123 });
    expect(DocumentClient.get).toHaveBeenCalledWith({
      TableName: TestClass.tableName,
      Key: { id: 123 },
    });
  });
});

describe('delete', () => {
  it('resolves with null if the delete request is successful', (done) => {
    DocumentClient.delete.mockResolvedValue(jest.fn());
    expect.assertions(1);
    TestClass.delete(jest.fn()).then((result) => {
      expect(result).toBeNull();
      done();
    });
  });

  it('rejects with the error if the delete errors', (done) => {
    const error = jest.fn();
    DocumentClient.delete.mockRejectedValue(error);
    expect.assertions(1);
    TestClass.delete(jest.fn()).catch((e) => {
      expect(e).toBe(error);
      done();
    });
  });

  it('invokes the delete operation with the correct parameters', () => {
    DocumentClient.delete.mockResolvedValue(jest.fn());
    TestClass.delete({ id: 123 });
    expect(DocumentClient.delete).toHaveBeenCalledWith({
      TableName: TestClass.tableName,
      Key: { id: 123 },
    });
  });
});
