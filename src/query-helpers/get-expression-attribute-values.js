const getExpressionAttributeValues = key => Object.entries(key)
  .reduce((values, [k, v]) => ({
    ...values,
    [`:${k}`]: v,
  }), {});

export default getExpressionAttributeValues;
