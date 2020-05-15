const getFilterExpression = filters => Object.entries(filters)
  .reduce((expression, [key, { operator = '=' }], i) => `${expression}${i === 0 ? '' : ' AND '}#${key} ${operator} :${key}`,
    '');

module.exports = getFilterExpression;
