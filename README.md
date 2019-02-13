# Jedlik

Jedlik is an extensible DynamoDB ODM for Node.

Jedlik allows you to create plain JavaScript classes to represent entities in your domain.
Extending these classes from Jedlik's `Model` class enhances the class by introducing behaviour to allow it to interact with DynamoDB in a simple way.

## Install

Yarn:
`yarn add @peak-ai/jedlik`
NPM:
`npm i -S @peak-ai/jedlik`

Unstable releases are published as `develop` - e.g. `yarn add @peak-ai/jedlik@develop`

## Usage

```js
const jedlik = require('@peak-ai/jedlik');

const Model = jedlik.Model({
  // the name of the DynamoDB table the model should write to
  // it is assumed this table exists
  TableName: 'users',
});

class User extends Model {
  constructor({ id, name }) {
    this.id = id;
    this.name = name;
  }
}

const user = new User({ id: 1, name: 'Fred' });

user.save()
  .then(() => User.get({ id: 1 })) // query on the table's key schema
  .then((data) => {
    console.log(data)
    /*
    User {
      id: 1,
      name: 'Fred'
    }
    */
  });
```

## API

### `jedlik.Model({ table, schema, timestamps = false, dynamoConfig = {}}) => Model`

#### table (String - required)

Name of the DynamoDB table to interact with

#### schema (Object - required)

Schema describing the shape of the item. Should be an object with the following shape:

```js
const schema = {
  propertyName: {
    required: Boolean, // if true, `document.save` or `Model.create` will throw a ValidationError if the key is missing
    default: 'any value', // Value to set on non-required fields that are undefined on the document. Should be present if the field is not required. Else will default to null.
  },
};
```

#### `timestamps (Bool|Function) (default = false)`

If true, saving will add a createdAt (on first save) or updatedAt timestamp.

By default this will be milliseconds since unix epoch (using `moment.utc.valueOf()`).

Optionally, you can pass in your own function to generate a timestamp.

#### `dynamoConfig (Object) (default = {})`

Optional config to pass to the underlying [`AWS.DynamoDB` service constructor from the AWS SDK.](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property)

### `Model - Class`

#### Properties

#### `db`

The underlying `AWS.DynamoDB.DocumentClient` service, exposed for performing custom queries etc.

All methods are promisified, so you can just do `thing.db.query(params).then(...)`, rather than passing a callback, or using the `.promise` method.

#### static `db`

The underlying `AWS.DynamoDB.DocumentClient` service, exposed for performing custom queries etc.

All methods are promisified, so you can just do `thing.db.query(params).then(...)`, rather than passing a callback, or using the `.promise` method.

#### static `table`

The name of the table, passed in during the module initialization.

#### Methods

#### static `create(item)`

Writes the given item to the database and returns a new instance of the model.
Shorthand for creating a new instance and saving it:

```js
Thing.create(item);

// is the same as

const thing = new Thing(item);
thing.save();
```

#### static `query(key, [index = null])`

Resolves with an array of items which match the given key parameters. Take an optional index parameter to query against a secondary index.
Returned items are instances of the model.

#### static `first(key, [index = null])`

Convenience method which returns the first item found by the `Model.query` method, or null if no items are found.

#### static `get(key)`

Resolves with the item that matches the given key parameter.
The returned item is an instance of the model.
Returns `null` if the item is not found.

**N.B.** The key must be the full primary key defined in the table schema. If the table has a composite key, both the partition key and sort key must be provided. You cannot search on a secondary index. If you need to do one of these, use `Model.query` or `Model.first` instead.

#### static `delete(key)`

Deletes the item that matches the given key parameter.
Resolves as `null`.

#### `save(key, [index = null])`

Saves the instance of the model to DynamoDB, either overwriting the existing item with the given primary key, or creating a new one.
Resolves with the instance.

#### `toObject()`

Returns a plain JavaScript object representation of the document according to the schema (with all internals/methods etc removed).

## Development

### Getting Started

- `git clone git@github.com:PeakBI/jedlik.git`
- `yarn`

### Build

- `yarn build` uses babel and rollup to output two builds:
- - a CommonJS build in `dist`
- - a ES Module build in `es`

### Test

- `yarn test` will run unit tests using Jest

### Publish

- Use `yarn publish` to publish the package to the npm registry.
- When developing, if you need to test a change on another project you have two options:
- - **Preferred** - in the `package.json` of the other project, set the Jedlik version to `file:/absolute/path/to/jedlik/project`.
- - Publish the package to npm with the `develop` tag - `yarn publish --tag develop`. You can then install the unstable version using `yarn add @peak-ai/jedlik@develop` without having to increase the version number. This is good for using the unstable version on the deployed dev environment.
