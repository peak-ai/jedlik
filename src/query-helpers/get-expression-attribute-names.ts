import { DynamoDB } from 'aws-sdk';

type Key = DynamoDB.DocumentClient.Key;
type ExpressionAttributeNameMap = DynamoDB.DocumentClient.ExpressionAttributeNameMap;

const getExpressionAttributeNames = (key: Key): ExpressionAttributeNameMap => (
  Object.keys(key).reduce((names, k) => ({
    ...names,
    [`#${k}`]: k,
  }), {})
);

export default getExpressionAttributeNames;
