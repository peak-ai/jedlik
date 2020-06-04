import { mocked } from 'ts-jest/utils';
import { Attributes } from '../src/attributes';
import { Database } from '../src/database';
import { Document } from '../src/document';
import { Events } from '../src/events';

jest.mock('../src/attributes');
jest.mock('../src/database');
jest.mock('../src/events');

/* tslint:disable:variable-name */
const MockAttributes = mocked(Attributes);
// const MockDatabase = mocked(Database);
// const MockEvents = mocked(Events);
/* tslint:enable:variable-name */

let subject: Document<any>;
let db: Database<any>;
let events: Events<any>;
let props: any;
const schema = {
  validate: jest.fn(),
};

beforeEach(() => {
  db = new Database('');
  events = new Events();
  props = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('constructor', () => {
  it('passes the props into the attributes constructor', () => {
    subject = new Document<any>(db, events, schema, props);
    expect(MockAttributes).toHaveBeenCalledWith(props);
  });
});

describe('methods', () => {
  beforeEach(() => {
    subject = new Document<any>(db, events, schema, props);
  });

  describe('get', () => {
    it('gets the given attribute', () => {
      expect.assertions(2);
      const key = 'foo';
      const value = jest.fn();
      (MockAttributes.prototype.get as jest.Mock).mockReturnValueOnce(value);

      const result = subject.get(key);
      expect(MockAttributes.prototype.get).toHaveBeenCalledWith(key);
      expect(result).toBe(value);
    });
  });

  describe('toObject', () => {
    it('gets the all attributes', () => {
      expect.assertions(1);
      const value = jest.fn();
      (MockAttributes.prototype.getAll as jest.Mock).mockReturnValueOnce(value);

      const result = subject.toObject();
      expect(result).toBe(value);
    });
  });

  describe('set', () => {
    it('sets the given attributes', () => {
      expect.assertions(1);
      const attributes = jest.fn();

      subject.set(attributes);
      expect(MockAttributes.prototype.set).toHaveBeenCalledWith(attributes);
    });
  });

  describe('save', () => {
    it('validates attributes against the schema', async () => {
      expect.assertions(1);
      const attributes = jest.fn();

      (MockAttributes.prototype.getAll as jest.Mock).mockReturnValueOnce(attributes);
      schema.validate.mockReturnValueOnce({ value: jest.fn() });

      await subject.save();

      expect(schema.validate).toHaveBeenCalledWith(attributes);
    });

    it('updates the attributes with the validated object', async () => {
      expect.assertions(1);
      const attributes = jest.fn();

      schema.validate.mockReturnValueOnce({ value: attributes });

      await subject.save();

      expect(MockAttributes.prototype.set).toHaveBeenCalledWith(attributes);
    });

    it('puts the attributes to the database', async () => {
      expect.assertions(1);
      const attributes = jest.fn();

      schema.validate.mockReturnValueOnce({ value: attributes });

      await subject.save();

      expect(db.put).toHaveBeenCalledWith(attributes);
    });

    it('emits a save event with the document', async () => {
      expect.assertions(1);
      const attributes = jest.fn();

      schema.validate.mockReturnValueOnce({ value: attributes });

      await subject.save();

      expect(events.emit).toHaveBeenCalledWith('save', subject);
    });

    it('raises an error if the validation fails', () => {
      expect.assertions(1);
      const error = jest.fn();

      schema.validate.mockReturnValueOnce({ error });

      expect(subject.save()).rejects.toBe(error);
    });

    it('doesn\'t save if the validation fails', async () => {
      expect.assertions(2);
      schema.validate.mockReturnValueOnce({ error: jest.fn() });

      try {
        await subject.save();
      } catch (error) {
        expect(db.put).not.toHaveBeenCalled();
        expect(events.emit).not.toHaveBeenCalled();
      }
    });
  });
});
