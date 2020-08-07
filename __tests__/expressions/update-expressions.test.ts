import {
  UpdateExpressionParser,
  UpdateMap,
  Literal,
  Shape,
} from '../../src/expressions/update-expression-parser';
import { DynamoDBSet, createSet } from '../../src/document-client';

type TestType = {
  a: number;
  b: string;
  c: boolean;
  d: Shape<{
    e: string;
    f: number;
    g: {
      h: boolean;
    };
  }>;
  i: string[];
  j: DynamoDBSet;
};

const getValueName = (entries: [string, unknown][]) => (
  value: unknown
): string => (entries.find(([, v]) => v === value) as [string, unknown])[0];

const hexadecimalKey = /^:[\da-f]{40}$/i;

describe('SET expressions', () => {
  describe('plain expressions', () => {
    const i = ['hello'];
    const updates: UpdateMap<TestType> = {
      set: [{ a: 2, b: '3', i }],
    };

    const parser = new UpdateExpressionParser(updates);

    it('gets attribute names from set expressions', () => {
      expect(parser.expressionAttributeNames).toEqual({
        '#a': 'a',
        '#b': 'b',
        '#i': 'i',
      });
    });

    it('gets attribute values from set expressions', () => {
      const keys = Object.keys(parser.expressionAttributeValues);
      // all keys are random hexadecimal strings
      expect(keys.length).toBe(3);
      keys.forEach((key) => {
        expect(key).toMatch(hexadecimalKey);
      });

      // all values should be present
      const values = Object.values(parser.expressionAttributeValues);
      expect(values).toContain(2);
      expect(values).toContain('3');
      expect(values).toContain(i);
    });
    it('parses SET expressions', () => {
      const valueName = getValueName(
        Object.entries(parser.expressionAttributeValues)
      );

      expect(parser.expression).toEqual(
        `SET #a = ${valueName(2)}, #b = ${valueName('3')}, #i = ${valueName(i)}`
      );
    });
  });

  describe('with conditional updates', () => {
    const updates: UpdateMap<TestType> = {
      set: [
        { a: 2, b: '3' },
        { b: '4', c: true },
      ],
    };

    const parser = new UpdateExpressionParser(updates);

    it('gets attribute names from set expressions', () => {
      expect(parser.expressionAttributeNames).toEqual({
        '#a': 'a',
        '#b': 'b',
        '#c': 'c',
      });
    });

    it('gets attribute values from set expressions and prioritizes conditional values', () => {
      const keys = Object.keys(parser.expressionAttributeValues);
      // all keys are random hexadecimal strings
      expect(keys.length).toBe(3);
      keys.forEach((key) => {
        expect(key).toMatch(hexadecimalKey);
      });

      // all values should be present
      const values = Object.values(parser.expressionAttributeValues);
      expect(values).toContain(2);
      expect(values).toContain('4');
      expect(values).toContain(true);
    });

    it('parses SET expressions prioritizing conditional updates', () => {
      const valueName = getValueName(
        Object.entries(parser.expressionAttributeValues)
      );

      expect(parser.expression).toEqual(
        `SET #a = ${valueName(2)}, ` +
          `#b = if_not_exists(#b, ${valueName('4')}), ` +
          `#c = if_not_exists(#c, ${valueName(true)})`
      );
    });
  });

  describe('with nested updates', () => {
    const updates: UpdateMap<TestType> = {
      set: [{ a: 2, d: { e: 'hello', f: 8, g: { h: false } } }],
    };

    const parser = new UpdateExpressionParser(updates);

    it('gets nested attribute names from set expressions', () => {
      expect(parser.expressionAttributeNames).toEqual({
        '#a': 'a',
        '#d': 'd',
        '#e': 'e',
        '#f': 'f',
        '#g': 'g',
        '#h': 'h',
      });
    });

    it('gets nested attribute values from set expressions', () => {
      const keys = Object.keys(parser.expressionAttributeValues);
      // all keys are random hexadecimal strings
      expect(keys.length).toBe(4);

      keys.forEach((key) => {
        expect(key).toMatch(hexadecimalKey);
      });

      // all values should be present
      const values = Object.values(parser.expressionAttributeValues);
      expect(values).toContain(2);
      expect(values).toContain('hello');
      expect(values).toContain(8);
      expect(values).toContain(false);
    });

    it('parses nested SET expressions', () => {
      const valueName = getValueName(
        Object.entries(parser.expressionAttributeValues)
      );

      expect(parser.expression).toEqual(
        `SET #a = ${valueName(2)}, ` +
          `#d.#e = ${valueName('hello')}, ` +
          `#d.#f = ${valueName(8)}, ` +
          `#d.#g.#h = ${valueName(false)}`
      );
    });
  });

  describe('with conditional nested updates', () => {
    const updates: UpdateMap<TestType> = {
      set: [
        { a: 2, d: { e: 'hello' } },
        { b: 'new-value', d: { f: 8, g: { h: false } } },
      ],
    };

    const parser = new UpdateExpressionParser(updates);

    it('gets nested attribute names from set expressions', () => {
      expect(parser.expressionAttributeNames).toEqual({
        '#a': 'a',
        '#b': 'b',
        '#d': 'd',
        '#e': 'e',
        '#f': 'f',
        '#g': 'g',
        '#h': 'h',
      });
    });

    it('gets nested attribute values from set expressions', () => {
      const keys = Object.keys(parser.expressionAttributeValues);
      // all keys are random hexadecimal strings
      expect(keys.length).toBe(5);

      keys.forEach((key) => {
        expect(key).toMatch(hexadecimalKey);
      });

      // all values should be present
      const values = Object.values(parser.expressionAttributeValues);
      expect(values).toContain(2);
      expect(values).toContain('hello');
      expect(values).toContain('new-value');
      expect(values).toContain(8);
      expect(values).toContain(false);
    });

    it('parses nested SET expressions', () => {
      const valueName = getValueName(
        Object.entries(parser.expressionAttributeValues)
      );

      expect(parser.expression).toEqual(
        `SET #a = ${valueName(2)}, ` +
          `#d.#e = ${valueName('hello')}, ` +
          `#b = if_not_exists(#b, ${valueName('new-value')}), ` +
          `#d.#f = if_not_exists(#d.#f, ${valueName(8)}), ` +
          `#d.#g.#h = if_not_exists(#d.#g.#h, ${valueName(false)})`
      );
    });
  });

  describe('with literal object values', () => {
    const d = { e: 'hello', f: 8, g: { h: false } };
    const updates: UpdateMap<TestType> = {
      set: [{ d: Literal(d) }],
    };

    const parser = new UpdateExpressionParser(updates);

    it('gets nested attribute names from set expressions', () => {
      expect(parser.expressionAttributeNames).toEqual({
        '#d': 'd',
      });
    });

    it('gets nested attribute values from set expressions', () => {
      const keys = Object.keys(parser.expressionAttributeValues);
      // all keys are random hexadecimal strings
      expect(keys.length).toBe(1);

      keys.forEach((key) => {
        expect(key).toMatch(hexadecimalKey);
      });

      // all values should be present
      const values = Object.values(parser.expressionAttributeValues);
      expect(values).toContain(d);
    });

    it('parses nested SET expressions', () => {
      const valueName = getValueName(
        Object.entries(parser.expressionAttributeValues)
      );

      expect(parser.expression).toEqual(`SET #d = ${valueName(d)}`);
    });
  });
});

describe('REMOVE expressions', () => {
  describe('plain expressions', () => {
    const updates: UpdateMap<TestType> = {
      remove: { a: true, b: true },
    };

    const parser = new UpdateExpressionParser(updates);

    it('gets attribute names from REMOVE expressions', () => {
      expect(parser.expressionAttributeNames).toEqual({
        '#a': 'a',
        '#b': 'b',
      });
    });

    it('returns an empty object for attribute values', () => {
      expect(parser.expressionAttributeValues).toEqual({});
    });

    it('parses REMOVE expressions', () => {
      expect(parser.expression).toEqual('REMOVE #a, #b');
    });
  });

  describe('nested expressions', () => {
    const updates: UpdateMap<TestType> = {
      remove: { d: { e: true, g: { h: true } } },
    };

    const parser = new UpdateExpressionParser(updates);

    it('gets attribute names from REMOVE expressions', () => {
      expect(parser.expressionAttributeNames).toEqual({
        '#d': 'd',
        '#e': 'e',
        '#g': 'g',
        '#h': 'h',
      });
    });

    it('returns an empty object for attribute values', () => {
      expect(parser.expressionAttributeValues).toEqual({});
    });

    it('parses REMOVE expressions', () => {
      expect(parser.expression).toEqual('REMOVE #d.#e, #d.#g.#h');
    });
  });
});

describe('ADD expressions', () => {
  describe('plain expressions with numbers', () => {
    const updates: UpdateMap<TestType> = {
      add: { a: 9 },
    };

    const parser = new UpdateExpressionParser(updates);

    it('gets attribute names from ADD expressions', () => {
      expect(parser.expressionAttributeNames).toEqual({
        '#a': 'a',
      });
    });

    it('gets attribute values from ADD operations', () => {
      const keys = Object.keys(parser.expressionAttributeValues);
      // all keys are random hexadecimal strings
      expect(keys.length).toBe(1);

      keys.forEach((key) => {
        expect(key).toMatch(hexadecimalKey);
      });

      // all values should be present
      const values = Object.values(parser.expressionAttributeValues);
      expect(values).toContain(9);
    });

    it('parses ADD expressions', () => {
      const valueName = getValueName(
        Object.entries(parser.expressionAttributeValues)
      );

      expect(parser.expression).toEqual(`ADD #a ${valueName(9)}`);
    });
  });
});

describe('DELETE expressions', () => {
  describe('plain expressions with numbers', () => {
    const j = createSet(['hello']);
    const updates: UpdateMap<TestType> = {
      delete: { j },
    };

    const parser = new UpdateExpressionParser(updates);

    it('gets attribute names from DELETE expressions', () => {
      expect(parser.expressionAttributeNames).toEqual({
        '#j': 'j',
      });
    });

    it('gets attribute values from DELETE operations', () => {
      const keys = Object.keys(parser.expressionAttributeValues);
      // all keys are random hexadecimal strings
      expect(keys.length).toBe(1);

      keys.forEach((key) => {
        expect(key).toMatch(hexadecimalKey);
      });

      // all values should be present
      const values = Object.values(parser.expressionAttributeValues);
      expect(values).toContain(j);
    });

    it('parses DELETE expressions', () => {
      const valueName = getValueName(
        Object.entries(parser.expressionAttributeValues)
      );

      expect(parser.expression).toEqual(`DELETE #j ${valueName(j)}`);
    });
  });
});
