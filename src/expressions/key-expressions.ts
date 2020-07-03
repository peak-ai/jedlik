import {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
  Key,
} from '../document-client';
import { encode } from './encode';

export function getAttributeNamesFromKey(key: Key): ExpressionAttributeNameMap {
  return Object.keys(key).reduce(
    (names, k) => ({
      ...names,
      [`#${k}`]: k,
    }),
    {}
  );
}

export function getAttributeValuesFromKey(
  key: Key
): ExpressionAttributeValueMap {
  return Object.entries(key).reduce(
    (values, [k, v]) => ({
      ...values,
      [`:${encode(k + '=' + v)}`]: v,
    }),
    {}
  );
}

export function getKeyConditionExpression(key: Key): string {
  return Object.entries(key).reduce(
    (expression, [k, v], i) =>
      `${expression}${i === 0 ? '' : ' AND '}#${k} = :${encode(k + '=' + v)}`,
    ''
  );
}
