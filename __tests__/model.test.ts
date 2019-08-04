import { Endpoint } from 'aws-sdk';
import DocumentClient from '../src/document-client';
import JedlikModel from '../src/model';

const dynamoConfig = {
  endpoint: new Endpoint('http://localhost:4569').href,
  region: 'local',
};

const ddb = new DocumentClient(dynamoConfig);

// tslint:disable-next-line: variable-name
const UserModel = JedlikModel({
  dynamoConfig,
  schema: {
    id: { required: true },
  },
  table: 'users',
});

beforeEach(async () => {
  const { Items } = await ddb.scan({ TableName: 'users' });

  if (Items) {
    await Promise.all(Items.map(({ id }) => ddb.delete({
      Key: { id },
      TableName: 'users',
    })));
  }
});

interface IUser {
  id: string;
}

interface IUserInput {
  id: string;
}

class User extends UserModel implements IUser {
  public id: string;

  constructor({ id }: IUserInput) {
    super();
    this.id = id;
  }
}

describe('static properties', () => {
  it('has a db property which is a instance of the DocumentClient', () => {
    expect.assertions(1);

    expect(User.db).toBeInstanceOf(DocumentClient);
  });

  it('has a table property which is the name of the table the model is bound to', () => {
    expect.assertions(1);

    expect(User.table).toBe('users');
  });
});

describe('constructor', () => {
  it('has a db property which is an instance of DocumentClient', () => {
    expect.assertions(1);

    const user = new User({ id: '123' });

    expect(user.db).toBeInstanceOf(DocumentClient);
  });

  it('does not write to the database', async () => {
    expect.assertions(1);

    const user = new User({ id: '123' });

    const { Count } = await ddb.scan({ TableName: 'users' });

    expect(Count).toBe(0);
  });
});

describe('instance methods', () => {
  describe('save', () => {
    let user: User;

    beforeEach(() => {
      user = new User({ id: '123' });
    });

    it('saves the item to the database', async () => {
      expect.assertions(2);

      await user.save();

      const { Count, Items } = await ddb.scan({ TableName: 'users' });

      expect(Count).toBe(1);

      if (Items) {
        expect(Items[0]).toEqual({
          id: '123',
        });
      }
    });

    it('resolves with the instance itself', async () => {
      expect.assertions(1);

      const result = await user.save();

      expect(result).toBe(user);
    });

    it('rejects with the document client error', async () => {
      expect.assertions(1);

      const error = jest.fn();
      user.db.put = jest.fn().mockRejectedValue(error);

      try {
        await user.save();
      } catch (e) {
        expect(e).toBe(error);
      }
    });
  });
});

  // describe('static methods', () => {
    // describe('query', () => {
      // it('resolves with instances of the model from the returned data', (done) => {
        // const Items = [
          // { id: 123, date: 111, foobar: 'foo' },
          // { id: 456, date: 222, foobar: 'bar' },
        // ];
        // DocumentClient.prototype.query.mockResolvedValue({ Items });
        // expect.assertions(Items.length * 2);
        // TestClass.query(jest.fn()).then((items) => {
          // items.forEach((item, i) => {
            // expect(item).toBeInstanceOf(TestClass);
            // expect(item).toEqual(items[i]);
          // });
          // done();
        // });
      // });
//
      // it('rejects with the document client error', (done) => {
        // expect.assertions(1);
        // const error = jest.fn();
        // DocumentClient.prototype.query.mockRejectedValue(error);
        // TestClass.query(jest.fn()).catch((e) => {
          // expect(e).toBe(error);
          // done();
        // });
      // });
//
      // describe('query structure', () => {
        // beforeEach(() => {
          // DocumentClient.prototype.query.mockResolvedValue({ Items: [] });
        // });
//
        // it('executes the correct query', () => {
          // TestClass.query({ id: 123 });
          // expect(DocumentClient.prototype.query).toHaveBeenCalledWith({
            // KeyConditionExpression: mockKeyConditionExpression,
            // ExpressionAttributeNames: mockExpressionAttributeNames,
            // ExpressionAttributeValues: mockExpressionAttributeValues,
          // });
        // });
//
        // it('queries the given index', () => {
          // TestClass.query({ test: 'foobar' }, 'test-index');
          // expect(DocumentClient.prototype.query).toHaveBeenCalledWith({
            // IndexName: 'test-index',
            // KeyConditionExpression: mockKeyConditionExpression,
            // ExpressionAttributeNames: mockExpressionAttributeNames,
            // ExpressionAttributeValues: mockExpressionAttributeValues,
          // });
        // });
      // });
    // });
//
    // describe('first', () => {
      // it('resolves with an instance of the model from the first returned item', (done) => {
        // const Items = [
          // { id: 123, date: 111, foobar: 'foo' },
          // { id: 456, date: 222, foobar: 'bar' },
        // ];
        // DocumentClient.prototype.query.mockResolvedValue({ Items });
        // expect.assertions(2);
        // TestClass.first(jest.fn()).then((item) => {
          // expect(item).toBeInstanceOf(TestClass);
          // expect(item).toEqual(expect.objectContaining(Items[0]));
          // done();
        // });
      // });
//
      // it('rejects with the document client error', (done) => {
        // expect.assertions(1);
        // const error = jest.fn();
        // DocumentClient.prototype.query.mockRejectedValue(error);
        // TestClass.first(jest.fn()).catch((e) => {
          // expect(e).toBe(error);
          // done();
        // });
      // });
//
      // describe('query structure', () => {
        // beforeEach(() => {
          // DocumentClient.prototype.query.mockResolvedValue({ Items: [] });
        // });
//
        // it('executes the correct basic query', () => {
          // TestClass.first({ id: 123 });
          // expect(DocumentClient.prototype.query).toHaveBeenCalledWith({
            // KeyConditionExpression: mockKeyConditionExpression,
            // ExpressionAttributeNames: mockExpressionAttributeNames,
            // ExpressionAttributeValues: mockExpressionAttributeValues,
          // });
        // });
//
        // it('queries the given index', () => {
          // TestClass.first({ test: 'foobar' }, 'test-index');
          // expect(DocumentClient.prototype.query).toHaveBeenCalledWith({
            // IndexName: 'test-index',
            // KeyConditionExpression: mockKeyConditionExpression,
            // ExpressionAttributeNames: mockExpressionAttributeNames,
            // ExpressionAttributeValues: mockExpressionAttributeValues,
          // });
        // });
      // });
    // });
//
    // describe('get', () => {
      // it('resolves with instances of the model from the returned data', (done) => {
        // const Item = { id: 123, date: 111, foobar: 'foo' };
        // DocumentClient.prototype.get.mockResolvedValue({ Item });
        // expect.assertions(2);
        // TestClass.get(jest.fn()).then((item) => {
          // expect(item).toBeInstanceOf(TestClass);
          // expect(item).toEqual(expect.objectContaining(Item));
          // done();
        // });
      // });
//
      // it('resolves with null if the item is not found', (done) => {
        // DocumentClient.prototype.get.mockResolvedValue({});
        // expect.assertions(1);
        // TestClass.get(jest.fn()).then((item) => {
          // expect(item).toBeNull();
          // done();
        // });
      // });
//
      // it('rejects with the document client error', (done) => {
        // expect.assertions(1);
        // const error = jest.fn();
        // DocumentClient.prototype.get.mockRejectedValue(error);
        // TestClass.get(jest.fn()).catch((e) => {
          // expect(e).toBe(error);
          // done();
        // });
      // });
//
      // it('executes the correct query', () => {
        // DocumentClient.prototype.get.mockResolvedValue(jest.fn());
        // TestClass.get({ id: 123 });
        // expect(DocumentClient.prototype.get).toHaveBeenCalledWith({
          // Key: { id: 123 },
        // });
      // });
    // });
//
    // describe('delete', () => {
      // it('resolves with null if the delete request is successful', (done) => {
        // DocumentClient.prototype.delete.mockResolvedValue(jest.fn());
        // expect.assertions(1);
        // TestClass.delete(jest.fn()).then((result) => {
          // expect(result).toBeNull();
          // done();
        // });
      // });
//
      // it('rejects with the error if the delete errors', (done) => {
        // const error = jest.fn();
        // DocumentClient.prototype.delete.mockRejectedValue(error);
        // expect.assertions(1);
        // TestClass.delete(jest.fn()).catch((e) => {
          // expect(e).toBe(error);
          // done();
        // });
      // });
//
      // it('invokes the delete operation with the correct parameters', () => {
        // DocumentClient.prototype.delete.mockResolvedValue(jest.fn());
        // TestClass.delete({ id: 123 });
        // expect(DocumentClient.prototype.delete).toHaveBeenCalledWith({
          // Key: { id: 123 },
        // });
      // });
    // });
// });
