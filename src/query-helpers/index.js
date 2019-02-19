const getExpressionAttributeNames = require('./get-expression-attribute-names');
const getExpressionAttributeValues = require('./get-expression-attribute-values');
const getKeyConditionExpression = require('./get-key-condition-expression');
const getCreateKeyConditionExpression = require('./get-create-key-condition-expression');

module.exports = {
  getExpressionAttributeNames,
  getExpressionAttributeValues,
  getKeyConditionExpression,
  getCreateKeyConditionExpression,
};
