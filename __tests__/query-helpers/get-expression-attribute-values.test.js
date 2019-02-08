import getExpressionAttributeValues from '../../src/query-helpers/get-expression-attribute-values';

it('handles a single plain query object', () => {
  expect(getExpressionAttributeValues({ id: 123 })).toEqual({ ':id': 123 });
});

it('handles a plain query object with multiple keys', () => {
  expect(getExpressionAttributeValues({ id: 123, date: 111 })).toEqual({ ':id': 123, ':date': 111 });
});
