
const { createPrimaryKeysFromString } = require('./common');

function buildFacility(data) {
  try {
    const mandatoryFields = ['orcs', 'displayName', 'facilityType', 'location', 'identifier'];
    for (const field of mandatoryFields) {
      if (!data?.[field]) {
        throw new Error(`'${field}' field is required`);
      }
    }
    const [latitude, longitude] = data.location.split(',');
    const facility = {
      pk: `facility::bcparks_${data.orcs}`,
      sk: `${data.facilityType}::${data?.identifier}`,
      displayName: data.displayName,
      fcCollectionId: `bcparks_${data.orcs}`,
      facilityType: data.facilityType,
      facilitySubType: data.facilitySubType,
      orcs: data.orcs,
      identifier: data?.identifier,
      schema: 'facility',
      facilityId: data?.identifier,
      description: data.description,
      location: {
        type: "point",
        coordinates: [Number(longitude), Number(latitude)]
      },
      address: data.address,
      activities: data?.activities ? createPrimaryKeysFromString(data.activities, true) : [],
      isVisible: data.isVisible,
      timezone: data.timezone,
      minMapZoom: data.minMapZoom,
      maxMapZoom: data.maxMapZoom,
      showOnMap: data.showOnMap,
      imageUrl: data.imageUrl,
      adminNotes: data?.adminNotes || '',
      searchTerms: data?.searchTerms || '',
    };
    return facility;
  } catch (error) {
    console.error('Error building facility:', error.message);
    throw error;
  }
}
async function createOrUpdateFacility(facilities, fetchInfo) {
  for (const facility of facilities) {
    if (!facility?.facilityId || !facility?.fcCollectionId || !facility?.facilityType) {
      console.error('Facility ID, Collection ID and Facility Type are required');
      continue;
    }
    // if (facility?.facilityType !== 'campground') {
    //   continue;
    // }
    const url = `${fetchInfo?.endpoint}/facilities/${facility.fcCollectionId}`;
    // check if geozone exists
    const checkUrl = `${fetchInfo?.endpoint}/facilities/${facility.fcCollectionId}?facilityType=${facility.facilityType}&facilityId=${facility.facilityId}`;
    const checkOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fetchInfo?.TOKEN}`,
      },
    };
    console.log(`Checking ${facility.pk}#${facility.sk}...`);
    const checkResponse = await fetch(checkUrl, checkOptions).then((response) => response.json());
    console.log('checkResponse:', checkResponse?.code);
    if (checkResponse?.data) {
      // facility exists, update it
      // remove unnecessary properties
      const deleteKeys = ['pk', 'sk', 'fcCollectionId', 'facilityId', 'orcs', 'facilityType', 'schema'];
      for (const key of deleteKeys) {
        delete facility[key];
      }
      const putOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fetchInfo?.TOKEN}`,
        },
        body: JSON.stringify(facility),
      };
      const putResponse = await fetch(checkUrl, putOptions).then((response) => response.json());
      console.log('putResponse:', putResponse);
    } else {
      // facility does not exist, create it
      console.log(`${facility.pk}#${facility.sk}... does not exist`);
      const postOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fetchInfo?.TOKEN}`,
        },
        body: JSON.stringify(facility),
      };

      const postResponse = await fetch(checkUrl, postOptions).then((response) => response.json());
      console.log('postResponse code:', postResponse);
    }
  }
}

module.exports = {
  buildFacility,
  createOrUpdateFacility
};
