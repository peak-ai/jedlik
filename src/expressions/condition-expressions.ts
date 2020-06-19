import {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
} from '../document-client';
import { encode } from './encode';

// TODO: there are loads more operators
// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html
type Operator = '=' | '<>' | '<' | '<=' | '>' | '>=';

interface Condition<T> {
  key: Extract<keyof T, string>;
  operator: Operator;
  value: T[keyof T];
}

interface AndGroup<T> {
  $and: ConditionMap<T>[];
}

interface OrGroup<T> {
  $or: ConditionMap<T>[];
}

type ConditionGroup<T> = AndGroup<T> | OrGroup<T>;

export type ConditionMap<T> = Condition<T> | ConditionGroup<T>;

function getAttributeNames<T>({
  key,
}: Condition<T>): ExpressionAttributeNameMap {
  return {
    [`#${key}`]: key,
  };
}

function getAttributeNamesFromConditionMaps<T>(
  conditions: ConditionMap<T>[]
): ExpressionAttributeNameMap {
  return conditions.reduce(
    (names, condition) => ({
      ...names,
      ...getAttributeNamesFromConditions(condition),
    }),
    {}
  );
}

function getAttributeValues<T>({
  key,
  value,
}: Condition<T>): ExpressionAttributeValueMap {
  return {
    [`:${encode(`${key}${value}`)}`]: value,
  };
}

function getAttributeValuesFromConditionMaps<T>(
  conditions: ConditionMap<T>[]
): ExpressionAttributeValueMap {
  return conditions.reduce(
    (values, condition) => ({
      ...values,
      ...getAttributeValuesFromConditions(condition),
    }),
    {}
  );
}

function getSimpleExpression<T>(condition: Condition<T>): string {
  return `#${condition.key} ${condition.operator} :${encode(
    `${condition.key}${condition.value}`
  )}`;
}

function getAndExpression<T>(group: AndGroup<T>): string {
  return `(${group.$and.map(getConditionExpression).join(' AND ')})`;
}

function getOrExpression<T>(group: OrGroup<T>): string {
  return `(${group.$or.map(getConditionExpression).join(' OR ')})`;
}

export function getAttributeNamesFromConditions<T>(
  conditions: ConditionMap<T>
): ExpressionAttributeNameMap {
  if ((conditions as AndGroup<T>).$and) {
    return getAttributeNamesFromConditionMaps((conditions as AndGroup<T>).$and);
  }

  if ((conditions as OrGroup<T>).$or) {
    return getAttributeNamesFromConditionMaps((conditions as OrGroup<T>).$or);
  }

  return getAttributeNames(conditions as Condition<T>);
}

export function getAttributeValuesFromConditions<T>(
  conditions: ConditionMap<T>
): ExpressionAttributeValueMap {
  if ((conditions as AndGroup<T>).$and) {
    return getAttributeValuesFromConditionMaps(
      (conditions as AndGroup<T>).$and
    );
  }

  if ((conditions as OrGroup<T>).$or) {
    return getAttributeValuesFromConditionMaps((conditions as OrGroup<T>).$or);
  }

  return getAttributeValues(conditions as Condition<T>);
}

export function getConditionExpression<T>(conditions: ConditionMap<T>): string {
  if ((conditions as AndGroup<T>).$and) {
    return getAndExpression(conditions as AndGroup<T>);
  }

  if ((conditions as OrGroup<T>).$or) {
    return getOrExpression(conditions as OrGroup<T>);
  }

  return getSimpleExpression(conditions as Condition<T>);
}
