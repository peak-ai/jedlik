import { DynamoDB } from 'aws-sdk';

const getKeyConditionExpression = (key: DynamoDB.DocumentClient.Key): string => (
  Object.keys(key).reduce((expression, k, i) => (
    `${expression}${i === 0 ? '' : ' AND '}#${k} = :${k}`
  ), '')
);

export default getKeyConditionExpression;
