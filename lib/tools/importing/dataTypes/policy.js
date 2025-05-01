const { createObjFromString } = require('./common');
const { marshall, batchTransactData, TABLE_NAME } = require('../dynamodb');

function buildBookingPolicy(data) {
  try {
    const mandatoryFields = ['displayName', 'schema', 'identifier', 'policyType', 'policyId'];
    for (const field of mandatoryFields) {
      if (!data?.[field]) {
        throw new Error(`'${field}' field is required`);
      }
    }
    let date = new Date().toISOString();
    const bookingPolicy = {
      pk: `policy::booking`,
      sk: String(data?.policyId),
      displayName: data.displayName,
      description: data.description,
      schema: 'policy',
      identifier: data.identifier,
      policyId: data?.policyId,
      policyType: 'booking',
      minStay: createObjFromString(data?.minStay, true),
      maxStay: createObjFromString(data?.maxStay, true),
      resWindowType: data?.resWindowType,
      rollingWindowDuration: createObjFromString(data?.rollingWindowDuration, true),
      fixedWindowLaunchDate: data?.fixedWindowLaunchDate,
      openBookingTime: createObjFromString(data?.openBookingTime, true),
      closeBookingTime: createObjFromString(data?.closeBookingTime, true),
      checkInTime: createObjFromString(data?.checkInTime, true),
      checkOutTime: createObjFromString(data?.checkOutTime, true),
      noShowTime: createObjFromString(data?.noShowTime, true),
      allDatesBookedIntervals: data?.allDatesBookedIntervals,
      adminNotes: data?.adminNotes || '',
      version: 1,
      creationDate: date,
      lastUpdated: date,
    };
    return bookingPolicy;
  } catch (error) {
    console.error('Error building booking policy:', error.message);
    throw error;
  }
}

function buildChangePolicy(data) {
  try {
    const mandatoryFields = ['displayName', 'schema', 'identifier', 'policyType', 'policyId'];
    for (const field of mandatoryFields) {
      if (!data?.[field]) {
        throw new Error(`'${field}' field is required`);
      }
    }
    let date = new Date().toISOString();
    const changePolicy = {
      pk: `policy::change`,
      sk: String(data?.policyId),
      displayName: data.displayName,
      description: data.description,
      schema: 'policy',
      identifier: Number(data.identifier),
      policyId: Number(data?.policyId),
      policyType: 'change',
      adminNotes: data?.adminNotes || '',
      version: 1,
      creationDate: date,
      lastUpdated: date,
      areChangesAllowed: Boolean(data?.areChangesAllowed),
      changeWindowDuration: createObjFromString(data?.changeWindowDuration, true),
      changeProhibitionDelayDuration: createObjFromString(data?.changeProhibitionDelayDuration, true),
      changeInWindowNightsForfeit: data?.changeInWindowNightsForfeit,
      changeSameDayNightsForfeit: data?.changeSameDayNightsForfeit,
      inventoryRereleaseDelay: createObjFromString(data?.inventoryRereleaseDelay, true),
      changesAcceptedUntilHour: createObjFromString(data?.changesAcceptedUntilHour, true),
      cancellationsAcceptedUntilHour: createObjFromString(data?.cancellationsAcceptedUntilHour, true),
      isRestrictedBookingWindowApplied: Boolean(data?.isRestrictedBookingWindowApplied),
    };
    return changePolicy;
  } catch (error) {
    console.error('Error building change policy:', error.message);
    throw error;
  }
}

function buildPartyPolicy(data) {
  try {
    const mandatoryFields = ['displayName', 'schema', 'identifier', 'policyType', 'policyId'];
    for (const field of mandatoryFields) {
      if (!data?.[field]) {
        throw new Error(`'${field}' field is required`);
      }
    }
    let date = new Date().toISOString();
    const partyPolicy = {
      pk: `policy::party`,
      sk: String(data?.policyId),
      displayName: data.displayName,
      description: data.description,
      schema: 'policy',
      identifier: Number(data.identifier),
      policyId: Number(data?.policyId),
      policyType: 'party',
      adminNotes: data?.adminNotes || '',
      version: 1,
      creationDate: date,
      lastUpdated: date,
      minOccupantAge: data?.minOccupantAge,
      minSize: data?.minSize,
      maxSize: data?.maxSize,
      maxUnitsPerBooking: data?.maxUnitsPerBooking,
      unitType: data?.unitType,
      maxAdultsTotal: data?.maxAdultsTotal,
      maxYouthTotal: data?.maxYouthTotal,
      maxChildTotal: data?.maxChildTotal,
      maxAdultsPerUnit: data?.maxAdultsPerUnit,
      maxYouthPerUnit: data?.maxYouthPerUnit,
      maxChildPerUnit: data?.maxChildPerUnit,
      maxSizePerUnit: data?.maxSizePerUnit,
      maxVehicles: data?.maxVehicles,
      equipmentRegulations: data?.equipmentRegulations,
      mustProvideAccessPoints: Boolean(data?.mustProvideAccessPoints),

    };
    console.log('partyPolicy:', partyPolicy);
    return partyPolicy;
  } catch (error) {
    console.error('Error building party policy:', error.message);
    throw error;
  }
}

async function createOrUpdatePolicy(policies) {
  let putItems = [];
  for (const policy of policies) {
    const putItem = {
      TableName: TABLE_NAME,
      Item: marshall(policy, {
        removeUndefinedValues: true,
      })
    }
    putItems.push(putItem);
  }
  try {
    await batchTransactData(putItems);
    console.log('Policies created/updated successfully');
  } catch (error) {
    console.error('Error putting items:', error);
    throw error;
  }
}

module.exports = {
  buildBookingPolicy,
  buildChangePolicy,
  buildPartyPolicy,
  createOrUpdatePolicy,
};