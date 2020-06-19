import {
  getAttributeNamesFromConditions,
  getAttributeValuesFromConditions,
  getConditionExpression,
  ConditionMap,
} from '../../src/expressions/condition-expressions';

import { encode } from '../../src/expressions/encode';

describe('getAttributeNamesFromConditions', () => {
  it('gets attribute names from simple filters', () => {
    const filter: ConditionMap<any> = {
      key: 'key',
      operator: '=',
      value: 'value',
    };

    expect(getAttributeNamesFromConditions(filter)).toEqual({ '#key': 'key' });
  });

  it('gets attribute names from AND filter groups', () => {
    const filter: ConditionMap<any> = {
      $and: [
        { key: 'key1', operator: '=', value: 'value1' },
        { key: 'key2', operator: '=', value: 'value2' },
      ],
    };

    expect(getAttributeNamesFromConditions(filter)).toEqual({
      '#key1': 'key1',
      '#key2': 'key2',
    });
  });

  it('gets attribute names from OR filter groups', () => {
    const filter: ConditionMap<any> = {
      $or: [
        { key: 'key1', operator: '=', value: 'value1' },
        { key: 'key2', operator: '=', value: 'value2' },
      ],
    };

    expect(getAttributeNamesFromConditions(filter)).toEqual({
      '#key1': 'key1',
      '#key2': 'key2',
    });
  });

  it('gets attribute names from nested filter groups', () => {
    const filter: ConditionMap<any> = {
      $or: [
        { key: 'key1', operator: '=', value: 'value1' },
        {
          $and: [
            { key: 'key2', operator: '=', value: 'value2' },
            { key: 'key3', operator: '=', value: 'value3' },
          ],
        },
      ],
    };

    expect(getAttributeNamesFromConditions(filter)).toEqual({
      '#key1': 'key1',
      '#key2': 'key2',
      '#key3': 'key3',
    });
  });
});

describe('getAttributeValuesFromConditions', () => {
  it('gets encoded attribute values from simple filters', () => {
    const key = 'key';
    const value = 'value';
    const filter: ConditionMap<any> = { key, operator: '=', value };

    const encoded = encode(key + value);

    expect(getAttributeValuesFromConditions(filter)).toEqual({
      [`:${encoded}`]: value,
    });
  });

  it('gets encoded attribute values from AND filter groups', () => {
    const key1 = 'key1';
    const value1 = 'value1';
    const key2 = 'key2';
    const value2 = 'value2';

    const filter: ConditionMap<any> = {
      $and: [
        { key: key1, operator: '=', value: value1 },
        { key: key2, operator: '=', value: value2 },
      ],
    };

    const encoded1 = encode(key1 + value1);
    const encoded2 = encode(key2 + value2);

    expect(getAttributeValuesFromConditions(filter)).toEqual({
      [`:${encoded1}`]: value1,
      [`:${encoded2}`]: value2,
    });
  });

  it('gets encoded attribute values from OR filter groups', () => {
    const key1 = 'key1';
    const value1 = 'value1';
    const key2 = 'key2';
    const value2 = 'value2';

    const filter: ConditionMap<any> = {
      $or: [
        { key: key1, operator: '=', value: value1 },
        { key: key2, operator: '=', value: value2 },
      ],
    };

    const encoded1 = encode(key1 + value1);
    const encoded2 = encode(key2 + value2);

    expect(getAttributeValuesFromConditions(filter)).toEqual({
      [`:${encoded1}`]: value1,
      [`:${encoded2}`]: value2,
    });
  });

  it('handles multiple values for the same key in complex filter groups', () => {
    const key = 'key';
    const value1 = 'value1';
    const value2 = 'value2';

    const filter: ConditionMap<any> = {
      $or: [
        { key, operator: '=', value: value1 },
        { key, operator: '=', value: value2 },
      ],
    };

    const encoded1 = encode(key + value1);
    const encoded2 = encode(key + value2);

    expect(getAttributeValuesFromConditions(filter)).toEqual({
      [`:${encoded1}`]: value1,
      [`:${encoded2}`]: value2,
    });
  });

  it('gets encoded attribute values from nested filter groups', () => {
    const key1 = 'key1';
    const value1 = 'value1';
    const key2 = 'key2';
    const value2 = 'value2';
    const key3 = 'key3';
    const value3 = 'value3';
    const filter: ConditionMap<any> = {
      $or: [
        { key: key1, operator: '=', value: value1 },
        {
          $and: [
            { key: key2, operator: '=', value: value2 },
            { key: key3, operator: '=', value: value3 },
          ],
        },
      ],
    };

    const encoded1 = encode(key1 + value1);
    const encoded2 = encode(key2 + value2);
    const encoded3 = encode(key3 + value3);

    expect(getAttributeValuesFromConditions(filter)).toEqual({
      [`:${encoded1}`]: value1,
      [`:${encoded2}`]: value2,
      [`:${encoded3}`]: value3,
    });
  });
});

describe('getConditionExpression', () => {
  it('returns a filter expression from a simple = filter', () => {
    const filter: ConditionMap<any> = {
      key: 'key',
      operator: '=',
      value: 'value',
    };

    const encoded = encode(filter.key + filter.value);

    expect(getConditionExpression(filter)).toEqual(
      `#${filter.key} = :${encoded}`
    );
  });

  it('returns a filter expression from a simple > filter', () => {
    const filter: ConditionMap<any> = {
      key: 'key',
      operator: '>',
      value: 'value',
    };

    const encoded = encode(filter.key + filter.value);

    expect(getConditionExpression(filter)).toEqual(
      `#${filter.key} > :${encoded}`
    );
  });

  it('returns a filter expression from a simple < filter', () => {
    const filter: ConditionMap<any> = {
      key: 'key',
      operator: '<',
      value: 'value',
    };

    const encoded = encode(filter.key + filter.value);

    expect(getConditionExpression(filter)).toEqual(
      `#${filter.key} < :${encoded}`
    );
  });

  it('returns a filter expression from a simple >= filter', () => {
    const filter: ConditionMap<any> = {
      key: 'key',
      operator: '>=',
      value: 'value',
    };

    const encoded = encode(filter.key + filter.value);

    expect(getConditionExpression(filter)).toEqual(
      `#${filter.key} >= :${encoded}`
    );
  });

  it('returns a filter expression from a simple <= filter', () => {
    const filter: ConditionMap<any> = {
      key: 'key',
      operator: '<=',
      value: 'value',
    };

    const encoded = encode(filter.key + filter.value);

    expect(getConditionExpression(filter)).toEqual(
      `#${filter.key} <= :${encoded}`
    );
  });

  it('returns a filter expression from a simple <> filter', () => {
    const filter: ConditionMap<any> = {
      key: 'key',
      operator: '<>',
      value: 'value',
    };

    const encoded = encode(filter.key + filter.value);

    expect(getConditionExpression(filter)).toEqual(
      `#${filter.key} <> :${encoded}`
    );
  });

  it('handles AND expressions', () => {
    const key1 = 'key1';
    const value1 = 'value1';
    const key2 = 'key2';
    const value2 = 'value2';

    const filter: ConditionMap<any> = {
      $and: [
        { key: key1, operator: '=', value: value1 },
        { key: key2, operator: '=', value: value2 },
      ],
    };

    const encoded1 = encode(key1 + value1);
    const encoded2 = encode(key2 + value2);

    expect(getConditionExpression(filter)).toEqual(
      `(#${key1} = :${encoded1} AND #${key2} = :${encoded2})`
    );
  });

  it('handles OR expressions', () => {
    const key1 = 'key1';
    const value1 = 'value1';
    const key2 = 'key2';
    const value2 = 'value2';

    const filter: ConditionMap<any> = {
      $or: [
        { key: key1, operator: '=', value: value1 },
        { key: key2, operator: '=', value: value2 },
      ],
    };

    const encoded1 = encode(key1 + value1);
    const encoded2 = encode(key2 + value2);

    expect(getConditionExpression(filter)).toEqual(
      `(#${key1} = :${encoded1} OR #${key2} = :${encoded2})`
    );
  });

  it('handles nested filter groups', () => {
    const key1 = 'key1';
    const value1 = 'value1';
    const key2 = 'key2';
    const value2 = 'value2';
    const key3 = 'key3';
    const value3 = 'value3';
    const filter: ConditionMap<any> = {
      $or: [
        { key: key1, operator: '=', value: value1 },
        {
          $and: [
            { key: key2, operator: '=', value: value2 },
            { key: key3, operator: '=', value: value3 },
          ],
        },
      ],
    };

    const encoded1 = encode(key1 + value1);
    const encoded2 = encode(key2 + value2);
    const encoded3 = encode(key3 + value3);

    expect(getConditionExpression(filter)).toEqual(
      `(#${key1} = :${encoded1} OR (#${key2} = :${encoded2} AND #${key3} = :${encoded3}))`
    );
  });
});
