const {CognitoIdentityProviderClient} = require('@aws-sdk/client-cognito-identity-provider');

const cognitoProviderClient = new CognitoIdentityProviderClient({});
console.log('cognitoProviderClient:', cognitoProviderClient);

async function listUsers(userPoolId, limit, paginationToken, filter = null) {
  return [];
}

module.exports = {
  cognitoProviderClient,
  listUsers
};