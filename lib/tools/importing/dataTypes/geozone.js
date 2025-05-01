const { createBBoxFrom5ptPolygon } = require('./common');

function buildGeozone(data) {
  try {
    if (!data?.location) {
      throw new Error('Location is required');
    }
    const [latitude, longitude] = data.location.split(',');
    const [topLeft, bottomRight] = createBBoxFrom5ptPolygon(data.envelope);
    const geozone = {
      pk: `geozone::bcparks_${data.orcs}`,
      sk: `${data.identifier}`,
      displayName: data.displayName,
      gzCollectionId: `bcparks_${data.orcs}`,
      orcs: data.orcs,
      identifier: data.identifier,
      schema: 'geozone',
      geozoneId: data.identifier,
      description: data.description,
      location: {
        type: "point",
        coordinates: [Number(longitude), Number(latitude)]
      },
      envelope: {
        type: "envelope",
        coordinates: [topLeft, bottomRight]
      },
      timezone: data.timezone,
      isVisible: data.isVisible,
      minMapZoom: data.minMapZoom,
      maxMapZoom: data.maxMapZoom,
      facilities: [],
      activities: [],
      adminNotes: data?.adminNotes || '',
      searchTerms: data?.searchTerms || ''
    };
    return geozone;
  } catch (error) {
    console.error('Error building geozone:', error.message);
    throw error;
  }
}

async function createOrUpdateGeozone(geozones, fetchInfo) {
  for (const geozone of geozones) {
    if (!geozone?.geozoneId) {
      console.error('Geozone ID is required');
      continue;
    }
    const url = `${fetchInfo?.endpoint}/geozones/${geozone.gzCollectionId}`;
    // check if geozone exists
    const checkUrl = `${fetchInfo?.endpoint}/geozones/${geozone.gzCollectionId}?geozoneId=${geozone.geozoneId}`;
    const checkOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${fetchInfo?.TOKEN}`,
      },
    };
    console.log(`Checking ${geozone.gzCollectionId}#${geozone.sk}...`);
    const checkResponse = await fetch(checkUrl, checkOptions).then((response) => response.json());
    if (checkResponse?.data?.items?.length > 0) {
      console.log(`${geozone.gzCollectionId}#${geozone.sk}... exists`);
      console.log(checkResponse?.data?.items?.length);
      console.log('checkResponse?.data?.items?:', checkResponse?.data?.items[0].gzCollectionId, checkResponse?.data?.items[0].sk);
      // geozone exists, update it
      // remove unnecessary properties
      const deleteKeys = ['pk', 'sk', 'gzCollectionId', 'geozoneId', 'orcs'];
      for (const key of deleteKeys) {
        delete geozone[key];
      }
      const putOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fetchInfo?.TOKEN}`,
        },
        body: JSON.stringify(geozone),
      };
      const putResponse = await fetch(checkUrl, putOptions).then((response) => response.json());
      console.log('putResponse:', putResponse);
    } else {
      // geozone does not exist, create it
      console.log(`${geozone.gzCollectionId}#${geozone.sk}... does not exist`);
      const postOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${fetchInfo?.TOKEN}`,
        },
        body: JSON.stringify(geozone),
      };

      const postResponse = await fetch(url, postOptions).then((response) => response.json());
    }
  }
}


module.exports = {
  buildGeozone,
  createOrUpdateGeozone,
}
