import { DynamoDB } from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';

export type DocumentClientOptions = (
  DynamoDB.DocumentClient.DocumentClientOptions
  & ServiceConfigurationOptions
  & DynamoDB.ClientApiVersions
);

export type Key = DynamoDB.DocumentClient.Key;
export type IndexName = DynamoDB.DocumentClient.IndexName;
export type QueryInput = DynamoDB.DocumentClient.QueryInput;
export type ScanInput = DynamoDB.DocumentClient.ScanInput;
export type UpdateItemInput = DynamoDB.DocumentClient.UpdateItemInput;
export type ExpressionAttributeNameMap = DynamoDB.DocumentClient.ExpressionAttributeNameMap;
export type ExpressionAttributeValueMap = DynamoDB.DocumentClient.ExpressionAttributeValueMap;
export type KeyConditions = DynamoDB.DocumentClient.KeyConditions;

export class DocumentClient {
  private documentClient: DynamoDB.DocumentClient;

  constructor(params?: DocumentClientOptions) {
    this.documentClient = new DynamoDB.DocumentClient(params);
  }

  public batchGet(params: DynamoDB.DocumentClient.BatchGetItemInput) {
    return this.documentClient.batchGet(params).promise();
  }

  public batchWrite(params: DynamoDB.DocumentClient.BatchWriteItemInput) {
    return this.documentClient.batchWrite(params).promise();
  }

  public createSet(list: number[] | string[] | DynamoDB.DocumentClient.binaryType[]) {
    return this.documentClient.createSet(list);
  }

  public delete(params: DynamoDB.DocumentClient.DeleteItemInput) {
    return this.documentClient.delete(params).promise();
  }

  public get(params: DynamoDB.DocumentClient.GetItemInput) {
    return this.documentClient.get(params).promise();
  }

  public put(params: DynamoDB.DocumentClient.PutItemInput) {
    return this.documentClient.put(params).promise();
  }

  public query(params: DynamoDB.DocumentClient.QueryInput) {
    return this.documentClient.query(params).promise();
  }

  public scan(params: DynamoDB.DocumentClient.ScanInput) {
    return this.documentClient.scan(params).promise();
  }

  public transactGet(params: DynamoDB.DocumentClient.TransactGetItemsInput) {
    return this.documentClient.transactGet(params).promise();
  }

  public transactWrite(params: DynamoDB.DocumentClient.TransactWriteItemsInput) {
    return this.documentClient.transactWrite(params).promise();
  }

  public update(params: DynamoDB.DocumentClient.UpdateItemInput) {
    return this.documentClient.update(params).promise();
  }
}
