const { createPrimaryKeysFromString } = require('./common');
const { marshall, batchTransactData, TABLE_NAME } = require('../dynamodb');

function buildProduct(data) {
  try {
    const mandatoryFields = ['orcs', 'displayName', 'activityType', 'identifier', 'schema', 'acCollectionId', 'activityId'];
    for (const field of mandatoryFields) {
      if (!data?.[field]) {
        throw new Error(`'${field}' field is required`);
      }
    }
    const date = new Date().toISOString();
    const product = {
      pk: `product::${data.acCollectionId}::${data.activityType}::${data?.activityId}`,
      sk: `${data.seasonId}::${data?.identifier}`,
      displayName: data.displayName,
      acCollectionId: data.acCollectionId,
      activityType: data.activityType,
      activitySubType: data.activitySubType,
      orcs: data.orcs,
      identifier: data?.identifier,
      productId: data?.identifier,
      schema: 'product',
      activityId: data?.activityId,
      description: data.description,
      adminNotes: data?.adminNotes || '',
      searchTerms: data?.searchTerms || '',
      seasonId: data?.seasonId,
      startDate: data?.startDate,
      endDate: data?.endDate,
      allocationType: data?.allocationType,
      baseCapacity: data?.baseCapacity,
      isInventoryFinite: Boolean(data?.isInventoryFinite),
      isVisible: data.isVisible,
      bookingPolicy: createPrimaryKeysFromString(data?.bookingPolicy),
      changePolicy: createPrimaryKeysFromString(data?.changePolicy),
      partyPolicy: createPrimaryKeysFromString(data?.partyPolicy),
      asset: data?.asset,
      imageUrl: data.imageUrl,
      version: 1,
      creationDate: date,
      lastUpdated: date,
    };
    return product;
  } catch (error) {
    console.error('Error building product:', error.message);
    throw error;
  }
}

async function createOrUpdateProduct(products) {
  let putItems = [];
  for (const product of products) {
    const putItem = {
      TableName: TABLE_NAME,
      Item: marshall(product, {
        removeUndefinedValues: true,
      })
    }
    putItems.push(putItem);
  }
  try {
    await batchTransactData(putItems);
    console.log('Products created/updated successfully');
  } catch (error) {
    console.error('Error putting items:', error);
    throw error;
  }
}

module.exports = {
  buildProduct,
  createOrUpdateProduct
}