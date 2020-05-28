import { Endpoint, DynamoDB } from 'aws-sdk';
import { Database } from '../src/database';

enum UserType {
  Admin = 'admin',
  User = 'user',
}

interface User {
  id: number;
  type: UserType;
  name: string;
  age: number;
}

function generateUser(id: number): User {
  const type = Math.random() > 0.5 ? UserType.Admin : UserType.User;
  return {
    id,
    type,
    name: `${type}-${id}`,
    age: Math.ceil(Math.random() * 80),
  };
}

const USERS: User[] = [];

(function generateTestUsers() {
  for (let id = 1; id <= 50; id += 1) {
    const user = generateUser(id);
    USERS.push(user);
  }
}());

const SORTED_USERS_ASCENDING: User[] = [
  ...USERS.filter(user => user.type === UserType.Admin).sort((a, b) => a.id - b.id),
  ...USERS.filter(user => user.type === UserType.User).sort((a, b) => a.id - b.id),
];

const SORTED_USERS_DESCENDING: User[] = [
  ...USERS.filter(user => user.type === UserType.Admin).sort((a, b) => b.id - a.id),
  ...USERS.filter(user => user.type === UserType.User).sort((a, b) => b.id - a.id),
];

const SORTED_USERS_SECONDARY_INDEX: User[] = (function() {
  const sortedAges = USERS
    .map(user => user.age)
    .filter(((age, index, array) => array.indexOf(age) === index))
    .sort((a, b) => a - b);

  return sortedAges.reduce((list, age) => (
    list.concat(USERS.filter(user => user.age === age).sort((a, b) => a.age - b.age))
  ), [] as User[]);
}());

let database: Database<User>;

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
  await dynamo.createTable({
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
        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
  }).promise();

  await Promise.all(USERS.map(user => client.put({
    TableName: TABLE_NAME,
    Item: user,
  }).promise()));

  database = new Database<User>(TABLE_NAME, dynamoConfig);
});

afterEach(async () => {
  await dynamo.deleteTable({
    TableName: TABLE_NAME,
  }).promise();
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

    const result = await database.scan({ filters: { key: 'id', operator: '<', value: 3 } });
    const expected = SORTED_USERS_ASCENDING.filter((user => user.id < 3));

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
    const expected = SORTED_USERS_ASCENDING.filter(user => (
      (user.age > 60) || (user.type === UserType.Admin)
    ));

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

    const [{ id }] = SORTED_USERS_ASCENDING.filter(user => user.type === UserType.Admin);

    const result = await database.query({ type: UserType.Admin, id });
    const expected = SORTED_USERS_ASCENDING.filter(
      user => user.type === UserType.Admin && user.id === id,
    );

    expect(result).toEqual(expected);
  });

  it('returns a limited result set', async () => {
    expect.assertions(1);

    const result = await database.query({ type: UserType.Admin }, { limit: 4 });
    const expected = SORTED_USERS_ASCENDING.filter(user => (
      user.type === UserType.Admin
    )).slice(0, 4);

    expect(result).toEqual(expected);
  });

  it('returns a sorted result set', async () => {
    expect.assertions(1);

    const result = await database.query({ type: UserType.Admin }, { sort: 'desc' });
    const expected = SORTED_USERS_DESCENDING.filter(user => user.type === UserType.Admin);

    expect(result).toEqual(expected);
  });

  it('returns a filtered result set', async () => {
    expect.assertions(1);

    const result = await database.query(
      { type: UserType.User },
      { filters: { key: 'age', operator: '>', value: 50 } }
    );
    const expected = SORTED_USERS_ASCENDING.filter(user => (
      (user.type === UserType.User) && (user.age > 50)
    ));

    expect(result).toEqual(expected);
  });

  it('applies complex filters correctly', async () => {
    expect.assertions(1);

    const result = await database.query({ type: UserType.Admin }, {
      filters: {
        $or: [
          { key: 'age', operator: '<', value: 30 },
          { key: 'age', operator: '>', value: 55 },
        ],
      },
    });
    const expected = SORTED_USERS_ASCENDING.filter(user => (
      (user.type === UserType.Admin) && ((user.age > 55) || user.age < 30)
    ));

    expect(result).toEqual(expected);
  });

  it('returns items using a secondary index', async () => {
    expect.assertions(1);
    const [{ age }] = USERS;
    const result = await database.query({ age }, { index: 'age-id' });
    const expected = SORTED_USERS_SECONDARY_INDEX.filter(user => user.age === age);

    expect(result).toEqual(expected);
  });
});

describe('first', () => {
  it('returns the first item with the given key', async () => {
    expect.assertions(1);

    const result = await database.first({ type: UserType.Admin });
    const [expected] = SORTED_USERS_ASCENDING.filter(user => user.type === UserType.Admin);

    expect(result).toEqual(expected);
  });

  it('throws an error if there is no items in the result set', async () => {
    expect.assertions(1);

    await expect(database.first({
      type: UserType.Admin,
      id: (USERS.length * 2),
    })).rejects.toThrow('Not Found');
  });

  it('returns the first item of a sorted result set', async () => {
    expect.assertions(1);

    const result = await database.first({ type: UserType.Admin }, { sort: 'desc' });
    const [expected] = SORTED_USERS_DESCENDING.filter(user => user.type === UserType.Admin);

    expect(result).toEqual(expected);
  });

  it('returns the first item of a filtered result set', async () => {
    expect.assertions(1);

    const result = await database.first(
      { type: UserType.User },
      { filters: { key: 'age', operator: '>', value: 50 } }
    );
    const [expected] = SORTED_USERS_ASCENDING.filter(user => (
      (user.type === UserType.User) && (user.age > 50)
    ));

    expect(result).toEqual(expected);
  });

  it('returns the first item of a complex filter set', async () => {
    expect.assertions(1);

    const result = await database.first({ type: UserType.Admin }, {
      filters: {
        $or: [
          { key: 'age', operator: '<', value: 30 },
          { key: 'age', operator: '>', value: 55 },
        ],
      },
    });
    const [expected] = SORTED_USERS_ASCENDING.filter(user => (
      (user.type === UserType.Admin) && ((user.age > 55) || user.age < 30)
    ));

    expect(result).toEqual(expected);
  });

  it('returns the first item using a secondary index', async () => {
    expect.assertions(1);
    const [{ age }] = USERS;
    const result = await database.first({ age }, { index: 'age-id' });
    const [expected] = SORTED_USERS_SECONDARY_INDEX.filter(user => user.age === age);

    expect(result).toEqual(expected);
  });
});

describe('get', () => {
  it('returns the item with the given key', async () => {
    expect.assertions(1);
    const [, , expected] = SORTED_USERS_ASCENDING.filter(user => user.type === UserType.Admin);

    const result = await database.get({ type: expected.type, id: expected.id });

    expect(result).toEqual(expected);
  });

  it('throws an error if there is no items in the result set', async () => {
    expect.assertions(1);

    await expect(database.get({
      type: UserType.Admin,
      id: (USERS.length * 2),
    })).rejects.toThrow('Not Found');
  });
});

describe('delete', () => {
  it('deletes the item with the given key', async () => {
    expect.assertions(2);
    const [, , item] = SORTED_USERS_ASCENDING.filter(user => user.type === UserType.Admin);

    const before = await database.query({ type: item.type, id: item.id });

    expect(before.length).toEqual(1);

    await database.delete({ type: item.type, id: item.id });

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
});
