# Jedlik

Jedlik is an extensible DynamoDB ODM for Node, written in TypeScript.

Jedlik allows you to utilize the power of JavaScript classes to create models of entities in your domain, while introducing behaviour that allows you to interact with DynamoDB in a simple way.

## Install

Yarn:
`yarn add @peak-ai/jedlik`
NPM:
`npm i -S @peak-ai/jedlik`

## Usage

You can use package like [joi](https://www.npmjs.com/package/joi) to validate the schema.

```ts
import * as jedlik from '@peak-ai/jedlik';
import * as Joi from 'joi';

interface UserProps {
  id: number;
  name: string;
  type: 'admin' | 'user';
}

const schema = Joi.object({
  id: Joi.number().required(),
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
const adminsCalledRon_ = await Users.scan({
  filters: {
    $or: [
      { key: 'type', operator: '=', value: 'admin' },
      { key: 'name', operator: 'begins_with', value: 'Ron' },
    ],
  },
});
```

## API

### `class Model<T>`

#### `constructor(options: ModelOptions, config?: ServiceConfig): Model<T>`

Constructor function that creates a new `Model`.

##### `options.table (String - required)`

Name of the DynamoDB table to interact with

##### `options.schema (Schema<T> - required)`

- `schema.validate(item: T): { value: T, error: { name: string, details: { message: string }[] } }`

A function that validates the values in a Document and applies any defaults. This is designed to be used with [Joi](https://hapi.dev/module/joi/).

##### `config`

Optional config that is passed directly to the underlying [`AWS.DynamoDB.DocumentClient` service constructor from the AWS SDK.](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property)

#### `Model.create(item: T): Document<T>`

Returns a new `Document` using the attributes of the given item.

#### `Model.query(key: Key<T>, options?: QueryOptions<T>): Promise<Document<T>[]>`

Recursively queries the table and resolves with an array of documents which match the given key. Takes an optional options object.

- `options.filters?: Conditions<T>` - filters to apply to the query
- `options.index?: IndexName;` - the name of the index to query
- `options.limit?: number;` - limit the number of documents returned
- `options.sort?: 'asc' | 'desc';` - sort direction of the results (N.B. this uses DynamoDB's ScanIndexForward to sort)

Returned items are type `Document<T>`.

#### `Model.first(key: Key<T>, options? FirstOptions<T>): Promise<Document<T>>`

Convenience method which returns the first document found by the `Model.query` method. Throws an error if no items are found.

- `options.filters?: Conditions<T>` - filters to apply to the query
- `options.index?: IndexName;` - the name of the index to query
- `options.sort?: 'asc' | 'desc';` - sort direction of the results (N.B. this uses DynamoDB's ScanIndexForward to sort)

#### `Model.scan(options? ScanOptions<T>): Promise<Document<T>[]>`

Performs a scan of the entire table (recursively) and returns all the found documents.

- `options.filters?: Conditions<T>` - filters to apply to the scan
- `options.index?: IndexName;` - the name of the index to scan
- `options.limit?: number;` - limit the number of documents returned

#### `Model.get(key: Key<T>) : Promise<Document<T>>`

Resolves with the document that matches the given key parameter. Throws an error if no document exists.

**N.B.** The key must be the full primary key defined in the table schema. If the table has a composite key, both the partition key and sort key must be provided. You cannot search on a secondary index. If you need to do one of these, use `Model.query` or `Model.first` instead.

#### `Model.delete(key: Key<T>, options? DeleteOptions<T>): Promise<void>`

Deletes the document that matches the given key parameter.

- `options.conditions?: Conditions<T>` - conditions to apply to the deletion - if the condition evaluates to false, then the delete will fail

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

- `options.conditions?: Conditions<T>` - - conditions to apply to the underlying put request - if the condition evaluates to false, then the request will fail

#### `Document.toObject(): T`

Returns a plain JavaScript object representation of the documents attributes.

### `class Client<T>`

A low-level DynamoDB client. It has all of the main functionality of the AWS DynamoDB document client. `Model` and `Document` classes use this behind the scenes.

This class is similar to the main `Model` class, but offers support for `put` and `update` requests, and doesn't have extra features such as validation and events, and it returns the data directly, rather than converting it to `Documents`.

#### `constructor(tableName: string, config?: ServiceConfig): Model<T>`

Constructor function that creates a new `Client`.

##### `table (String - required)`

Name of the DynamoDB table to interact with

##### `config`

Optional config that is passed directly to the underlying [`AWS.DynamoDB.DocumentClient` service constructor from the AWS SDK.](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property)

#### `Client.query(key: Key<T>, options?: QueryOptions<T>): Promise<T[]>`

Recursively queries the table and resolves with an array of documents which match the given key. Takes an optional options object.

- `options.filters?: Conditions<T>` - filters to apply to the query
- `options.index?: IndexName;` - the name of the index to query
- `options.limit?: number;` - limit the number of documents returned
- `options.sort?: 'asc' | 'desc';` - sort direction of the results (N.B. this uses DynamoDB's ScanIndexForward to sort)

Returned items are type `Document<T>`.

#### `Client.first(key: Key<T>, options? FirstOptions<T>): Promise<T>`

Convenience method which returns the first document found by the `Client.query` method. Throws an error if no items are found.

- `options.filters?: Conditions<T>` - filters to apply to the query
- `options.index?: IndexName;` - the name of the index to query
- `options.sort?: 'asc' | 'desc';` - sort direction of the results (N.B. this uses DynamoDB's ScanIndexForward to sort)

#### `Client.scan(options? ScanOptions<T>): Promise<T[]>`

Performs a scan of the entire table (recursively) and returns all the found documents.

- `options.filters?: Conditions<T>` - filters to apply to the scan
- `options.index?: IndexName;` - the name of the index to scan
- `options.limit?: number;` - limit the number of documents returned

#### `Client.get(key: Key<T>) : Promise<T>`

Resolves with the document that matches the given key parameter. Throws an error if no document exists.

**N.B.** The key must be the full primary key defined in the table schema. If the table has a composite key, both the partition key and sort key must be provided. You cannot search on a secondary index. If you need to do one of these, use `Client.query` or `Client.first` instead.

#### `Client.delete(key: Key<T>, options? DeleteOptions<T>): Promise<void>`

Deletes the document that matches the given key parameter.

- `options.conditions?: Conditions<T>` - conditions to apply to the deletion - if the condition evaluates to false, then the delete will fail

#### `Client.put(item: T, options: PutOptions<T> = {}): Promise<void>`

Saves an item into the database.

- `options.conditions?: Conditions<T>` - conditions to apply to the put request

#### `Client.update(key: Key<T>, updates: UpdateMap<T> ): Promise<T>`

Performs an update request on an item in the database. Resolves with the newly saved data.

- `options.key: Key<T>` - key of the item to update
- `options.updates: UpdateMap<T>` - updates to apply

### `Conditions<T>`

- [AWS Documentation - Condition Expressions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html)

Condition maps give you a nicer way of writing filter and condition expressions without worrying about `ExpressionAttributeNames` and `ExpressionAttributeValues`.

A simple condition would look like this:

```ts
const condition = { key: 'price', operator: '>', value: 10 };
```

This says **"_do this thing if the price is greater than 10_"** - you could use it filter results in a query, or to prevent an item from being deleted or overwritten.

You can also get more complex, using logical groups with `$and` `$or` and `$not` groups. `$and` and `$or` must be lists of condition groups. `$not` must be a single condition group:

```ts
const complexCondition = {
  $or: [
    { key: 'price', operator: '>', value: 10 },
    {
      $and: [
        { key: 'price', operator: '>', value: 5 },
        { $not: { key: 'name', operator: 'begins_with', value: 'MyItem' } },
      ],
    },
  ],
};
```

This says **"_do this thing if either a) the price is greater than 10, or b) the price is greater than 5 and the name noes not begin with MyItem_"** - the resulting ConditionExpression/FilterExpression sent to DynamoDB would look something like `(#price > :price10 OR (#price > :price5 AND NOT begins_with(#name, :name)))`.

#### Supported Operators

Supported operators are:

- `AND` (`$and`)
- `OR` (`$or`)
- `NOT` (`$not`)
- `=`
- `<>`
- `<`
- `<=`
- `>`
- `>=`
- `begins_with`
- `contains`
- `attribute_exists` - conditions with this operator do not accept a `value` key
- `attribute_not_exists` - conditions with this operator do not accept a `value` key

#### Workarounds

`BETWEEN`, `IN`, `attribute_type` and `size` operators are not currently supported.

These will be added at some point, but you can usually get around the lack of `BETWEEN` and `IN` support using `$and` or `$or` groups. e.g. `price BETWEEN 10 AND 20` can be done as:

```ts
{
  $and: [
    { key: 'price', operator: '>', value: 10 }
    { key: 'price', operator: '<', value: 20 }
  ]
}
```

### `UpdateMap<T>`

- [Documentation - Update Expressions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html)

`UpdateMaps` are used when making update requests using the `jedlik.Client` class and take away some of the complexity of writing and coordinating `UpdateExpressions`, `ExpressionAttributeNames` and `ExpressionAttributeValues`.

You can perform `set`, `remove`, `add`, and `delete` updates. You can combine different types of update in one expression - they will be applied in the aforementioned order.

#### Set updates

**Set** updates have two parts - normal updates (which are always applied) and conditional updates (which will only be applied if the attribute exists already):

```ts
{
  set: [{ id: 10, name: 'Michael' }, { age: 20 }];
}
```

This says **"_set the id to 10 and the name to Michael, and if the age property exists, set it to 20_"**

For setting nested attributes, just pass the partial object that you want to update. For example, if you have this object in your database:

```ts
{
  name: 'Michael',
  address: {
    street: 'Example Avenue',
    town: 'Exampleville',
  },
};
```

The following update:

```ts
client.update(key, { set: [{ address: { street: 'Different Street' } }] });
```

would only update the `street` property on the address.

If you wanted to override the whole address property, you can wrap the new value in the `Literal` function.

```ts
import { Literal } from '@peak-ai/jedlik';

client.update(key, {
  set: [{ address: Literal({ street: 'Different Street' }) }],
});
```

#### Remove updates

**Remove** updates remove an attribute from an item. Just pass the path to the value you want to delete, with a value of true

```ts
client.update(key, { delete: [{ address: { street: true } }] });
```

The above expression would delete the items `name` and `street.address` attributes.

#### Add updates

**Add** updates add values to a DynamoDB set, or to a numeric value. You can only add to sets or numbers. Note that DynamoDB sets are different to Arrays and native JavaScript Sets.

You can create a DynamoDB `Set` using the `createSet` function.

If you have the following object in your database:

```ts
{
  age: 10,
  favouriteFoods: createSet(['Pizza', 'Ice Cream']),
}
```

Then the following expression:

```ts
client.update(key, {
  add: [{ age: 1, favouriteFoods: createSet(['Chocolate']) }],
});
```

The resulting item would look like:

```ts
{
  age: 12,
  favouriteFoods: createSet(['Pizza', 'Ice Cream', 'Chocolate']), // Chocolate is added to the set
}
```

#### Delete updates

**Delete** updates remove items from a DynamoDB set. Note that DynamoDB sets are different to Arrays and native JavaScript Sets.

You can create a DynamoDB `Set` using the `createSet` function.

If you have the following object in your database:

```ts
{
  age: 10,
  favouriteFoods: createSet(['Pizza', 'Ice Cream']),
}
```

Then the following expression:

```ts
client.update(key, {
  delete: [{ favouriteFoods: createSet(['Pizza']) }],
});
```

The resulting item would look like:

```ts
{
  age: 12,
  favouriteFoods: createSet(['Ice Cream']), // Pizza is no longer in the set
}
```

## Roadmap

Some features that I'd still like to add

- Support for more complicated filter types - [the full list is here](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html)
- Ability to add methods to Documents and Models
- Ability to add "virtual properties" to documents - custom getters and setters
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
