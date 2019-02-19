const getCreateKeyConditionExpression = (key, checkExists) => {
  const condition = checkExists ? 'attribute_exists' : 'attribute_not_exists';
  return Object.keys(key)
    .reduce((expression, k, i) => `${expression}${i === 0 ? '' : ' AND '}${condition}(${k})`, '');
};

module.exports = getCreateKeyConditionExpression;
