import { DynamoDB } from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';

export type DocumentClientOptions = DynamoDB.DocumentClient.DocumentClientOptions &
  ServiceConfigurationOptions &
  DynamoDB.ClientApiVersions;

export type Key = DynamoDB.DocumentClient.Key;
export type IndexName = DynamoDB.DocumentClient.IndexName;
export type DeleteInput = DynamoDB.DocumentClient.DeleteItemInput;
export type PutInput = DynamoDB.DocumentClient.PutItemInput;
export type QueryInput = DynamoDB.DocumentClient.QueryInput;
export type ScanInput = DynamoDB.DocumentClient.ScanInput;
export type UpdateInput = DynamoDB.DocumentClient.UpdateItemInput;
export type ExpressionAttributeNameMap = DynamoDB.DocumentClient.ExpressionAttributeNameMap;
export type ExpressionAttributeValueMap = DynamoDB.DocumentClient.ExpressionAttributeValueMap;
export type KeyConditions = DynamoDB.DocumentClient.KeyConditions;
export type DynamoDBSet = DynamoDB.DocumentClient.DynamoDbSet;
export type DynamoDBList =
  | number[]
  | string[]
  | DynamoDB.DocumentClient.binaryType[];

export class DocumentClient {
  private documentClient: DynamoDB.DocumentClient;

  constructor(params?: DocumentClientOptions) {
    this.documentClient = new DynamoDB.DocumentClient(params);
  }

  public batchGet(
    params: DynamoDB.DocumentClient.BatchGetItemInput
  ): Promise<DynamoDB.DocumentClient.BatchGetItemOutput> {
    return this.documentClient.batchGet(params).promise();
  }

  public batchWrite(
    params: DynamoDB.DocumentClient.BatchWriteItemInput
  ): Promise<DynamoDB.DocumentClient.BatchWriteItemOutput> {
    return this.documentClient.batchWrite(params).promise();
  }

  public createSet(list: DynamoDBList): DynamoDBSet {
    return this.documentClient.createSet(list);
  }

  public delete(
    params: DynamoDB.DocumentClient.DeleteItemInput
  ): Promise<DynamoDB.DocumentClient.DeleteItemOutput> {
    return this.documentClient.delete(params).promise();
  }

  public get(
    params: DynamoDB.DocumentClient.GetItemInput
  ): Promise<DynamoDB.DocumentClient.GetItemOutput> {
    return this.documentClient.get(params).promise();
  }

  public put(
    params: DynamoDB.DocumentClient.PutItemInput
  ): Promise<DynamoDB.DocumentClient.PutItemOutput> {
    return this.documentClient.put(params).promise();
  }

  public query(
    params: DynamoDB.DocumentClient.QueryInput
  ): Promise<DynamoDB.DocumentClient.QueryOutput> {
    return this.documentClient.query(params).promise();
  }

  public scan(
    params: DynamoDB.DocumentClient.ScanInput
  ): Promise<DynamoDB.DocumentClient.ScanOutput> {
    return this.documentClient.scan(params).promise();
  }

  public transactGet(
    params: DynamoDB.DocumentClient.TransactGetItemsInput
  ): Promise<DynamoDB.DocumentClient.TransactGetItemsOutput> {
    return this.documentClient.transactGet(params).promise();
  }

  public transactWrite(
    params: DynamoDB.DocumentClient.TransactWriteItemsInput
  ): Promise<DynamoDB.DocumentClient.TransactWriteItemsOutput> {
    return this.documentClient.transactWrite(params).promise();
  }

  public update(
    params: DynamoDB.DocumentClient.UpdateItemInput
  ): Promise<DynamoDB.DocumentClient.UpdateItemOutput> {
    return this.documentClient.update(params).promise();
  }
}

export function createSet(list: DynamoDBList): DynamoDBSet {
  return new DocumentClient().createSet(list);
}
