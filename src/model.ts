import { DynamoDB } from 'aws-sdk';
import * as moment from 'moment';
import applySchema, { ISchema } from './apply-schema';
import DocumentClient, { DocumentClientOptions } from './document-client';
import { JedlikError } from './errors';
import * as QueryHelpers from './query-helpers';

type TimestampFunction = () => any;

interface IJedlikOptions {
  table: string;
  schema: ISchema;
  timestamps?: TimestampFunction | boolean;
  dynamoConfig?: DocumentClientOptions;
}

export interface IModelConstructor {
  db: DocumentClient;
  table: string;
  new (properties?: object): IModel;
  create(values: object): Promise<IModel>;
  query(key: DynamoDBKey, index?: DynamoDBIndexName): Promise<IModel[]>;
  first(key: DynamoDBKey, index?: DynamoDBIndexName): Promise<IModel | null>;
  get(key: DynamoDBKey): Promise<IModel | null>;
  delete(key: DynamoDBKey): Promise<void>;
}

export interface IModel {
  db: DocumentClient;
  [key: string]: any;
  createdAt?: any;
  updatedAt?: any;
  save(): Promise<IModel>;
  toObject(): IModelPropertiesMap;
}

export interface IModelPropertiesMap {
  [key: string]: any;
  createdAt?: any;
  updatedAt?: any;
}

type DynamoDBKey = DynamoDB.DocumentClient.Key;
type DynamoDBIndexName = DynamoDB.DocumentClient.IndexName;

const defaults = {
  dynamoConfig: {},
  timestamps: false,
};

export default ({
  table, schema, dynamoConfig = defaults.dynamoConfig, timestamps = defaults.timestamps,
}: IJedlikOptions): IModelConstructor => {
  if (!table) {
    throw new JedlikError('"table" option is required.');
  }

  if (!schema) {
    throw new JedlikError('"schema" option is required.');
  }

  const clientConfig = {
    ...dynamoConfig,
    params: {
      ...dynamoConfig.params,
      TableName: table,
    },
  };

  const db = new DocumentClient(clientConfig);

  class Model implements IModel {
    public static readonly db: DocumentClient = db;
    public static readonly table: string = table;

    public static async create(values: object): Promise<Model> {
      const item = new this(values);
      return item.save();
    }

    public static async query(key: DynamoDBKey, index?: DynamoDBIndexName): Promise<Model[]> {
      const params: DynamoDB.DocumentClient.QueryInput = {
        ExpressionAttributeNames: QueryHelpers.getExpressionAttributeNames(key),
        ExpressionAttributeValues: QueryHelpers.getExpressionAttributeValues(key),
        KeyConditionExpression: QueryHelpers.getKeyConditionExpression(key),
        TableName: table,
      };

      if (index) {
        params.IndexName = index;
      }

      const { Items } = await db.query(params);

      if (!Items) return [];

      return Items.map(item => new this(item));
    }

    public static async first(key: DynamoDBKey, index?: DynamoDBIndexName): Promise<Model | null> {
      const items = await this.query(key, index);

      if (items.length === 0) {
        return null;
      }

      return items[0];
    }

    public static async get(key: DynamoDBKey): Promise<Model | null> {
      const { Item } = await db.get({
        Key: key,
        TableName: table,
      });

      if (!Item) {
        return null;
      }

      return new this(Item);
    }

    public static async delete(key: DynamoDBKey): Promise<void> {
      await db.delete({
        Key: key,
        TableName: table,
      });
    }

    public readonly db: DocumentClient;
    public createdAt: any;
    public updatedAt: any;

    constructor(properties?: object) {
      this.db = db;
    }

    public async save(): Promise<Model> {
      if (timestamps) {
        const timestamp = (typeof timestamps === 'function' ? timestamps() : moment().utc().valueOf());
        if (this.createdAt) {
          this.updatedAt = timestamp;
        } else {
          this.createdAt = timestamp;
          this.updatedAt = null;
        }
      }

      await this.db.put({
        Item: this.toObject(),
        TableName: table,
      });

      return this;
    }

    public toObject(): IModelPropertiesMap {
      return applySchema(schema, this, { timestamps: Boolean(timestamps) });
    }
  }

  return Model;
};
