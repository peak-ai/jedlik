const getExpressionAttributeValues = require('../../src/query-helpers/get-expression-attribute-values');

it('handles a single plain query object', () => {
  expect(getExpressionAttributeValues({ id: 123 })).toEqual({ ':id': 123 });
});

it('handles a plain query object with multiple keys', () => {
  expect(getExpressionAttributeValues({ id: 123, date: 111 })).toEqual({ ':id': 123, ':date': 111 });
});

it("selects the value property of the attribute value if it's present, required for filter attributes", () => {
  expect(getExpressionAttributeValues({
    id: 123,
    date: 111,
    age: {
      operator: '>',
      value: 20,
    },
  })).toEqual({ ':id': 123, ':date': 111, ':age': 20 });
});
