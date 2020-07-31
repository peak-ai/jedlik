import {
  getAttributeNamesFromUpdates,
  getAttributeValuesFromUpdates,
  getUpdateExpression,
  UpdateMap,
} from '../../src/expressions/update-expressions';

import { encode } from '../../src/expressions/encode';

type TestType = {
  a: number;
  b: string;
  c: boolean;
  d: {
    e: string;
    f: number;
    g: {
      h: boolean;
    };
  };
};

describe('SET expressions', () => {
  describe('plain expressions', () => {
    const updates: UpdateMap<TestType> = {
      set: [{ a: 2, b: '3' }],
    };

    describe('getAttributeNamesFromUpdates', () => {
      it('gets attribute names from set expressions', () => {
        expect(getAttributeNamesFromUpdates(updates)).toEqual({
          '#a': 'a',
          '#b': 'b',
        });
      });
    });

    describe('getAttributeValuesFromUpdates', () => {
      it('gets attribute values from set expressions', () => {
        expect(getAttributeValuesFromUpdates(updates)).toEqual({
          [`:${encode('a=2')}`]: 2,
          [`:${encode('b=3')}`]: '3',
        });
      });
    });

    describe('getUpdateExpression', () => {
      it('parses SET expressions', () => {
        expect(getUpdateExpression(updates)).toEqual(
          `SET #a = :${encode('a=2')}, #b = :${encode('b=3')}`
        );
      });
    });
  });

  describe('with conditional updates', () => {
    const updates: UpdateMap<TestType> = {
      set: [
        { a: 2, b: '3' },
        { b: '4', c: true },
      ],
    };

    describe('getAttributeNamesFromUpdates', () => {
      it('gets attribute names from set expressions', () => {
        expect(getAttributeNamesFromUpdates(updates)).toEqual({
          '#a': 'a',
          '#b': 'b',
          '#c': 'c',
        });
      });
    });

    describe('getAttributeValuesFromUpdates', () => {
      it('gets attribute values from set expressions', () => {
        expect(getAttributeValuesFromUpdates(updates)).toEqual({
          [`:${encode('a=2')}`]: 2,
          [`:${encode('b=4')}`]: '4',
          [`:${encode('c=true')}`]: true,
        });
      });
    });

    describe('getUpdateExpression', () => {
      it('parses SET expressions', () => {
        expect(getUpdateExpression(updates)).toEqual(
          `SET #a = :${encode('a=2')}, ` +
            `#b = if_not_exists(#b,:${encode('b=4')}), ` +
            `#c = if_not_exists(#c,:${encode('c=true')})`
        );
      });
    });
  });

  describe('with nested updates', () => {
    const updates: UpdateMap<TestType> = {
      set: [{ a: 2, d: { e: 'hello', f: 8, g: { h: false } } }],
    };

    describe('getAttributeNamesFromUpdates', () => {
      it('gets nested attribute names from set expressions', () => {
        expect(getAttributeNamesFromUpdates(updates)).toEqual({
          '#a': 'a',
          '#d': 'd',
          '#e': 'e',
          '#f': 'f',
          '#g': 'g',
          '#h': 'h',
        });
      });
    });

    describe('getAttributeValuesFromUpdates', () => {
      it('gets nested attribute values from set expressions', () => {
        expect(getAttributeValuesFromUpdates(updates)).toEqual({
          [`:${encode('a=2')}`]: 2,
          [`:${encode('d.e=hello')}`]: 'hello',
          [`:${encode('d.f=8')}`]: 8,
          [`:${encode('d.g.h=false')}`]: false,
        });
      });
    });

    describe('getUpdateExpression', () => {
      it('parses nested SET expressions', () => {
        expect(getUpdateExpression(updates)).toEqual(
          `SET #a = :${encode('a=2')}, ` +
            `#d.#e = :${encode('d.e=hello')}, ` +
            `#d.#f = :${encode('d.f=8')}, ` +
            `#d.#g.#h = :${encode('d.g.h=false')}`
        );
      });
    });
  });

  describe('with conditional nested updates', () => {
    const updates: UpdateMap<TestType> = {
      set: [
        { a: 2, d: { e: 'hello' } },
        { b: 'new-value', d: { f: 8, g: { h: false } } },
      ],
    };

    describe('getAttributeNamesFromUpdates', () => {
      it('gets nested attribute names from set expressions', () => {
        expect(getAttributeNamesFromUpdates(updates)).toEqual({
          '#a': 'a',
          '#b': 'b',
          '#d': 'd',
          '#e': 'e',
          '#f': 'f',
          '#g': 'g',
          '#h': 'h',
        });
      });
    });

    describe('getAttributeValuesFromUpdates', () => {
      it('gets nested attribute values from set expressions', () => {
        expect(getAttributeValuesFromUpdates(updates)).toEqual({
          [`:${encode('a=2')}`]: 2,
          [`:${encode('b=new-value')}`]: 'new-value',
          [`:${encode('d.e=hello')}`]: 'hello',
          [`:${encode('d.f=8')}`]: 8,
          [`:${encode('d.g.h=false')}`]: false,
        });
      });
    });

    describe('getUpdateExpression', () => {
      it('parses nested SET expressions', () => {
        const result = getUpdateExpression(updates);

        const action = result.substring(0, 4);
        const statements = result.substring(4).split(', ');

        const expected = [
          `#a = :${encode('a=2')}`,
          `#d.#e = :${encode('d.e=hello')}`,
          `#b = if_not_exists(#b,:${encode('b=new-value')})`,
          `#d.#f = if_not_exists(#d.#f,:${encode('d.f=8')})`,
          `#d.#g.#h = if_not_exists(#d.#g.#h,:${encode('d.g.h=false')})`,
        ];

        expect(action).toBe('SET ');
        expect(statements.length).toEqual(expected.length);
        expected.forEach((statement) => {
          expect(statements).toContain(statement);
        });
      });
    });
  });
});

describe('REMOVE expressions', () => {
  describe('plain expressions', () => {
    const updates: UpdateMap<TestType> = {
      remove: { a: true, b: true },
    };

    describe('getAttributeNamesFromUpdates', () => {
      it('gets attribute names from REMOVE expressions', () => {
        expect(getAttributeNamesFromUpdates(updates)).toEqual({
          '#a': 'a',
          '#b': 'b',
        });
      });
    });

    describe('getAttributeValuesFromUpdates', () => {
      it('returns an empty object', () => {
        expect(getAttributeValuesFromUpdates(updates)).toEqual({});
      });
    });

    describe('getUpdateExpression', () => {
      it('parses REMOVE expressions', () => {
        expect(getUpdateExpression(updates)).toEqual('REMOVE #a, #b');
      });
    });
  });

  describe('nested expressions', () => {
    const updates: UpdateMap<TestType> = {
      remove: { d: { e: true, g: { h: true } } },
    };

    describe('getAttributeNamesFromUpdates', () => {
      it('gets attribute names from REMOVE expressions', () => {
        expect(getAttributeNamesFromUpdates(updates)).toEqual({
          '#d': 'd',
          '#e': 'e',
          '#g': 'g',
          '#h': 'h',
        });
      });
    });

    describe('getAttributeValuesFromUpdates', () => {
      it('returns an empty object', () => {
        expect(getAttributeValuesFromUpdates(updates)).toEqual({});
      });
    });

    describe('getUpdateExpression', () => {
      it('parses REMOVE expressions', () => {
        expect(getUpdateExpression(updates)).toEqual('REMOVE #d.#e, #d.#g.#h');
      });
    });
  });
});

describe('ADD expressions', () => {
  describe('plain expressions', () => {
    const updates: UpdateMap<TestType> = {
      add: { a: 9 },
    };

    describe('getAttributeNamesFromUpdates', () => {
      it('gets attribute names from ADD expressions', () => {
        expect(getAttributeNamesFromUpdates(updates)).toEqual({
          '#a': 'a',
        });
      });
    });

    describe('getAttributeValuesFromUpdates', () => {
      it('gets attribute values from ADD operations', () => {
        expect(getAttributeValuesFromUpdates(updates)).toEqual({
          [`:${encode('a=9')}`]: 9,
        });
      });
    });

    describe('getUpdateExpression', () => {
      it('parses ADD expressions', () => {
        expect(getUpdateExpression(updates)).toEqual(
          `ADD #a :${encode('a=9')}`
        );
      });
    });
  });
});
