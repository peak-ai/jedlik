# Jedlik

Jedlik is an extensible DynamoDB ODM for Node, written in TypeScript.

Jedlik allows you to utilize the power of JavaScript classes to create models of entities in your domain, while introducing behaviour that allows you to interact with DynamoDB in a simple way.

## Install

Yarn:
`yarn add @peak-ai/jedlik`
NPM:
`npm i -S @peak-ai/jedlik`

## Usage

```ts
import * as jedlik from '@peak-ai/jedlik';
import * as Joi from '@hapi/joi';

interface UserProps {
  id: number;
  name: string;
  type: 'admin' | 'user';
}

const schema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  type: Joi.string().allow('admin', 'user').required(),
});

// the name of the DynamoDB table the model should write to
// it is assumed this table exists
const Users = new jedlik.Model<UserProps>({ table: 'users', schema });

const user = Users.create({ id: 1, name: 'Fred' }); // create a new document locally

await user.save(); // write the data to the database

user.set({ name: 'Ronak' }); // update an attribute locally

console.log(user.get('name')); // get an attribute

Users.on('save', (u) => {
  console.log(u.toObject()); // get the attributes as a plain object
});

await user.save(); // write the changes to the database

const user2 = await Users.get({ id: 2 }); // query the database

console.log(user2.toObject());

// advanced filtering
const admins = await Users.scan({
  filters: { key: 'type', operator: '=', value: 'admin' },
});
```

## API

### `class Model<T>`

#### `constructor(options: ModelOptions, config?: ClientOptions): Model<T>`

Constructor function that creates a new `Model`.

##### `options.table (String - required)`

Name of the DynamoDB table to interact with

##### `options.schema (Schema<T> - required)`

- `schema.validate(item: T): { value: T, error: { name: string, details: { message: string }[] } }`

A function that validates the values in a Document and applies any defaults. This is designed to be used with [Joi](https://hapi.dev/module/joi/).

##### `config`

Optional config that is passed directly to the underlying [`AWS.DynamoDB` service constructor from the AWS SDK.](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property)

#### `Model.create(item: T): Document<T>`

Returns a new `Document` using the attributes of the given item.

#### `Model.query(key: Key<T>, options?: QueryOptions<T>): Promise<Document<T>[]>`

Recursively queries the table and resolves with an array of documents which match the given key. Takes an optional options object.

- `options.filters?: ConditionMap<T>` - filters to apply to the query
- `options.index?: IndexName;` - the name of the index to query
- `options.limit?: number;` - limit the number of documents returned
- `options.sort?: 'asc' | 'desc';` - sort direction of the results (N.B. this uses DynamoDB's ScanIndexForward to sort)

Returned items are type `Document<T>`.

#### `Model.first(key: Key<T>, options? FirstOptions<T>): Promise<Document<T>>`

Convenience method which returns the first document found by the `Model.query` method. Throws an error if no items are found.

- `options.filters?: ConditionMap<T>` - filters to apply to the query
- `options.index?: IndexName;` - the name of the index to query
- `options.sort?: 'asc' | 'desc';` - sort direction of the results (N.B. this uses DynamoDB's ScanIndexForward to sort)

#### `Model.scan(options? ScanOptions<T>): Promise<Document<T>>`

Performs a scan of the entire table (recursively) and returns all the found documents.

- `options.filters?: ConditionMap<T>` - filters to apply to the scan
- `options.index?: IndexName;` - the name of the index to scan
- `options.limit?: number;` - limit the number of documents returned

#### `Model.get(key: Key<T>) : Promise<Document<T>>`

Resolves with the document that matches the given key parameter. Throws an error if no document exists.

**N.B.** The key must be the full primary key defined in the table schema. If the table has a composite key, both the partition key and sort key must be provided. You cannot search on a secondary index. If you need to do one of these, use `Model.query` or `Model.first` instead.

#### `Model.delete(key: Key<T>, options? DeleteOptions<T>): Promise<void>`

Deletes the document that matches the given key parameter.

- `options.conditions?: ConditionMap<T>` - conditions to apply to the deletion - if the condition evaluates to false, then the delete will fail

#### `Model.on(eventName: EventName, callback: (document?: Document<T>) => void): void`

Registers an event handler to be fired after successful events. Valid event names are `delete` and `save`.

### `class Document<T>`

A `Document` represents a single item in your DynamoDB table.

#### `Document.get(key: keyof T): T[K]`

Returns the value of an attribute on the document.

#### `Document.set(props: Partial<T>): void`

Sets the value of an attribute on the document.

#### `Document.save(options? PutOptions<T>): Promise<void>`

Saves the Documents attributes to DynamoDB, either overwriting the existing item with the given primary key, or creating a new one.

- `options.conditions?: ConditionMap<T>` - - conditions to apply to the underlying put request - if the condition evaluates to false, then the request will fail

#### `Document.toObject(): T`

Returns a plain JavaScript object representation of the documents attributes.

### `ConditionMap<T>`

Condition maps give you a nicer way of writing filter and condition expressions without worrying about `ExpressionAttributeNames` and `ExpressionAttributeValues`.

A simple condition would look like this:

```ts
const condition = { key: 'price', operator: '>', value: 10 };
```

This says **"_do this thing if the price is greater than 10_"** - you could use it filter results in a query, or to prevent an item from being deleted or overwritten.

You can also get more complex, using logical groups:

```ts
const complexCondition = {
  $or: [
    { key: 'price', operator: '>', value: 10 },
    {
      $and: [
        { key: 'price', operator: '>', value: 5 },
        { key: 'name', operator: '=', value: 'MyItem' },
      ],
    },
  ],
};
```

This says **"_do this thing if either a) the price is greater than 10, or b) the price is greater than 5 and the name is MyItem_"**

## Roadmap

Some features that I'd still like to add

- Support for update requests - at the minute only `put` is supported as way of writing to the database
- Support for more complicated filter types - [the full list is here](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html)
- Ability to add methods to Documents and Models
- Ability to add "virtual properties" to documents - like getters
- Timestamps
- Key validation. For example - You should only be able to pass key properties into `Model.get`. And you shouldn't really be able to update the key properties on a document - if you change the value of a key property of an existing document, a new document will be created. We should make this better, even if it's just by adding better type checking. Currently when you need to give a key, it just uses `Partial<T>` as the type.

## Development

### Getting Started

- `git clone git@github.com:peak-ai/jedlik.git`
- `yarn`

### Build

- `yarn build` compiles the TypeScript code into a `dist` directory.

### Test

- `yarn test` will run unit and integration tests using Jest. Integration tests run against a Dockerized DynamoDB Local. You'll need the Docker daemon running for this.

### Contributing

- Branch off `develop` please. PR's will get merged to `develop`. Releases will go from `develop` to `master`

### Publish

- Run the tests and linter on the `develop` branch
- Switch to `master` and merge in `develop`
- Use `yarn version` to increase the package version and release the new version. This will do the following things:
  - Run the tests and linter
  - Increase the version
  - Add a new git tag for the version
  - push the new tag to GitHub
  - publish the package to npm
  - push the released code to GitHub `master`
