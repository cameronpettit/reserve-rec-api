/**
 * AWS Layer: dataRegister.js for Data Register functions.
 */

const axios = require('axios');
const { logger } = require('/opt/base');

async function getDataRegisterRecords(url, apiKey, params) {
  try {
    return await axios.get(encodeURI(url), {
      params: params,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'None',
        'Accept': 'application/json',
        'x-api-key': apiKey
      }
    });
  } catch (error) {
    logger.debug('Error getting data register records: getDataRegisterRecords function in dataRegister layer');
    throw error;
  }
}

module.exports = {
  getDataRegisterRecords
};