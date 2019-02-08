import getKeyConditionExpression from '../../src/query-helpers/get-key-condition-expression';

it('handles a single plain query object', () => {
  expect(getKeyConditionExpression({ id: 123 })).toEqual('#id = :id');
});

it('handles a plain query object with multiple keys', () => {
  expect(getKeyConditionExpression({ id: 123, date: 111 })).toEqual('#id = :id AND #date = :date');
});
