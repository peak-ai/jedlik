const getExpressionAttributeValues = key => Object.entries(key)
  .reduce((values, [k, v]) => ({
    ...values,
    [`:${k}`]: v,
  }), {});

module.exports = getExpressionAttributeValues;
