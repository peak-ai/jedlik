import {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
} from '../document-client';
import { encode } from './encode';

type SetUpdate<T> = Partial<T>;

type SetUpdates<T> = [SetUpdate<T>, SetUpdate<T>?];

export type UpdateMap<T> = {
  set?: SetUpdates<T>;
};

function getNameKey(key: string): string {
  return `#${key}`;
}

function getValueKey(key: string, value: unknown): string {
  return `:${encode(`${key}${value}`)}`;
}

export function getAttributeNamesFromUpdates<T>(
  updates: UpdateMap<T>
): ExpressionAttributeNameMap {
  let names = {};

  if (updates.set) {
    const [attributes, conditionals] = updates.set;

    names = Object.keys({ ...attributes, ...conditionals }).reduce(
      (acc, key) => ({
        ...acc,
        [getNameKey(key)]: key,
      }),
      names
    );
  }

  return names;
}

export function getAttributeValuesFromUpdates<T>(
  updates: UpdateMap<T>
): ExpressionAttributeValueMap {
  let values = {};

  if (updates.set) {
    const [attributes, conditionals] = updates.set;

    values = Object.entries({ ...attributes, ...conditionals }).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [getValueKey(key, value)]: value,
      }),
      values
    );
  }

  return values;
}

function getSetExpression<T>(updates: SetUpdates<T>): string {
  const [attributes, conditionals] = updates;
  const conditionalKeys = Object.keys(conditionals || {});

  const expressions = Object.entries({
    ...attributes,
    ...conditionals,
  }).map(
    ([key, value]) =>
      `#${key} = ${
        conditionalKeys.includes(key)
          ? `if_not_exists(${getNameKey(key)}, ${getValueKey(key, value)})`
          : `${getValueKey(key, value)}`
      }`
  );

  return `SET ${expressions.join(', ')}`;
}

export function getUpdateExpression<T>(updates: UpdateMap<T>): string {
  const expressions = [];

  if (updates.set) {
    const setExpression = getSetExpression(updates.set);

    expressions.push(setExpression);
  }

  return expressions.join(', ');
}
