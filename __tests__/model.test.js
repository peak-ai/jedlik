const Model = require('../src/model');
const DocumentClient = require('../src/document-client');

jest.mock('../src/document-client');

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

beforeEach(() => {
  jest.resetAllMocks();
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

    it('executes the correct basic query', () => {
      TestClass.query({ id: 123 });
      expect(DocumentClient.query).toHaveBeenCalledWith({
        TableName: TestClass.tableName,
        KeyConditionExpression: '#id = :id',
        ExpressionAttributeNames: {
          '#id': 'id',
        },
        ExpressionAttributeValues: {
          ':id': 123,
        },
      });
    });

    it('executes the correct query for composite keys', () => {
      TestClass.query({ id: 123, date: 111 });
      expect(DocumentClient.query).toHaveBeenCalledWith({
        TableName: TestClass.tableName,
        KeyConditionExpression: '#id = :id AND #date = :date',
        ExpressionAttributeNames: {
          '#id': 'id',
          '#date': 'date',
        },
        ExpressionAttributeValues: {
          ':id': 123,
          ':date': 111,
        },
      });
    });

    it('queries the given index', () => {
      TestClass.query({ test: 'foobar' }, 'test-index');
      expect(DocumentClient.query).toHaveBeenCalledWith({
        TableName: TestClass.tableName,
        IndexName: 'test-index',
        KeyConditionExpression: '#test = :test',
        ExpressionAttributeNames: {
          '#test': 'test',
        },
        ExpressionAttributeValues: {
          ':test': 'foobar',
        },
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
