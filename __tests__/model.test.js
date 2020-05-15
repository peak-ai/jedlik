const ModelWrapper = require('../src/model');
const DocumentClient = require('../src/document-client');
const QueryHelpers = require('../src/query-helpers');

jest.mock('../src/document-client');
jest.mock('../src/query-helpers');

let mockExpressionAttributeNames;
let mockExpressionAttributeValues;
let mockKeyConditionExpression;
let mockFilterExpression;

beforeEach(() => {
  jest.resetAllMocks();

  mockExpressionAttributeNames = jest.fn();
  mockExpressionAttributeValues = jest.fn();
  mockKeyConditionExpression = jest.fn();
  mockFilterExpression = jest.fn();

  QueryHelpers.getExpressionAttributeNames.mockReturnValue(mockExpressionAttributeNames);
  QueryHelpers.getExpressionAttributeValues.mockReturnValue(mockExpressionAttributeValues);
  QueryHelpers.getKeyConditionExpression.mockReturnValue(mockKeyConditionExpression);
  QueryHelpers.getFilterExpression.mockReturnValue(mockFilterExpression);
});

const schema = {
  id: { required: true },
  date: { required: true },
  foobar: { required: true },
};

const fields = { id: 123, date: 111, foobar: 'foo' };

describe('module initialization', () => {
  it('constructs a new DocumentClient bound to the given table name', () => {
    ModelWrapper({ table: 'TEST', schema });
    expect(DocumentClient).toHaveBeenCalledWith({
      params: { TableName: 'TEST' },
    });
  });
});

describe('constructor', () => {
  it('has a db property which is an instance of DocumentClient bound to the model\'s table', () => {
    const db = jest.fn();

    DocumentClient.mockImplementationOnce(() => db);

    const Model = ModelWrapper({ table: 'TEST', schema });

    class TestClass extends Model {
      constructor({ id, date, foobar }) {
        super();
        this.id = id;
        this.date = date;
        this.foobar = foobar;
      }
    }

    const item = new TestClass(fields);
    expect(item.db).toBe(db);
  });
});

describe('methods', () => {
  const Model = ModelWrapper({ table: 'TEST', schema });

  class TestClass extends Model {
    constructor({ id, date, foobar }) {
      super();
      this.id = id;
      this.date = date;
      this.foobar = foobar;
    }
  }

  describe('static methods', () => {
    describe('query', () => {
      it('resolves with instances of the model from the returned data', (done) => {
        const Items = [
          { id: 123, date: 111, foobar: 'foo' },
          { id: 456, date: 222, foobar: 'bar' },
        ];
        DocumentClient.prototype.query.mockResolvedValue({ Items });
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
        DocumentClient.prototype.query.mockRejectedValue(error);
        TestClass.query(jest.fn()).catch((e) => {
          expect(e).toBe(error);
          done();
        });
      });

      describe('query structure', () => {
        beforeEach(() => {
          DocumentClient.prototype.query.mockResolvedValue({ Items: [] });
        });

        it('executes the correct query', () => {
          TestClass.query({ id: 123 });
          expect(DocumentClient.prototype.query).toHaveBeenCalledWith({
            KeyConditionExpression: mockKeyConditionExpression,
            ExpressionAttributeNames: mockExpressionAttributeNames,
            ExpressionAttributeValues: mockExpressionAttributeValues,
          });
        });

        it('queries the given index', () => {
          TestClass.query({ test: 'foobar' }, 'test-index');
          expect(DocumentClient.prototype.query).toHaveBeenCalledWith({
            IndexName: 'test-index',
            KeyConditionExpression: mockKeyConditionExpression,
            ExpressionAttributeNames: mockExpressionAttributeNames,
            ExpressionAttributeValues: mockExpressionAttributeValues,
          });
        });

        it('computes and applies a filter expression if a filters object is provided', () => {
          TestClass.query({ test: 'foobar' }, null, {
            name: {
              operator: '>=',
              value: '20',
            },
          });

          expect(DocumentClient.prototype.query).toHaveBeenCalledWith({
            KeyConditionExpression: mockKeyConditionExpression,
            FilterExpression: mockFilterExpression,
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
        DocumentClient.prototype.query.mockResolvedValue({ Items });
        expect.assertions(2);
        TestClass.first(jest.fn()).then((item) => {
          expect(item).toBeInstanceOf(TestClass);
          expect(item).toEqual(expect.objectContaining(Items[0]));
          done();
        });
      });

      it('rejects with the document client error', (done) => {
        expect.assertions(1);
        const error = jest.fn();
        DocumentClient.prototype.query.mockRejectedValue(error);
        TestClass.first(jest.fn()).catch((e) => {
          expect(e).toBe(error);
          done();
        });
      });

      describe('query structure', () => {
        beforeEach(() => {
          DocumentClient.prototype.query.mockResolvedValue({ Items: [] });
        });

        it('executes the correct basic query', () => {
          TestClass.first({ id: 123 });
          expect(DocumentClient.prototype.query).toHaveBeenCalledWith({
            KeyConditionExpression: mockKeyConditionExpression,
            ExpressionAttributeNames: mockExpressionAttributeNames,
            ExpressionAttributeValues: mockExpressionAttributeValues,
          });
        });

        it('queries the given index', () => {
          TestClass.first({ test: 'foobar' }, 'test-index');
          expect(DocumentClient.prototype.query).toHaveBeenCalledWith({
            IndexName: 'test-index',
            KeyConditionExpression: mockKeyConditionExpression,
            ExpressionAttributeNames: mockExpressionAttributeNames,
            ExpressionAttributeValues: mockExpressionAttributeValues,
          });
        });

        it('supports filter expressions', () => {
          TestClass.first({ test: 'foobar' }, null, { refreshFrequency: 'Monthly' });
          expect(DocumentClient.prototype.query).toHaveBeenCalledWith({
            KeyConditionExpression: mockKeyConditionExpression,
            FilterExpression: mockFilterExpression,
            ExpressionAttributeNames: mockExpressionAttributeNames,
            ExpressionAttributeValues: mockExpressionAttributeValues,
          });
        });
      });
    });

    describe('get', () => {
      it('resolves with instances of the model from the returned data', (done) => {
        const Item = { id: 123, date: 111, foobar: 'foo' };
        DocumentClient.prototype.get.mockResolvedValue({ Item });
        expect.assertions(2);
        TestClass.get(jest.fn()).then((item) => {
          expect(item).toBeInstanceOf(TestClass);
          expect(item).toEqual(expect.objectContaining(Item));
          done();
        });
      });

      it('resolves with null if the item is not found', (done) => {
        DocumentClient.prototype.get.mockResolvedValue({});
        expect.assertions(1);
        TestClass.get(jest.fn()).then((item) => {
          expect(item).toBeNull();
          done();
        });
      });

      it('rejects with the document client error', (done) => {
        expect.assertions(1);
        const error = jest.fn();
        DocumentClient.prototype.get.mockRejectedValue(error);
        TestClass.get(jest.fn()).catch((e) => {
          expect(e).toBe(error);
          done();
        });
      });

      it('executes the correct query', () => {
        DocumentClient.prototype.get.mockResolvedValue(jest.fn());
        TestClass.get({ id: 123 });
        expect(DocumentClient.prototype.get).toHaveBeenCalledWith({
          Key: { id: 123 },
        });
      });
    });

    describe('delete', () => {
      it('resolves with null if the delete request is successful', (done) => {
        DocumentClient.prototype.delete.mockResolvedValue(jest.fn());
        expect.assertions(1);
        TestClass.delete(jest.fn()).then((result) => {
          expect(result).toBeNull();
          done();
        });
      });

      it('rejects with the error if the delete errors', (done) => {
        const error = jest.fn();
        DocumentClient.prototype.delete.mockRejectedValue(error);
        expect.assertions(1);
        TestClass.delete(jest.fn()).catch((e) => {
          expect(e).toBe(error);
          done();
        });
      });

      it('invokes the delete operation with the correct parameters', () => {
        DocumentClient.prototype.delete.mockResolvedValue(jest.fn());
        TestClass.delete({ id: 123 });
        expect(DocumentClient.prototype.delete).toHaveBeenCalledWith({
          Key: { id: 123 },
        });
      });
    });
  });

  describe('instance methods', () => {
    let item;
    beforeEach(() => {
      item = new TestClass(fields);
    });

    describe('save', () => {
      it('makes correct put request to the document client with the instance', () => {
        item.save();
        expect(item.db.put).toHaveBeenCalledWith({
          Item: fields,
        });
      });

      it('resolves with the instance', (done) => {
        expect.assertions(1);
        item.db.put.mockResolvedValue(null);
        item.save().then((data) => {
          expect(data).toBe(item);
          done();
        });
      });

      it('rejects with the document client error', (done) => {
        expect.assertions(1);
        const error = jest.fn();
        item.db.put.mockRejectedValue(error);
        item.save().catch((e) => {
          expect(e).toBe(error);
          done();
        });
      });
    });
  });
});
