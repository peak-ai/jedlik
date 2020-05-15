const getExpressionAttributeNames = require('../../src/query-helpers/get-expression-attribute-names');

it('handles a single plain query object', () => {
  expect(getExpressionAttributeNames({ id: 123 })).toEqual({ '#id': 'id' });
});

it('handles a plain query object with multiple keys', () => {
  expect(getExpressionAttributeNames({ id: 123, date: 111 })).toEqual({ '#id': 'id', '#date': 'date' });
});

it('handles a plain query object with filter values', () => {
  expect(getExpressionAttributeNames({
    id: 123,
    date: 111,
    age: {
      operator: '>',
      value: 21,
    },
  })).toEqual({ '#id': 'id', '#date': 'date', '#age': 'age' });
});
