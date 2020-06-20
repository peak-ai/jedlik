import {
  getAttributeNamesFromKey,
  getAttributeValuesFromKey,
  getKeyConditionExpression,
} from '../../src/expressions/key-expressions';
import { encode } from '../../src/expressions/encode';

describe('getAttributeNamesFromKey', () => {
  it('handles a single plain query object', () => {
    expect(getAttributeNamesFromKey({ id: 123 })).toEqual({ '#id': 'id' });
  });

  it('handles a plain query object with multiple keys', () => {
    expect(getAttributeNamesFromKey({ id: 123, date: 111 })).toEqual({
      '#id': 'id',
      '#date': 'date',
    });
  });
});

describe('getAttributeValuesFromKey', () => {
  it('handles a single plain query object', () => {
    const key = 'id';
    const value = 123;
    const encoded = encode(key + value);
    expect(getAttributeValuesFromKey({ [key]: value })).toEqual({
      [`:${encoded}`]: value,
    });
  });

  it('handles a plain query object with multiple keys', () => {
    const key1 = 'id';
    const key2 = 'date';
    const value1 = 123;
    const value2 = 111;
    const encoded1 = encode(key1 + value1);
    const encoded2 = encode(key2 + value2);
    expect(
      getAttributeValuesFromKey({ [key1]: value1, [key2]: value2 })
    ).toEqual({ [`:${encoded1}`]: value1, [`:${encoded2}`]: value2 });
  });
});

describe('getKeyConditionExpression', () => {
  it('handles a single plain query object', () => {
    const key = 'id';
    const value = 123;
    const encoded = encode(key + value);
    expect(getKeyConditionExpression({ [key]: value })).toEqual(
      `#${key} = :${encoded}`
    );
  });

  it('handles a plain query object with multiple keys', () => {
    const key1 = 'id';
    const key2 = 'date';
    const value1 = 123;
    const value2 = 111;
    const encoded1 = encode(key1 + value1);
    const encoded2 = encode(key2 + value2);
    expect(
      getKeyConditionExpression({ [key1]: value1, [key2]: value2 })
    ).toEqual(`#${key1} = :${encoded1} AND #${key2} = :${encoded2}`);
  });
});
