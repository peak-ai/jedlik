import { mocked } from 'ts-jest/utils';
import { Model } from '../src/model';
import { Database } from '../src/database';
import { Document } from '../src/document';
import { Events } from '../src/events';

jest.mock('../src/database');
jest.mock('../src/document');
jest.mock('../src/events');

/* tslint:disable:variable-name */
const Mockument = mocked(Document);
const MockDatabase = mocked(Database);
const MockEvents = mocked(Events);
/* tslint:enable:variable-name */

const getMockObjects = () => {
  const data = [];
  for (let i = 0; i < Math.random() * 5; i += 1) {
    data.push(jest.fn());
  }
  return data;
};

beforeEach(() => {
  jest.clearAllMocks();
});

let mockDatabase: Database<any>;
let mockEvents: Events<any>;
const config = {};
const tableName = 'users';
const schema = {
  validate: jest.fn(),
};

describe('constructor', () => {
  it('passes the parameters into the database constructor', () => {
    const model = new Model<any>({ table: tableName, schema }, config);
    expect.assertions(1);
    expect(MockDatabase).toHaveBeenCalledWith(tableName, config);
  });

  it('creates a new event handler', () => {
    const model = new Model<any>({ table: tableName, schema }, config);
    expect.assertions(1);
    expect(MockEvents).toHaveBeenCalled();
  });
});

describe('methods', () => {
  let model: Model<any>;

  beforeEach(() => {
    mockDatabase = new Database(tableName);
    MockDatabase.mockImplementationOnce(() => mockDatabase);
    mockEvents = new Events();
    MockEvents.mockImplementationOnce(() => mockEvents);
    model = new Model<any>({ table: tableName, schema }, config);
  });

  describe('create', () => {
    it('returns a new Document', () => {
      expect.assertions(2);

      const props = jest.fn();
      const result = model.create(props);

      expect(Mockument).toHaveBeenCalledWith(mockDatabase, mockEvents, schema, props);
      expect(result).toBeInstanceOf(Document);
    });
  });

  describe('query', () => {
    it('queries the database with the given parameters', async () => {
      expect.assertions(1);

      const key = { id: Math.random() * 100 };
      const options = {};

      (mockDatabase.query as jest.Mock).mockResolvedValue([]);
      await model.query(key, options);

      expect(mockDatabase.query).toHaveBeenCalledWith(key, options);
    });

    it('maps each database item to a document', async () => {
      const items = getMockObjects();
      expect.assertions(1 + items.length);

      (mockDatabase.query as jest.Mock).mockResolvedValue(items);

      await model.query({}, {});

      expect(Mockument).toHaveBeenCalledTimes(items.length);

      items.forEach((item, i) => {
        expect(Mockument).toHaveBeenNthCalledWith(i + 1, mockDatabase, mockEvents, schema, item);
      });
    });

    it('returns an array of documents', async () => {
      const items = getMockObjects();

      expect.assertions(1 + items.length);

      (mockDatabase.query as jest.Mock).mockResolvedValue(items);

      const results = await model.query({}, {});

      expect(results.length).toEqual(items.length);

      results.forEach((result) => {
        expect(result).toBeInstanceOf(Document);
      });
    });
  });

  describe('scan', () => {
    it('scans the database with the given parameters', async () => {
      expect.assertions(1);

      const options = {};

      (mockDatabase.scan as jest.Mock).mockResolvedValue([]);

      await model.scan(options);

      expect(mockDatabase.scan).toHaveBeenCalledWith(options);
    });

    it('maps each database item to a document', async () => {
      const items = getMockObjects();
      expect.assertions(1 + items.length);

      (mockDatabase.scan as jest.Mock).mockResolvedValue(items);

      await model.scan({});

      expect(Mockument).toHaveBeenCalledTimes(items.length);

      items.forEach((item, i) => {
        expect(Mockument).toHaveBeenNthCalledWith(i + 1, mockDatabase, mockEvents, schema, item);
      });
    });

    it('returns an array of documents', async () => {
      const items = getMockObjects();

      expect.assertions(1 + items.length);

      (mockDatabase.scan as jest.Mock).mockResolvedValue(items);

      const results = await model.scan({});

      expect(results.length).toEqual(items.length);

      results.forEach((result) => {
        expect(result).toBeInstanceOf(Document);
      });
    });
  });

  describe('first', () => {
    it('queries the database with the given parameters', async () => {
      expect.assertions(1);

      const key = { id: Math.random() * 100 };
      const options = {};

      (mockDatabase.first as jest.Mock).mockResolvedValue(jest.fn());
      await model.first(key, options);

      expect(mockDatabase.first).toHaveBeenCalledWith(key, options);
    });

    it('maps the database item to a document', async () => {
      expect.assertions(2);

      const item = jest.fn();

      (mockDatabase.first as jest.Mock).mockResolvedValue(item);

      await model.first({}, {});

      expect(Mockument).toHaveBeenCalledTimes(1);
      expect(Mockument).toHaveBeenNthCalledWith(1, mockDatabase, mockEvents, schema, item);
    });

    it('returns a document', async () => {
      expect.assertions(1);

      (mockDatabase.first as jest.Mock).mockResolvedValue(jest.fn());

      const result = await model.first({}, {});

      expect(result).toBeInstanceOf(Document);
    });
  });

  describe('get', () => {
    it('queries the database with the given key', async () => {
      expect.assertions(1);

      const key = { id: Math.random() * 100 };

      (mockDatabase.get as jest.Mock).mockResolvedValue(jest.fn());
      await model.get(key);

      expect(mockDatabase.get).toHaveBeenCalledWith(key);
    });

    it('maps the database item to a document', async () => {
      expect.assertions(2);

      const item = jest.fn();

      (mockDatabase.get as jest.Mock).mockResolvedValue(item);

      await model.get({});

      expect(Mockument).toHaveBeenCalledTimes(1);
      expect(Mockument).toHaveBeenNthCalledWith(1, mockDatabase, mockEvents, schema, item);
    });

    it('returns a document', async () => {
      expect.assertions(1);

      (mockDatabase.get as jest.Mock).mockResolvedValue(jest.fn());

      const result = await model.get({});

      expect(result).toBeInstanceOf(Document);
    });
  });

  describe('delete', () => {
    it('deletes the database item with the given key', async () => {
      expect.assertions(1);

      const key = { id: Math.random() * 100 };

      await model.delete(key);

      expect(mockDatabase.delete).toHaveBeenCalledWith(key);
    });

    it('emits a delete event', async () => {
      expect.assertions(1);

      await model.delete({});

      expect(MockEvents.prototype.emit).toHaveBeenCalledWith('delete');
    });
  });

  describe('on', () => {
    it('registers an event handler', () => {
      const event = 'delete';
      const handler = jest.fn();
      model.on(event, handler);

      expect(MockEvents.prototype.on).toHaveBeenCalledWith(event, handler);
    });
  });
});

