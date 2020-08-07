import { Endpoint, DynamoDB } from 'aws-sdk';
import { DynamoDBClient, DynamoDBSet } from '../src/dynamodb-client';
import { createSet } from '../src/document-client';
import { Literal } from '../src/expressions/update-expressions';

enum UserType {
  Admin = 'admin',
  User = 'user',
}

type address = {
  street: string;
  city?: string;
  postcode: string;
};

interface User {
  id: number;
  type: UserType;
  name: string;
  age: number;
  address: address;
  email?: string;
  testsWritten?: number;
  set1: DynamoDBSet;
  set2?: DynamoDBSet;
}

function generateUser(id: number): User {
  const type = Math.random() > 0.5 ? UserType.Admin : UserType.User;
  const set1 = ['firstSet', 'firstSet2'];
  set1.sort(); // sets always come back sorted!

  return {
    id,
    type,
    name: `${type}-${id}`,
    age: Math.ceil(Math.random() * 80),
    address: {
      street: `${id} street`,
      postcode: `${id}`,
    },
    set1: createSet(set1),
  };
}

const USERS: User[] = [];

(function generateTestUsers() {
  for (let id = 1; id <= 50; id += 1) {
    const user = generateUser(id);
    USERS.push(user);
  }
})();

const SORTED_USERS_ASCENDING: User[] = [
  ...USERS.filter((user) => user.type === UserType.Admin).sort(
    (a, b) => a.id - b.id
  ),
  ...USERS.filter((user) => user.type === UserType.User).sort(
    (a, b) => a.id - b.id
  ),
];

const SORTED_USERS_DESCENDING: User[] = [
  ...USERS.filter((user) => user.type === UserType.Admin).sort(
    (a, b) => b.id - a.id
  ),
  ...USERS.filter((user) => user.type === UserType.User).sort(
    (a, b) => b.id - a.id
  ),
];

const SORTED_USERS_SECONDARY_INDEX: User[] = (function () {
  const sortedAges = USERS.map((user) => user.age)
    .filter((age, index, array) => array.indexOf(age) === index)
    .sort((a, b) => a - b);

  return sortedAges.reduce(
    (list, age) =>
      list.concat(
        USERS.filter((user) => user.age === age).sort((a, b) => a.age - b.age)
      ),
    [] as User[]
  );
})();

let database: DynamoDBClient<User>;

const dynamoConfig = {
  endpoint: new Endpoint('http://localhost:8000').href,
  region: 'local',
  accessKeyId: 'xxx',
  secretAccessKey: 'xxx',
};

const dynamo = new DynamoDB(dynamoConfig);
const client = new DynamoDB.DocumentClient(dynamoConfig);

const TABLE_NAME = 'users';

beforeEach(async () => {
  await dynamo
    .createTable({
      TableName: TABLE_NAME,
      KeySchema: [
        { AttributeName: 'type', KeyType: 'HASH' },
        { AttributeName: 'id', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'N' },
        { AttributeName: 'type', AttributeType: 'S' },
        { AttributeName: 'age', AttributeType: 'N' },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'age-id',
          KeySchema: [
            { AttributeName: 'age', KeyType: 'HASH' },
            { AttributeName: 'id', KeyType: 'RANGE' },
          ],
          Projection: { ProjectionType: 'ALL' },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
    })
    .promise();

  await Promise.all(
    USERS.map((user) =>
      client
        .put({
          TableName: TABLE_NAME,
          Item: user,
        })
        .promise()
    )
  );

  database = new DynamoDBClient<User>(TABLE_NAME, dynamoConfig);
});

afterEach(async () => {
  await dynamo
    .deleteTable({
      TableName: TABLE_NAME,
    })
    .promise();
});

describe('scan', () => {
  it('returns all of the items in the database', async () => {
    expect.assertions(1);

    const result = await database.scan();
    const expected = SORTED_USERS_ASCENDING;

    expect(result).toEqual(expected);
  });

  it('returns a filtered set of results', async () => {
    expect.assertions(1);

    const result = await database.scan({
      filters: { key: 'id', operator: '<', value: 3 },
    });
    const expected = SORTED_USERS_ASCENDING.filter((user) => user.id < 3);

    expect(result).toEqual(expected);
  });

  it('applies complex filters correctly', async () => {
    expect.assertions(1);

    const result = await database.scan({
      filters: {
        $or: [
          { key: 'age', operator: '>', value: 60 },
          { key: 'type', operator: '=', value: UserType.Admin },
        ],
      },
    });
    const expected = SORTED_USERS_ASCENDING.filter(
      (user) => user.age > 60 || user.type === UserType.Admin
    );

    expect(result).toEqual(expected);
  });

  it('returns a limited set of results', async () => {
    expect.assertions(1);

    const result = await database.scan({ limit: 2 });
    const expected = SORTED_USERS_ASCENDING.slice(0, 2);

    expect(result).toEqual(expected);
  });

  it('returns items using a secondary index', async () => {
    expect.assertions(1);

    const result = await database.scan({ index: 'age-id' });
    const expected = SORTED_USERS_SECONDARY_INDEX;

    expect(result).toEqual(expected);
  });
});

describe('query', () => {
  it('returns all items with the given key', async () => {
    expect.assertions(1);

    const [{ id }] = SORTED_USERS_ASCENDING.filter(
      (user) => user.type === UserType.Admin
    );

    const result = await database.query({ type: UserType.Admin, id });
    const expected = SORTED_USERS_ASCENDING.filter(
      (user) => user.type === UserType.Admin && user.id === id
    );

    expect(result).toEqual(expected);
  });

  it('returns a limited result set', async () => {
    expect.assertions(1);

    const result = await database.query({ type: UserType.Admin }, { limit: 4 });
    const expected = SORTED_USERS_ASCENDING.filter(
      (user) => user.type === UserType.Admin
    ).slice(0, 4);

    expect(result).toEqual(expected);
  });

  it('returns a sorted result set', async () => {
    expect.assertions(1);

    const result = await database.query(
      { type: UserType.Admin },
      { sort: 'desc' }
    );
    const expected = SORTED_USERS_DESCENDING.filter(
      (user) => user.type === UserType.Admin
    );

    expect(result).toEqual(expected);
  });

  it('returns a filtered result set', async () => {
    expect.assertions(1);

    const result = await database.query(
      { type: UserType.User },
      { filters: { key: 'age', operator: '>', value: 50 } }
    );
    const expected = SORTED_USERS_ASCENDING.filter(
      (user) => user.type === UserType.User && user.age > 50
    );

    expect(result).toEqual(expected);
  });

  it('applies complex filters correctly', async () => {
    expect.assertions(1);

    const result = await database.query(
      { type: UserType.Admin },
      {
        filters: {
          $or: [
            { key: 'age', operator: '<', value: 30 },
            { key: 'age', operator: '>', value: 55 },
          ],
        },
      }
    );
    const expected = SORTED_USERS_ASCENDING.filter(
      (user) => user.type === UserType.Admin && (user.age > 55 || user.age < 30)
    );

    expect(result).toEqual(expected);
  });

  it('returns items using a secondary index', async () => {
    expect.assertions(1);
    const [{ age }] = USERS;
    const result = await database.query({ age }, { index: 'age-id' });
    const expected = SORTED_USERS_SECONDARY_INDEX.filter(
      (user) => user.age === age
    );

    expect(result).toEqual(expected);
  });
});

describe('first', () => {
  it('returns the first item with the given key', async () => {
    expect.assertions(1);

    const result = await database.first({ type: UserType.Admin });
    const [expected] = SORTED_USERS_ASCENDING.filter(
      (user) => user.type === UserType.Admin
    );

    expect(result).toEqual(expected);
  });

  it('throws an error if there is no items in the result set', async () => {
    expect.assertions(1);

    await expect(
      database.first({
        type: UserType.Admin,
        id: USERS.length * 2,
      })
    ).rejects.toThrow('Not Found');
  });

  it('returns the first item of a sorted result set', async () => {
    expect.assertions(1);

    const result = await database.first(
      { type: UserType.Admin },
      { sort: 'desc' }
    );
    const [expected] = SORTED_USERS_DESCENDING.filter(
      (user) => user.type === UserType.Admin
    );

    expect(result).toEqual(expected);
  });

  it('returns the first item of a filtered result set', async () => {
    expect.assertions(1);

    const result = await database.first(
      { type: UserType.User },
      { filters: { key: 'age', operator: '>', value: 50 } }
    );
    const [expected] = SORTED_USERS_ASCENDING.filter(
      (user) => user.type === UserType.User && user.age > 50
    );

    expect(result).toEqual(expected);
  });

  it('returns the first item of a complex filter set', async () => {
    expect.assertions(1);

    const result = await database.first(
      { type: UserType.Admin },
      {
        filters: {
          $or: [
            { key: 'age', operator: '<', value: 30 },
            { key: 'age', operator: '>', value: 55 },
          ],
        },
      }
    );
    const [expected] = SORTED_USERS_ASCENDING.filter(
      (user) => user.type === UserType.Admin && (user.age > 55 || user.age < 30)
    );

    expect(result).toEqual(expected);
  });

  it('returns the first item using a secondary index', async () => {
    expect.assertions(1);
    const [{ age }] = USERS;
    const result = await database.first({ age }, { index: 'age-id' });
    const [expected] = SORTED_USERS_SECONDARY_INDEX.filter(
      (user) => user.age === age
    );

    expect(result).toEqual(expected);
  });
});

describe('get', () => {
  it('returns the item with the given key', async () => {
    expect.assertions(1);
    const [, , expected] = SORTED_USERS_ASCENDING.filter(
      (user) => user.type === UserType.Admin
    );

    const result = await database.get({ type: expected.type, id: expected.id });

    expect(result).toEqual(expected);
  });

  it('throws an error if there is no items in the result set', async () => {
    expect.assertions(1);

    await expect(
      database.get({
        type: UserType.Admin,
        id: USERS.length * 2,
      })
    ).rejects.toThrow('Not Found');
  });
});

describe('delete', () => {
  it('deletes the item with the given key', async () => {
    expect.assertions(2);
    const [, , item] = SORTED_USERS_ASCENDING.filter(
      (user) => user.type === UserType.Admin
    );

    const before = await database.query({ type: item.type, id: item.id });

    expect(before.length).toEqual(1);

    await database.delete({ type: item.type, id: item.id });

    const after = await database.query({ type: item.type, id: item.id });

    expect(after.length).toEqual(0);
  });

  it('raises an error if conditions are not met', async () => {
    expect.assertions(3);

    const [item] = SORTED_USERS_ASCENDING.filter(
      (user) => user.type === UserType.Admin
    );

    const before = await database.query({ type: item.type, id: item.id });

    expect(before.length).toEqual(1);

    try {
      await database.delete(
        { type: item.type, id: item.id },
        { conditions: { key: 'age', operator: '<>', value: item.age } }
      );
    } catch (error) {
      expect(error).toBeDefined();
    }

    const after = await database.query({ type: item.type, id: item.id });

    expect(after.length).toEqual(1);
  });

  it('deletes the item if conditions are met', async () => {
    expect.assertions(2);

    const [, , , item] = SORTED_USERS_ASCENDING.filter(
      (user) => user.type === UserType.Admin
    );

    const before = await database.query({ type: item.type, id: item.id });

    expect(before.length).toEqual(1);

    await database.delete(
      { type: item.type, id: item.id },
      { conditions: { key: 'age', operator: '=', value: item.age } }
    );

    const after = await database.query({ type: item.type, id: item.id });

    expect(after.length).toEqual(0);
  });
});

describe('put', () => {
  it('adds a new item to the database', async () => {
    expect.assertions(4);

    const user = generateUser(USERS.length + 1);

    const before = await database.scan();
    expect(before.length).toEqual(USERS.length);
    expect(before).not.toContainEqual(user);

    await database.put(user);

    const after = await database.scan();
    expect(after.length).toEqual(USERS.length + 1);
    expect(after).toContainEqual(user);
  });

  it('updates an existing item in the database', async () => {
    expect.assertions(4);

    const before = await database.scan();
    expect(before.length).toEqual(USERS.length);

    const [user] = before;

    const updated = {
      ...user,
      age: user.age + 1,
    };

    await database.put(updated);

    const after = await database.scan();
    expect(after.length).toEqual(USERS.length);
    expect(after).not.toContainEqual(user);
    expect(after).toContainEqual(updated);
  });

  it('raises an error if conditions are not met', async () => {
    expect.assertions(2);

    const [user] = USERS;

    const before = await database.get({ type: user.type, id: user.id });

    const updated = {
      ...before,
      age: before.age + 1,
    };

    try {
      await database.put(updated, {
        conditions: { key: 'id', operator: '<>', value: user.id },
      });
    } catch (error) {
      expect(error).toBeDefined();
    }

    const after = await database.get({ type: user.type, id: user.id });

    expect(after).toEqual(before);
  });

  it('deletes the item if conditions are met', async () => {
    expect.assertions(1);

    const [user] = USERS;

    const before = await database.get({ type: user.type, id: user.id });

    const updated = {
      ...before,
      age: before.age + 1,
    };

    await database.put(updated, {
      conditions: { key: 'id', operator: '=', value: user.id },
    });

    const after = await database.get({ type: user.type, id: user.id });

    expect(after).toEqual(updated);
  });
});

describe('update', () => {
  describe('SET updates', () => {
    it('sets attributes on an existing item in the database', async () => {
      expect.assertions(3);

      const before = await database.scan();
      const [user] = before;

      const result = await database.update(
        { type: user.type, id: user.id },
        {
          set: [
            { age: user.age + 1, name: 'TESTING', email: 'email@test.com' },
          ],
        }
      );

      expect(result).toEqual({
        ...user,
        name: 'TESTING',
        age: user.age + 1,
        email: 'email@test.com',
      });

      const after = await database.scan();
      expect(after).not.toContainEqual(user);
      expect(after).toContainEqual(result);
    });

    it('sets literal objects on an existing item in the database', async () => {
      expect.assertions(3);

      const before = await database.scan();
      const [user] = before;
      const newAddress = {
        postcode: 'a new postcode',
        street: 'a different street',
      };
      const result = await database.update(
        { type: user.type, id: user.id },
        {
          set: [{ address: Literal(newAddress) }],
        }
      );

      expect(result).toEqual({
        ...user,
        address: newAddress,
      });

      const after = await database.scan();
      expect(after).not.toContainEqual(user);
      expect(after).toContainEqual(result);
    });

    it("only performs conditional SET updates for keys that don't exist on an existing item in the database", async () => {
      expect.assertions(3);

      const before = await database.scan();
      const [user] = before;

      const result = await database.update(
        { type: user.type, id: user.id },
        {
          set: [
            { age: user.age + 1 },
            { name: 'TESTING', email: 'email@test.com' },
          ],
        }
      );

      const expected = {
        ...user,
        age: user.age + 1,
        name: user.name,
        email: 'email@test.com',
      };

      expect(result).toEqual(expected);

      const after = await database.scan();
      expect(after).not.toContainEqual(user);
      expect(after).toContainEqual(result);
    });

    it('sets nested attributes', async () => {
      expect.assertions(3);

      const before = await database.scan();
      const [user] = before;

      const result = await database.update(
        { type: user.type, id: user.id },
        {
          set: [{ address: { street: `${user.id} boulevard` } }],
        }
      );

      expect(result).toEqual({
        ...user,
        address: {
          ...user.address,
          street: `${user.id} boulevard`,
        },
      });

      const after = await database.scan();
      expect(after).not.toContainEqual(user);
      expect(after).toContainEqual(result);
    });

    it("conditionally sets nested attributes that don't exist", async () => {
      expect.assertions(3);

      const before = await database.scan();
      const [user] = before;

      const result = await database.update(
        { type: user.type, id: user.id },
        {
          set: [
            {
              address: {
                street: `rue de ${user.id} `,
                postcode: 'POSTCODE!!!!',
              },
            },
            { address: { street: `${user.id} boulevard`, city: 'Manchester' } },
          ],
        }
      );

      expect(result).toEqual({
        ...user,
        address: {
          ...user.address,
          postcode: 'POSTCODE!!!!',
          city: 'Manchester',
        },
      });

      const after = await database.scan();
      expect(after).not.toContainEqual(user);
      expect(after).toContainEqual(result);
    });
  });

  describe('REMOVE updates', () => {
    it('removes attributes from an existing item in the database', async () => {
      expect.assertions(3);

      const before = await database.scan();
      const [user] = before;

      const result = await database.update(
        { type: user.type, id: user.id },
        {
          remove: { age: true, email: true },
        }
      );

      const { age, email, ...expected } = user;

      expect(result).toEqual(expected);

      const after = await database.scan();
      expect(after).not.toContainEqual(user);
      expect(after).toContainEqual(result);
    });

    it('removes nested attributes from an existing item in the database', async () => {
      expect.assertions(3);

      const before = await database.scan();
      const [user] = before;

      const result = await database.update(
        { type: user.type, id: user.id },
        {
          remove: { address: { street: true } },
        }
      );
      const {
        address: { street, ...address },
        ...expected
      } = user;

      expect(result).toEqual({
        ...expected,
        address,
      });

      const after = await database.scan();
      expect(after).not.toContainEqual(user);
      expect(after).toContainEqual(result);
    });
  });

  describe('ADD updates', () => {
    it('adds number attributes to an existing item in the database', async () => {
      expect.assertions(3);

      const before = await database.scan();
      const [user] = before;

      const result = await database.update(
        { type: user.type, id: user.id },
        {
          add: { testsWritten: 139 },
        }
      );

      const expected = { ...user, testsWritten: 139 };

      expect(result).toEqual(expected);

      const after = await database.scan();
      expect(after).not.toContainEqual(user);
      expect(after).toContainEqual(result);
    });

    it('adds a number to an existing attribute to an item in the database', async () => {
      expect.assertions(3);

      const before = await database.scan();
      const [user] = before;

      const result = await database.update(
        { type: user.type, id: user.id },
        {
          add: { age: 13 },
        }
      );

      const expected = { ...user, age: user.age + 13 };

      expect(result).toEqual(expected);

      const after = await database.scan();
      expect(after).not.toContainEqual(user);
      expect(after).toContainEqual(result);
    });

    it('adds dynamodb set attributes to an existing item in the database', async () => {
      expect.assertions(3);

      const before = await database.scan();
      const [user] = before;

      const set2 = createSet(['this is another set']);

      const result = await database.update(
        { type: user.type, id: user.id },
        {
          add: { set2 },
        }
      );

      const expected = { ...user, set2 };

      expect(result).toEqual(expected);

      const after = await database.scan();

      expect(after).not.toContainEqual(user);
      expect(after).toContainEqual(result);
    });

    it('appends items to an existing set attribute on an item in the database', async () => {
      expect.assertions(3);

      const before = await database.scan();
      const [user] = before;

      const setToAppend = createSet(['second item']);

      const result = await database.update(
        { type: user.type, id: user.id },
        {
          add: { set1: setToAppend },
        }
      );

      const expected = {
        ...user,
        set1: createSet([...user.set1.values, ...setToAppend.values]),
      };

      expect(result).toEqual(expected);

      const after = await database.scan();
      expect(after).not.toContainEqual(user);
      expect(after).toContainEqual(result);
    });
  });

  describe('DELETE updates', () => {
    it('removes items from a set attribute on an item in the database', async () => {
      expect.assertions(3);

      const before = await database.scan();
      const [user] = before;

      const toDelete = user.set1.values[0];

      const result = await database.update(
        { type: user.type, id: user.id },
        {
          delete: { set1: createSet([toDelete]) },
        }
      );

      const expected = {
        ...user,
        set1: createSet(user.set1.values.filter((v) => v !== toDelete)),
      };

      expect(result).toEqual(expected);

      const after = await database.scan();
      expect(after).not.toContainEqual(user);
      expect(after).toContainEqual(result);
    });
  });
});
