import {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
  Key,
} from './document-client';

// TODO: there are loads more operators
// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html
type FilterOperator = '=' | '<>' | '<' | '<=' | '>' | '>=';

interface Filter<T> {
  key: Extract<keyof T, string>;
  operator: FilterOperator;
  value: T[keyof T];
}

interface FilterAndGroup<T> {
  $and: FilterMap<T>[];
}

interface FilterOrGroup<T> {
  $or: FilterMap<T>[];
}

type FilterGroup<T> = FilterAndGroup<T> | FilterOrGroup<T>;

export type FilterMap<T> = Filter<T> | FilterGroup<T>;

function encode(str: string) : string {
  return Buffer.from(str).toString('hex');
}

function getAttributeNamesFromFilter<T>({ key }: Filter<T>): ExpressionAttributeNameMap {
  return {
    [`#${key}`]: key,
  };
}

function getAttributeNamesFromFilterMaps<T>(filters: FilterMap<T>[]): ExpressionAttributeNameMap {
  return filters.reduce((names, filter) => ({
    ...names,
    ...getAttributeNamesFromFilters(filter),
  }), {});
}

function getAttributeValuesFromFilter<T>({ key, value }: Filter<T>): ExpressionAttributeValueMap {
  return {
    [`:${encode(`${key}${value}`)}`]: value,
  };
}

function getAttributeValuesFromFilterMaps<T>(filters: FilterMap<T>[]): ExpressionAttributeValueMap {
  return filters.reduce((names, filter) => ({
    ...names,
    ...getAttributeValuesFromFilters(filter),
  }), {});
}

function getSimpleFilterExpression<T>(filter: Filter<T>): string {
  return `#${filter.key} ${filter.operator} :${encode(`${filter.key}${filter.value}`)}`;
}

function getAndFilterExpression<T>(filterGroup: FilterAndGroup<T>): string {
  return `(${filterGroup.$and.map(getFilterExpression).join(' AND ')})`;
}

function getOrFilterExpression<T>(filterGroup: FilterOrGroup<T>): string {
  return `(${filterGroup.$or.map(getFilterExpression).join(' OR ')})`;
}

export function getAttributeNamesFromKey(key: Key): ExpressionAttributeNameMap {
  return Object.keys(key).reduce((names, k) => ({
    ...names,
    [`#${k}`]: k,
  }), {});
}

export function getAttributeValuesFromKey(key: Key): ExpressionAttributeValueMap {
  return Object.entries(key).reduce((values, [k, v]) => ({
    ...values,
    [`:${encode(k + v)}`]: v,
  }), {});
}

export function getKeyConditionExpression(key: Key): string {
  return Object.entries(key).reduce((expression, [k, v], i) => (
    `${expression}${i === 0 ? '' : ' AND '}#${k} = :${encode(k + v)}`
  ), '');
}

export function getAttributeNamesFromFilters<T>(filters: FilterMap<T>): ExpressionAttributeNameMap {
  if ((filters as FilterAndGroup<T>).$and) {
    return getAttributeNamesFromFilterMaps((filters as FilterAndGroup<T>).$and);
  }

  if ((filters as FilterOrGroup<T>).$or) {
    return getAttributeNamesFromFilterMaps((filters as FilterOrGroup<T>).$or);
  }

  return getAttributeNamesFromFilter((filters as Filter<T>));
}

export function getAttributeValuesFromFilters<T>(
  filters: FilterMap<T>,
): ExpressionAttributeValueMap {
  if ((filters as FilterAndGroup<T>).$and) {
    return getAttributeValuesFromFilterMaps((filters as FilterAndGroup<T>).$and);
  }

  if ((filters as FilterOrGroup<T>).$or) {
    return getAttributeValuesFromFilterMaps((filters as FilterOrGroup<T>).$or);
  }

  return getAttributeValuesFromFilter((filters as Filter<T>));
}

export function getFilterExpression<T>(filters: FilterMap<T>): string {
  if ((filters as FilterAndGroup<T>).$and) {
    return getAndFilterExpression((filters as FilterAndGroup<T>));
  }

  if ((filters as FilterOrGroup<T>).$or) {
    return getOrFilterExpression((filters as FilterOrGroup<T>));
  }

  return getSimpleFilterExpression((filters as Filter<T>));
}
