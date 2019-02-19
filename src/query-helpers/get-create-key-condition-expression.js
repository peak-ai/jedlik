const getCreateKeyConditionExpression = key => Object.keys(key)
  .reduce((expression, k, i) => `${expression}${i === 0 ? '' : ' AND '}attribute_not_exists(${k})`, '');

module.exports = getCreateKeyConditionExpression;
