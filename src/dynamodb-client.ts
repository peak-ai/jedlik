import {
  DocumentClient,
  DocumentClientOptions,
  IndexName,
  DeleteInput,
  PutInput,
  QueryInput,
  ScanInput,
  UpdateInput,
  Key as DocumentClientKey,
  DynamoDBList as DDBList,
  DynamoDBSet as DDBSet,
} from './document-client';

import {
  ConditionExpressions,
  KeyExpressions,
  UpdateExpressions,
} from './expressions';

export type DynamoDBList = DDBList;
export type DynamoDBSet = DDBSet;

export interface ScanOptions<T> {
  filters?: ConditionExpressions.ConditionMap<T>;
  index?: IndexName;
  limit?: number;
}

export interface QueryOptions<T> {
  filters?: ConditionExpressions.ConditionMap<T>;
  index?: IndexName;
  limit?: number;
  sort?: 'asc' | 'desc';
}

export interface FirstOptions<T> {
  filters?: ConditionExpressions.ConditionMap<T>;
  index?: IndexName;
  sort?: 'asc' | 'desc';
}

export interface PutOptions<T> {
  conditions?: ConditionExpressions.ConditionMap<T>;
}

export interface DeleteOptions<T> {
  conditions?: ConditionExpressions.ConditionMap<T>;
}

export type Key<T> = Partial<T>;

export type ClientOptions = DocumentClientOptions;

export class DynamoDBClient<T> {
  static createSet(list: DynamoDBList): DynamoDBSet {
    return new DocumentClient().createSet(list);
  }

  private documentClient: DocumentClient;

  constructor(private tableName: string, config: DocumentClientOptions = {}) {
    this.documentClient = new DocumentClient({
      ...config,
      params: {
        ...config.params,
        TableName: tableName,
      },
    });
  }

  public scan(options: ScanOptions<T> = {}): Promise<T[]> {
    return this.recursiveScan(options);
  }

  public async query(key: Key<T>, options: QueryOptions<T> = {}): Promise<T[]> {
    return this.recursiveQuery(key, options);
  }

  public async first(key: Key<T>, options?: FirstOptions<T>): Promise<T> {
    const items = await this.query(key, options);

    if (items.length === 0) {
      throw new Error('Not Found');
    }

    return items[0];
  }

  public async get(key: Key<T>): Promise<T> {
    const { Item } = await this.documentClient.get({
      Key: key,
      TableName: this.tableName,
    });

    if (!Item) {
      throw new Error('Not Found');
    }

    return Item as T;
  }

  public async delete(
    key: Key<T>,
    options: DeleteOptions<T> = {}
  ): Promise<void> {
    const params: DeleteInput = {
      Key: key,
      TableName: this.tableName,
    };

    if (options.conditions) {
      params.ExpressionAttributeNames = ConditionExpressions.getAttributeNamesFromConditions(
        options.conditions
      );
      params.ExpressionAttributeValues = ConditionExpressions.getAttributeValuesFromConditions(
        options.conditions
      );
      params.ConditionExpression = ConditionExpressions.getConditionExpression(
        options.conditions
      );
    }

    await this.documentClient.delete(params);
  }

  public async put(item: T, options: PutOptions<T> = {}): Promise<void> {
    const params: PutInput = {
      Item: item,
      TableName: this.tableName,
    };

    if (options.conditions) {
      params.ExpressionAttributeNames = ConditionExpressions.getAttributeNamesFromConditions(
        options.conditions
      );
      params.ExpressionAttributeValues = ConditionExpressions.getAttributeValuesFromConditions(
        options.conditions
      );
      params.ConditionExpression = ConditionExpressions.getConditionExpression(
        options.conditions
      );
    }

    await this.documentClient.put(params);
  }

  public async update(
    key: Key<T>,
    updates: UpdateExpressions.UpdateMap<T>
  ): Promise<T> {
    const parser = new UpdateExpressions.UpdateExpressionParser(updates);
    const params: UpdateInput = {
      TableName: this.tableName,
      Key: key,
      UpdateExpression: parser.expression,
      ExpressionAttributeNames: parser.expressionAttributeNames,
      ReturnValues: 'ALL_NEW',
    };

    if (Object.keys(parser.expressionAttributeValues).length > 0) {
      params.ExpressionAttributeValues = parser.expressionAttributeValues;
    }

    const { Attributes } = await this.documentClient.update(params);

    return Attributes as T;
  }

  private async recursiveScan(
    options: ScanOptions<T> = {},
    lastKey?: DocumentClientKey
  ): Promise<T[]> {
    const params: ScanInput = {
      TableName: this.tableName,
    };

    if (options.index) {
      params.IndexName = options.index;
    }

    if (options.filters) {
      params.ExpressionAttributeNames = ConditionExpressions.getAttributeNamesFromConditions(
        options.filters
      );
      params.ExpressionAttributeValues = ConditionExpressions.getAttributeValuesFromConditions(
        options.filters
      );
      params.FilterExpression = ConditionExpressions.getConditionExpression(
        options.filters
      );
    }

    if (options.limit && options.limit > 0) {
      params.Limit = options.limit;
    }

    if (lastKey) {
      params.ExclusiveStartKey = lastKey;
    }

    let next: T[] = [];

    const { Items, LastEvaluatedKey } = await this.documentClient.scan(params);

    if (
      LastEvaluatedKey &&
      (!options.limit || (Items && Items.length < options.limit))
    ) {
      next = await this.recursiveScan(options, LastEvaluatedKey);
    }

    if (!Items) return [];

    return [...Items, ...next] as T[];
  }

  private async recursiveQuery(
    key: Key<T>,
    options: QueryOptions<T> = {},
    lastKey?: DocumentClientKey
  ): Promise<T[]> {
    const params: QueryInput = {
      ExpressionAttributeNames: KeyExpressions.getAttributeNamesFromKey(key),
      ExpressionAttributeValues: KeyExpressions.getAttributeValuesFromKey(key),
      KeyConditionExpression: KeyExpressions.getKeyConditionExpression(key),
      TableName: this.tableName,
    };

    if (options.index) {
      params.IndexName = options.index;
    }

    if (options.filters) {
      Object.assign(
        params.ExpressionAttributeNames,
        ConditionExpressions.getAttributeNamesFromConditions(options.filters)
      );

      Object.assign(
        params.ExpressionAttributeValues,
        ConditionExpressions.getAttributeValuesFromConditions(options.filters)
      );

      params.FilterExpression = ConditionExpressions.getConditionExpression(
        options.filters
      );
    }

    if (options.sort) {
      params.ScanIndexForward = options.sort === 'asc';
    }

    if (options.limit && options.limit > 0) {
      params.Limit = options.limit;
    }

    if (lastKey) {
      params.ExclusiveStartKey = lastKey;
    }

    let next: T[] = [];

    const { Items, LastEvaluatedKey } = await this.documentClient.query(params);

    if (
      LastEvaluatedKey &&
      (!options.limit || (Items && Items.length < options.limit))
    ) {
      next = await this.recursiveQuery(key, options, LastEvaluatedKey);
    }

    if (!Items) return [];

    return [...Items, ...next] as T[];
  }
}
