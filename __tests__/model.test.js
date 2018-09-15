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

describe('query', () => {
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
});
