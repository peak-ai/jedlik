const getFilterExpression = require('../../src/query-helpers/get-filter-expression');

it('defaults to the = operator if a direct value is passed', () => {
  expect(getFilterExpression({ id: 123, date: 111 })).toEqual('#id = :id AND #date = :date');
});

it('defaults respects the operator property if the value is a filter object', () => {
  expect(getFilterExpression({
    id: 123,
    date: {
      operator: '>',
      value: 1589472228415,
    },
  })).toEqual('#id = :id AND #date > :date');
});
