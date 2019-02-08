const getKeyConditionExpression = key => Object.keys(key)
  .reduce((expression, k, i) => `${expression}${i === 0 ? '' : ' AND '}#${k} = :${k}`, '');

export default getKeyConditionExpression;
