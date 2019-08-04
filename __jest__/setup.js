const { Endpoint, DynamoDB } = require('aws-sdk');

module.exports = async() => {
  const ddb = new DynamoDB({
    endpoint: new Endpoint('http://localhost:4569').href,
    region: 'local'
  });

  await ddb.createTable({
    TableName: 'users',
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
  }).promise();
};
