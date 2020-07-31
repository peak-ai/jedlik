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

type RemoveUpdates<T> = {
  [P in keyof T]?: RemoveUpdates<T[P]> | true;
};

type AddUpdates<T> = {
  [P in keyof T]?: number;
};

export type UpdateMap<T> = {
  set?: SetUpdates<T>;
  remove?: RemoveUpdates<T>;
  add?: AddUpdates<T>;
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
  let v = value;

  if (Array.isArray(value)) {
    v = JSON.stringify(value);
  }

  return `:${encode(`${key}=${v}`)}`;
}

function getValueMap(key: string, value: unknown): ExpressionAttributeValueMap {
  if (Object.getPrototypeOf(value) === Object.prototype) {
    return Object.entries(value as Record<string, unknown>).reduce(
      (acc, [k, v]) => ({
        ...acc,
        ...getValueMap(`${key}.${k}`, v),
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

  if (updates.remove) {
    names = Object.entries(updates.remove).reduce(toAttributeNameMap, names);
  }

  if (updates.add) {
    names = Object.entries(updates.add).reduce(toAttributeNameMap, names);
  }

  return names;
}

const toAttributeValueMap = (
  acc: ExpressionAttributeNameMap,
  [key, value]: [string, unknown]
): ExpressionAttributeNameMap => ({
  ...acc,
  ...getValueMap(key, value),
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

  if (updates.add) {
    values = Object.entries(updates.add).reduce(toAttributeValueMap, values);
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
    ([key, value]) =>
      `${key} = ${
        Object.keys(conditionalUpdates).includes(key)
          ? `if_not_exists(${key},${value})`
          : value
      }`
  );

  return `SET ${expressions.join(', ')}`;
}

function getRemoveExpression<T>(updates: RemoveUpdates<T>): string {
  const updateMap = Object.entries(updates).reduce(
    (acc, [key, value]) => ({
      ...acc,
      ...getUpdateMap(key, value),
    }),
    {}
  );

  return `REMOVE ${Object.keys(updateMap).join(', ')}`;
}

function getAddExpression<T>(updates: AddUpdates<T>): string {
  const updateMap = Object.entries(updates).reduce(
    (acc, [key, value]) => ({
      ...acc,
      ...getUpdateMap(key, value),
    }),
    {}
  );

  const expressions = Object.entries(updateMap).map(
    ([key, value]) => `${key} ${value}`
  );

  return `ADD ${expressions.join(', ')}`;
}

export function getUpdateExpression<T>(updates: UpdateMap<T>): string {
  const expressions = [];

  if (updates.set) {
    const expression = getSetExpression(updates.set);
    expressions.push(expression);
  }

  if (updates.remove) {
    const expression = getRemoveExpression(updates.remove);
    expressions.push(expression);
  }

  if (updates.add) {
    const expression = getAddExpression(updates.add);
    expressions.push(expression);
  }

  return expressions.join(', ');
}
