import { DynamoDB } from 'aws-sdk';

type Key = DynamoDB.DocumentClient.Key;
type ExpressionAttributeValueMap = DynamoDB.DocumentClient.ExpressionAttributeValueMap;

const getExpressionAttributeValues = (key: Key): ExpressionAttributeValueMap => (
  Object.entries(key).reduce((values, [k, v]) => ({
    ...values,
    [`:${k}`]: v,
  }), {})
);

export default getExpressionAttributeValues;
