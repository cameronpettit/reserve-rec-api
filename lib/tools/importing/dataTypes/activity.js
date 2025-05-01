const {createPrimaryKeysFromString} = require('./common');

function buildActivity(data) {
  try {
    const mandatoryFields = ['orcs', 'displayName', 'activityType', 'identifier', 'schema'];
    for (const field of mandatoryFields) {
      if (!data?.[field]) {
        throw new Error(`'${field}' field is required`);
      }
    }
    const activity = {
      pk: `activity::bcparks_${data.orcs}`,
      sk: `${data.activityType}::${data?.identifier}`,
      displayName: data.displayName,
      acCollectionId: `bcparks_${data.orcs}`,
      activityType: data.activityType,
      activitySubType: data.activitySubType,
      orcs: data.orcs,
      identifier: data?.identifier,
      schema: 'activity',
      activityId: data?.identifier,
      description: data.description,
      facilities: data?.facilities ? createPrimaryKeysFromString(data.facilities) : [],
      isVisible: data.isVisible,
      imageUrl: data.imageUrl,
      adminNotes: data?.adminNotes || '',
      searchTerms: data?.searchTerms || '',
      geozone: data?.geozone ? createPrimaryKeysFromString(data.geozone) : [],
    };
    return activity;
  } catch (error) {
    console.error('Error building activity:', error.message);
    throw error;
  }
}


async function createOrUpdateActivity(activities, fetchInfo) {
  for (const activity of activities) {
    if (!activity?.activityId || !activity?.acCollectionId || !activity?.activityType) {
      console.error('Activity ID, Collection ID and Activity Type are required');
      continue;
    }
    const url = `${fetchInfo?.endpoint}/activities/${activity.acCollectionId}`;
    // check if activity exists
    const checkUrl = `${fetchInfo?.endpoint}/activities/${activity.acCollectionId}?activityType=${activity.activityType}&activityId=${activity.activityId}`;
    console.log('checkUrl:', checkUrl);
    const checkOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fetchInfo?.TOKEN}`,
      },
    };
    console.log(`Checking ${activity.pk}#${activity.sk}...`);
    const checkResponse = await fetch(checkUrl, checkOptions).then((response) => response.json());
    console.log('checkResponse:', checkResponse?.code);
    if (checkResponse?.data) {
      // activity exists, update it
      // remove unnecessary properties
      const deleteKeys = ['pk', 'sk', 'acCollectionId', 'activityId', 'orcs', 'activityType', 'schema'];
      for (const key of deleteKeys) {
        delete activity[key];
      }
      const putOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fetchInfo?.TOKEN}`,
        },
        body: JSON.stringify(activity),
      };
      const putResponse = await fetch(checkUrl, putOptions).then((response) => response.json());
      console.log('putResponse:', putResponse);
    } else {
      // activity does not exist, create it
      console.log(`${activity.pk}#${activity.sk}... does not exist`);
      const postOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fetchInfo?.TOKEN}`,
        },
        body: JSON.stringify(activity),
      };

      const postResponse = await fetch(checkUrl, postOptions).then((response) => response.json());
      console.log('postResponse code:', postResponse);
    }
  }
}

module.exports = {
  buildActivity,
  createOrUpdateActivity,
};
