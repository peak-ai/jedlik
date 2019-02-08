const getExpressionAttributeNames = key => Object.keys(key)
  .reduce((names, k) => ({
    ...names,
    [`#${k}`]: k,
  }), {});

export default getExpressionAttributeNames;
