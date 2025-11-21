/**
 * Functionality for policies
 */

const { TABLE_NAME, getOne, runQuery } = require('/opt/dynamodb');
const { Exception, logger } = require('/opt/base');

/**
 * Retrieves policies based on the specified policy type and optional parameters.
 *
 * @param {string} policyType - The type of policies to retrieve.
 * @param {Object} [params=null] - Optional parameters for the query.
 * @param {number} [params.limit=null] - The maximum number of items to return.
 * @param {Object} [params.lastEvaluatedKey=null] - The key to start the query from.
 * @param {boolean} [params.paginated=true] - Whether to paginate the results.
 * @param {string} [params.policyId] - Specific policy ID to filter the results.
 * @returns {Promise<Object>} The result of the query, including the items and any pagination information.
 * @throws {Exception} Throws an exception if there is an error retrieving the policies.
 */
async function getPoliciesByType(policyType, params = null) {
  logger.info('Get Policies: type = ', policyType);
  try {

    const limit = params?.limit || null;
    const lastEvaluatedKey = params?.lastEvaluatedKey || null;
    const paginated = params?.paginated || true;

    // Get policies
    const queryObj = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': { S: `policy::${policyType}` },
      },
    };

    // If a policyId was provided, add it to the query
    if (params?.policyId) {
      queryObj.KeyConditionExpression += ' AND sk = :sk';
      queryObj.ExpressionAttributeValues[':sk'] = { S: `${params.policyType}::${params.policyId}` };
    }

    const res = await runQuery(queryObj, limit, lastEvaluatedKey, paginated);
    logger.info(`Policies: ${res?.items?.length} found.`);
    return res;
  } catch (error) {
    throw new Exception('Error getting policies', { code: 400, error: error });
  }
}

/**
 * Retrieves a policy by its type and ID.
 *
 * @async
 * @function getPolicyById
 * @param {string} policyType - The type of the policy.
 * @param {string} policyId - The ID of the policy.
 * @returns {Promise<Object>} The policy data.
 * @throws {Exception} Throws an exception if there is an error retrieving the policy.
 */
async function getPolicyById(policyType, policyId) {
  try {
    const res = await getOne(`policy::${policyType}`, policyId);
    return res;
  } catch (error) {
    throw new Exception('Error getting policy', { code: 400, error: error });
  }
}

async function parseRequest(body, requestType, policyType, versionKey = null, policyId = null) {
  let updateRequests = [];
  // Check if the request is a batch request
  if (!Array.isArray(body)) {
    body = [body];
  }
  for (let item of body) {
    updateRequests.push(
      await processItem(item, requestType, policyType, policyId, versionKey)
    );
  }
  return updateRequests;
}

async function processItem(
  collectionId,
  item,
  requestType,
  policyType,
  policyId = null,
  versionKey = null
) {
  if (requestType == "POST") {
    // Throw an error if policyId is passed in POST request, as we only allow auto increment for POST requests
    if (policyId) {
      throw new Error(
        "Can't specify policyId in POST request; must be null to allow auto increment",
        { code: 400 }
      );
    }

    // Make sure defaults are set for the item
    item['policyType'] = policyType;

    // If it's a retry attempt, remove these attributes from the item (if they exist)
    delete item?.policyId;
    delete item?.creationDate;
    delete item?.lastUpdated;
    delete item?.version;

    // If it's a POST request, we need to increment the identifier
    // or we need to create the counter if it doesn't already exist. incrementCounter does either.
    // Pass in the pk to start iterating the collection.
    const policyId = await incrementCounter('policy', policyType);
    const pk = `policy::${policyType}::${policyId}`;
    const policyIdVersion = await incrementCounter(pk, 'version');

    // Create the sk from the policyType and the identifier
    const sk = `v${String(policyIdVersion)}`;

    item.pk = pk;
    item.sk = sk;
    item.policyType = policyType;
    item.policyId = Number(policyId);
    item.identifier = Number(policyId);
    item.policyIdVersion = Number(policyIdVersion);

    // Create a second item pointing to the latest version
    const latestItem = { ...item };
    latestItem.sk = 'latest';
  }

  return [item, latestItem].map((i) => {
    return {
      key: {
        pk: i.pk,
        sk: i.sk
      },
      data: i,
    };
  });
}

module.exports = {
  getPoliciesByType,
  getPolicyById,
  parseRequest,
};