import {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
} from '../document-client';
import { encode } from './encode';

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

type SetUpdate<T> = DeepPartial<T>;

type SetUpdates<T> = [SetUpdate<T>, SetUpdate<T>?];

export type UpdateMap<T> = {
  set?: SetUpdates<T>;
};

function getNameKey(key: string): string {
  return `#${key}`;
}

function getNameKeys(key: string, value: unknown): ExpressionAttributeNameMap {
  const keys = { [getNameKey(key)]: key };

  if (Object.getPrototypeOf(value) === Object.prototype) {
    return Object.entries(value as Record<string, unknown>).reduce(
      (acc, [k, v]) => ({
        ...acc,
        ...getNameKeys(k, v),
      }),
      keys
    );
  }

  return keys;
}

function getUpdateMap(
  key: string,
  value: unknown
): ExpressionAttributeValueMap {
  if (Object.getPrototypeOf(value) === Object.prototype) {
    return Object.entries(value as Record<string, unknown>).reduce(
      (acc, [k, v]) => ({
        ...acc,
        ...getUpdateMap(`${key}.${k}`, v),
      }),
      {}
    );
  }
  return {
    [key.split('.').map(getNameKey).join('.')]: getValueKey(key, value),
  };
}

function getValueKey(key: string, value: unknown): string {
  return `:${encode(`${key}=${value}`)}`;
}

// function getValueKeys(
//   key: string,
//   value: unknown
// ): ExpressionAttributeValueMap {
//   if (Object.getPrototypeOf(value) === Object.prototype) {
//     return Object.entries(value as Record<string, unknown>).reduce(
//       (acc, [k, v]) => ({
//         ...acc,
//         ...getValueKeys(`${key}.${k}`, v),
//       }),
//       {}
//     );
//   }
//   return { [getValueKey(key, value)]: value };
// }

function getUnencryptedValueKeys(
  key: string,
  value: unknown
): ExpressionAttributeValueMap {
  if (Object.getPrototypeOf(value) === Object.prototype) {
    return Object.entries(value as Record<string, unknown>).reduce(
      (acc, [k, v]) => ({
        ...acc,
        ...getUnencryptedValueKeys(`${key}.${k}`, v),
      }),
      {}
    );
  }
  return { [key]: value };
}

const toAttributeNameMap = (
  acc: ExpressionAttributeNameMap,
  [key, value]: [string, unknown]
): ExpressionAttributeNameMap => ({
  ...acc,
  ...getNameKeys(key, value),
});

export function getAttributeNamesFromUpdates<T>(
  updates: UpdateMap<T>
): ExpressionAttributeNameMap {
  let names: ExpressionAttributeNameMap = {};

  if (updates.set) {
    const [attributes, conditionals] = updates.set;

    names = Object.entries(attributes).reduce(toAttributeNameMap, names);

    if (conditionals) {
      names = Object.entries(conditionals).reduce(toAttributeNameMap, names);
    }
  }

  return names;
}

const toAttributeValueMap = (
  acc: ExpressionAttributeNameMap,
  [key, value]: [string, unknown]
): ExpressionAttributeNameMap => ({
  ...acc,
  ...getUnencryptedValueKeys(key, value),
});

export function getAttributeValuesFromUpdates<T>(
  updates: UpdateMap<T>
): ExpressionAttributeValueMap {
  let values = {};

  if (updates.set) {
    const [attributes, conditionals] = updates.set;

    values = Object.entries(attributes).reduce(toAttributeValueMap, values);

    if (conditionals) {
      values = Object.entries(conditionals).reduce(toAttributeValueMap, values);
    }
  }

  values = Object.entries(values).reduce(
    (acc, [k, v]) => ({
      ...acc,
      [getValueKey(k, v)]: v,
    }),
    {}
  );

  return values;
}

function getSetExpression<T>(updates: SetUpdates<T>): string {
  const [attributes, conditionals] = updates;

  const attributeUpdates = Object.entries(attributes).reduce(
    (acc, [key, value]) => ({
      ...acc,
      ...getUpdateMap(key, value),
    }),
    {}
  );

  let conditionalUpdates = {};

  if (conditionals) {
    conditionalUpdates = Object.entries(conditionals).reduce(
      (acc, [key, value]) => ({
        ...acc,
        ...getUpdateMap(key, value),
      }),
      {}
    );
  }

  const expressions = Object.entries({
    ...attributeUpdates,
    ...conditionalUpdates,
  }).map(
    ([k, v]) =>
      `${k} = ${
        Object.keys(conditionalUpdates).includes(k)
          ? `if_not_exists(${k},${v})`
          : v
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
