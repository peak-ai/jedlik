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
          [`:${encode('a2')}`]: 2,
          [`:${encode('b3')}`]: '3',
        });
      });
    });

    describe('getUpdateExpression', () => {
      it('parses SET expressions', () => {
        expect(getUpdateExpression(updates)).toEqual(
          `SET #a = :${encode('a2')}, #b = :${encode('b3')}`
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
          [`:${encode('a2')}`]: 2,
          [`:${encode('b4')}`]: '4',
          [`:${encode('ctrue')}`]: true,
        });
      });
    });

    describe('getUpdateExpression', () => {
      it('parses SET expressions', () => {
        expect(getUpdateExpression(updates)).toEqual(
          `SET #a = :${encode('a2')}, #b = if_not_exists(#b, :${encode(
            'b4'
          )}), #c = if_not_exists(#c, :${encode('ctrue')})`
        );
      });
    });
  });
});
