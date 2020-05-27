import {
  getAttributeNamesFromKey,
  getAttributeValuesFromKey,
  getKeyConditionExpression,
  getAttributeNamesFromFilters,
  getAttributeValuesFromFilters,
  getFilterExpression,
  FilterMap,
} from '../src/query-helpers';

const encodeHex = (str: string) => Buffer.from(str).toString('hex');

describe('getAttributeNamesFromKey', () => {
  it('handles a single plain query object', () => {
    expect(getAttributeNamesFromKey({ id: 123 })).toEqual({ '#id': 'id' });
  });
});

it('handles a plain query object with multiple keys', () => {
  expect(getAttributeNamesFromKey({ id: 123, date: 111 })).toEqual({ '#id': 'id', '#date': 'date' });
});

describe('getAttributeValuesFromKey', () => {
  it('handles a single plain query object', () => {
    const key = 'id';
    const value = 123;
    const encoded = encodeHex(key + value);
    expect(getAttributeValuesFromKey({ [key]: value })).toEqual({ [`:${encoded}`]: value });
  });

  it('handles a plain query object with multiple keys', () => {
    const key1 = 'id';
    const key2 = 'date'
    const value1 = 123;
    const value2 = 111;
    const encoded1 = encodeHex(key1 + value1);
    const encoded2 = encodeHex(key2 + value2);
    expect(getAttributeValuesFromKey({ [key1]: value1, [key2]: value2 }))
      .toEqual({ [`:${encoded1}`]: value1, [`:${encoded2}`]: value2 });
  });
});

describe('getKeyConditionExpression', () => {
  it('handles a single plain query object', () => {
    const key = 'id';
    const value = 123;
    const encoded = encodeHex(key + value);
    expect(getKeyConditionExpression({ [key]: value })).toEqual(`#${key} = :${encoded}`);
  });

  it('handles a plain query object with multiple keys', () => {
    const key1 = 'id';
    const key2 = 'date'
    const value1 = 123;
    const value2 = 111;
    const encoded1 = encodeHex(key1 + value1);
    const encoded2 = encodeHex(key2 + value2);
    expect(getKeyConditionExpression({ [key1]: value1, [key2]: value2 }))
      .toEqual(`#${key1} = :${encoded1} AND #${key2} = :${encoded2}`);
  });
});

describe('getAttributeNamesFromFilters', () => {
  it('gets attribute names from simple filters', () => {
    const filter: FilterMap<any> = { key: 'key', operator: '=', value: 'value' };

    expect(getAttributeNamesFromFilters(filter)).toEqual({ '#key': 'key' });
  });

  it('gets attribute names from AND filter groups', () => {
    const filter: FilterMap<any> = {
      $and: [
        { key: 'key1', operator: '=', value: 'value1' },
        { key: 'key2', operator: '=', value: 'value2' },
      ],
    };

    expect(getAttributeNamesFromFilters(filter)).toEqual({ '#key1': 'key1', '#key2': 'key2' });
  });

  it('gets attribute names from OR filter groups', () => {
    const filter: FilterMap<any> = {
      $or: [
        { key: 'key1', operator: '=', value: 'value1' },
        { key: 'key2', operator: '=', value: 'value2' },
      ],
    };

    expect(getAttributeNamesFromFilters(filter)).toEqual({ '#key1': 'key1', '#key2': 'key2' });
  });

  it('gets attribute names from nested filter groups', () => {
    const filter: FilterMap<any> = {
      $or: [
        { key: 'key1', operator: '=', value: 'value1' },
        { $and: [
          { key: 'key2', operator: '=', value: 'value2' },
          { key: 'key3', operator: '=', value: 'value3' },
        ]},
      ],
    };

    expect(getAttributeNamesFromFilters(filter)).toEqual({ '#key1': 'key1', '#key2': 'key2', '#key3': 'key3' });
  });
});

describe('getAttributeValuesFromFilters', () => {
  it('gets encoded attribute values from simple filters', () => {
    const key = 'key';
    const value = 'value';
    const filter: FilterMap<any> = { key, operator: '=', value };

    const encoded = encodeHex(key + value);

    expect(getAttributeValuesFromFilters(filter)).toEqual({ [`:${encoded}`]: value });
  });

  it('gets encoded attribute values from AND filter groups', () => {
    const key1 = 'key1';
    const value1 = 'value1';
    const key2 = 'key2';
    const value2 = 'value2';

    const filter: FilterMap<any> = {
      $and: [
        { key: key1, operator: '=', value: value1 },
        { key: key2, operator: '=', value: value2 },
      ],
    };

    const encoded1 = encodeHex(key1 + value1);
    const encoded2 = encodeHex(key2 + value2);

    expect(getAttributeValuesFromFilters(filter)).toEqual({
      [`:${encoded1}`]: value1,
      [`:${encoded2}`]: value2,
    });
  });

  it('gets encoded attribute values from OR filter groups', () => {
    const key1 = 'key1';
    const value1 = 'value1';
    const key2 = 'key2';
    const value2 = 'value2';

    const filter: FilterMap<any> = {
      $or: [
        { key: key1, operator: '=', value: value1 },
        { key: key2, operator: '=', value: value2 },
      ],
    };

    const encoded1 = encodeHex(key1 + value1);
    const encoded2 = encodeHex(key2 + value2);

    expect(getAttributeValuesFromFilters(filter)).toEqual({
      [`:${encoded1}`]: value1,
      [`:${encoded2}`]: value2,
    });
  });

  it('handles multiple values for the same key in complex filter groups', () => {
    const key = 'key';
    const value1 = 'value1';
    const value2 = 'value2';

    const filter: FilterMap<any> = {
      $or: [
        { key, operator: '=', value: value1 },
        { key, operator: '=', value: value2 },
      ],
    };

    const encoded1 = encodeHex(key + value1);
    const encoded2 = encodeHex(key + value2);

    expect(getAttributeValuesFromFilters(filter)).toEqual({
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
    const filter: FilterMap<any> = {
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

    const encoded1 = encodeHex(key1 + value1);
    const encoded2 = encodeHex(key2 + value2);
    const encoded3 = encodeHex(key3 + value3);

    expect(getAttributeValuesFromFilters(filter)).toEqual({
      [`:${encoded1}`]: value1,
      [`:${encoded2}`]: value2,
      [`:${encoded3}`]: value3,
    });
  });
});

describe('getFilterExpression', () => {
  it('returns a filter expression from a simple = filter', () => {
    const filter: FilterMap<any> = { key: 'key', operator: '=', value: 'value' };

    const encoded = encodeHex(filter.key + filter.value);

    expect(getFilterExpression(filter)).toEqual(`#${filter.key} = :${encoded}`);
  });

  it('returns a filter expression from a simple > filter', () => {
    const filter: FilterMap<any> = { key: 'key', operator: '>', value: 'value' };

    const encoded = encodeHex(filter.key + filter.value);

    expect(getFilterExpression(filter)).toEqual(`#${filter.key} > :${encoded}`);
  });

  it('returns a filter expression from a simple < filter', () => {
    const filter: FilterMap<any> = { key: 'key', operator: '<', value: 'value' };

    const encoded = encodeHex(filter.key + filter.value);

    expect(getFilterExpression(filter)).toEqual(`#${filter.key} < :${encoded}`);
  });

  it('returns a filter expression from a simple >= filter', () => {
    const filter: FilterMap<any> = { key: 'key', operator: '>=', value: 'value' };

    const encoded = encodeHex(filter.key + filter.value);

    expect(getFilterExpression(filter)).toEqual(`#${filter.key} >= :${encoded}`);
  });

  it('returns a filter expression from a simple <= filter', () => {
    const filter: FilterMap<any> = { key: 'key', operator: '<=', value: 'value' };

    const encoded = encodeHex(filter.key + filter.value);

    expect(getFilterExpression(filter)).toEqual(`#${filter.key} <= :${encoded}`);
  });

  it('returns a filter expression from a simple <> filter', () => {
    const filter: FilterMap<any> = { key: 'key', operator: '<>', value: 'value' };

    const encoded = encodeHex(filter.key + filter.value);

    expect(getFilterExpression(filter)).toEqual(`#${filter.key} <> :${encoded}`);
  });

  it('handles AND expressions', () => {
    const key1 = 'key1';
    const value1 = 'value1';
    const key2 = 'key2';
    const value2 = 'value2';

    const filter: FilterMap<any> = {
      $and: [
        { key: key1, operator: '=', value: value1 },
        { key: key2, operator: '=', value: value2 },
      ],
    };

    const encoded1 = encodeHex(key1 + value1);
    const encoded2 = encodeHex(key2 + value2);

    expect(getFilterExpression(filter))
      .toEqual(`(#${key1} = :${encoded1} AND #${key2} = :${encoded2})`);
  });

  it('handles OR expressions', () => {
    const key1 = 'key1';
    const value1 = 'value1';
    const key2 = 'key2';
    const value2 = 'value2';

    const filter: FilterMap<any> = {
      $or: [
        { key: key1, operator: '=', value: value1 },
        { key: key2, operator: '=', value: value2 },
      ],
    };

    const encoded1 = encodeHex(key1 + value1);
    const encoded2 = encodeHex(key2 + value2);

    expect(getFilterExpression(filter))
      .toEqual(`(#${key1} = :${encoded1} OR #${key2} = :${encoded2})`);
  });

  it('handles nested filter groups', () => {
    const key1 = 'key1';
    const value1 = 'value1';
    const key2 = 'key2';
    const value2 = 'value2';
    const key3 = 'key3';
    const value3 = 'value3';
    const filter: FilterMap<any> = {
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

    const encoded1 = encodeHex(key1 + value1);
    const encoded2 = encodeHex(key2 + value2);
    const encoded3 = encodeHex(key3 + value3);

    expect(getFilterExpression(filter)).toEqual(
      `(#${key1} = :${encoded1} OR (#${key2} = :${encoded2} AND #${key3} = :${encoded3}))`,
    );
  });
});
