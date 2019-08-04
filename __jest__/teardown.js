const { Endpoint, DynamoDB } = require('aws-sdk');

module.exports = async () => {
  const ddb = new DynamoDB({
    endpoint: new Endpoint('http://localhost:4569').href,
    region: 'local'
  });

  await ddb.deleteTable({
    TableName: 'users',
  }).promise();
};
