const getExpressionAttributeValues = key => Object.entries(key)
  .reduce((values, [k, v]) => ({
    ...values,
    [`:${k}`]: v.value || v,
  }), {});

module.exports = getExpressionAttributeValues;
