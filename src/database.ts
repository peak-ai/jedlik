import {
  DocumentClient,
  DocumentClientOptions,
  IndexName,
  QueryInput,
  ScanInput,
  Key as DocumentClientKey,
} from './document-client';
import * as QueryHelpers from './query-helpers';

export interface ScanOptions<T> {
  filters?: QueryHelpers.FilterMap<T>;
  index?: IndexName;
  limit?: number;
}

export interface QueryOptions<T> {
  filters?: QueryHelpers.FilterMap<T>;
  index?: IndexName;
  limit?: number;
  sort?: 'asc' | 'desc';
}

export interface FirstOptions<T> {
  filters?: QueryHelpers.FilterMap<T>;
  index?: IndexName;
  sort?: 'asc' | 'desc';
}

export type Key<T> = Partial<T>;

export type DatabaseOptions = DocumentClientOptions;

export class Database<T> {
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

  public async delete(key: Key<T>): Promise<void> {
    await this.documentClient.delete({
      Key: key,
      TableName: this.tableName,
    });
  }

  public async put(item: T): Promise<void> {
    await this.documentClient.put({
      Item: item,
      TableName: this.tableName,
    });
  }

  // TODO: update

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
      params.ExpressionAttributeNames = QueryHelpers.getAttributeNamesFromFilters(
        options.filters
      );
      params.ExpressionAttributeValues = QueryHelpers.getAttributeValuesFromFilters(
        options.filters
      );
      params.FilterExpression = QueryHelpers.getFilterExpression(
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
      ExpressionAttributeNames: QueryHelpers.getAttributeNamesFromKey(key),
      ExpressionAttributeValues: QueryHelpers.getAttributeValuesFromKey(key),
      KeyConditionExpression: QueryHelpers.getKeyConditionExpression(key),
      TableName: this.tableName,
    };

    if (options.index) {
      params.IndexName = options.index;
    }

    if (options.filters) {
      Object.assign(
        params.ExpressionAttributeNames,
        QueryHelpers.getAttributeNamesFromFilters(options.filters)
      );
      Object.assign(
        params.ExpressionAttributeValues,
        QueryHelpers.getAttributeValuesFromFilters(options.filters)
      );
      params.FilterExpression = QueryHelpers.getFilterExpression(
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
