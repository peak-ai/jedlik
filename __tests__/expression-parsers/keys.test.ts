import { Parser } from '../../src/expression-parsers/keys';

const hexadecimalKey = /^:[\da-f]{40}$/i;

const getValueName =
  (values: Record<string, unknown>) =>
  (value: unknown): string =>
    (
      Object.entries(values).find(([, v]) => v === value) as [string, unknown]
    )[0];

describe('expressionAttributeNames', () => {
  it('handles a single plain query object', () => {
    const parser = new Parser({ id: 123 });
    expect(parser.expressionAttributeNames).toEqual({ '#id': 'id' });
  });

  it('handles a plain query object with multiple keys', () => {
    const parser = new Parser({ id: 123, date: 111 });
    expect(parser.expressionAttributeNames).toEqual({
      '#id': 'id',
      '#date': 'date',
    });
  });
});

describe('expressionAttributeValues', () => {
  it('handles a single plain query object', () => {
    const parser = new Parser({ id: 123 });
    const keys = Object.keys(parser.expressionAttributeValues);
    // all keys are random hexadecimal strings
    expect(keys.length).toBe(1);

    keys.forEach((key) => {
      expect(key).toMatch(hexadecimalKey);
    });

    // all values should be present
    const values = Object.values(parser.expressionAttributeValues);
    expect(values).toContain(123);
  });

  it('handles a plain query object with multiple keys', () => {
    const parser = new Parser({ id: 123, date: 111 });
    const keys = Object.keys(parser.expressionAttributeValues);
    // all keys are random hexadecimal strings
    expect(keys.length).toBe(2);

    keys.forEach((key) => {
      expect(key).toMatch(hexadecimalKey);
    });

    // all values should be present
    const values = Object.values(parser.expressionAttributeValues);
    expect(values).toContain(123);
    expect(values).toContain(111);
  });
});

describe('expression', () => {
  it('handles a single plain query object', () => {
    const parser = new Parser({ id: 123 });
    const valueName = getValueName(parser.expressionAttributeValues);

    expect(parser.expression).toEqual(`#id = ${valueName(123)}`);
  });

  it('handles a plain query object with multiple keys', () => {
    const parser = new Parser({ id: 123, date: 111 });
    const valueName = getValueName(parser.expressionAttributeValues);

    expect(parser.expression).toEqual(
      `#id = ${valueName(123)} AND #date = ${valueName(111)}`
    );
  });
});
