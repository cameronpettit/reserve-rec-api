const xlsx = require('xlsx');
const path = require('path');

const { buildActivity, createOrUpdateActivity } = require('./dataTypes/activity');
const { buildGeozone, createOrUpdateGeozone } = require('./dataTypes/geozone');
const { buildFacility, createOrUpdateFacility } = require('./dataTypes/facility');
const { buildProduct, createOrUpdateProduct } = require('./dataTypes/product');
const { buildBookingPolicy, buildChangePolicy, buildPartyPolicy, createOrUpdatePolicy } = require('./dataTypes/policy');

const filePath = './rawData/data_collection_backcountry_registration_mar21.xlsx';
const sheets = [
  // 'Geozones',
  // 'Facilities',
  // 'Activities',
  'Booking Policies',
  'Change Policies',
  'Party Policies',
  'Products'
];

let facilityTypesCounter = {};

const TOKEN = 'replace';

const endpoint = 'https://o5t24hjhbd.execute-api.ca-central-1.amazonaws.com/api';
// const endpoint = 'http://localhost:3000';

const fetchInfo = {
  endpoint: endpoint,
  TOKEN: TOKEN,
};

/**
 * Function to import data from an Excel file
 * @param {string} filePath - Path to the Excel file
 * @returns {Array<Object>} - Array of objects representing the data
 */
function importExcelData(filePath) {
  try {
    // Resolve the file path
    const absolutePath = path.resolve(filePath);

    // Read the workbook
    const workbook = xlsx.readFile(absolutePath);

    let formattedData = [];

    for (const sheetName of sheets) {
      // Get the worksheet
      const worksheet = workbook.Sheets[sheetName];

      // Convert the worksheet to JSON
      const data = xlsx.utils.sheet_to_json(worksheet);

      switch (sheetName) {
        case 'Geozones':
          let geozones = [];
          let geozoneFailures = [];
          data.map((row) => {
            try {
              geozones.push(buildGeozone(row));
            } catch (error) {
              geozoneFailures.push({
                error: error.message,
                schema: 'geozone',
                data: row
              });
            }
          });
          formattedData[sheetName] = {
            data: geozones,
            failures: geozoneFailures
          };
          break;
        case 'Facilities':
          let facilities = [];
          let facilityFailures = [];
          data.map((row) => {
            try {
              facilities.push(buildFacility(row));
            } catch (error) {
              facilityFailures.push({
                error: error.message,
                schema: 'facility',
                data: row
              });
            }
          }
          );
          formattedData[sheetName] = {
            data: facilities,
            failures: facilityFailures
          };
          break;
        case 'Activities':
          let activities = [];
          let activityFailures = [];
          data.map((row) => {
            try {
              activities.push(buildActivity(row));
            } catch (error) {
              activityFailures.push({
                error: error.message,
                schema: 'activity',
                data: row
              });
              console.error('Error building activity:', error.message);
            }
          });
          formattedData[sheetName] = {
            data: activities,
            failures: activityFailures
          };
          break;
        case 'Booking Policies':
          let bookingPolicies = [];
          let bookingPolicyFailures = [];
          data.map((row) => {
            try {
              bookingPolicies.push(buildBookingPolicy(row));
            } catch (error) {
              bookingPolicies.push({
                error: error.message,
                schema: 'bookingPolicy',
                data: row
              });
              console.error('Error building bookingPolicy:', error.message);
            }
          });
          formattedData[sheetName] = {
            data: bookingPolicies,
            failures: bookingPolicyFailures
          };
          break;
        case 'Change Policies':
          let changePolicies = [];
          let changePolicyFailures = [];
          data.map((row) => {
            try {
              changePolicies.push(buildChangePolicy(row));
            } catch (error) {
              changePolicies.push({
                error: error.message,
                schema: 'changePolicy',
                data: row
              });
              console.error('Error building changePolicy:', error.message);
            }
          });
          formattedData[sheetName] = {
            data: changePolicies,
            failures: changePolicyFailures
          };
          break;
        case 'Party Policies':
          let partyPolicies = [];
          let partyPolicyFailures = [];
          data.map((row) => {
            try {
              partyPolicies.push(buildPartyPolicy(row));
            } catch (error) {
              partyPolicies.push({
                error: error.message,
                schema: 'partyPolicy',
                data: row
              });
              console.error('Error building partyPolicy', error.message);
            }
          });
          formattedData[sheetName] = {
            data: partyPolicies,
            failures: partyPolicyFailures
          };
          break;
        case 'Products':
          let products = [];
          let productFailures = [];
          data.map((row) => {
            try {
              products.push(buildProduct(row));
            } catch (error) {
              products.push({
                error: error.message,
                schema: 'product',
                data: row
              });
              console.error('Error building product', error.message);
            }
          });
          formattedData[sheetName] = {
            data: products,
            failures: productFailures
          };
          break;
        default:
          console.log(sheetName, data);
      }

    }
    return formattedData;
  } catch (error) {
    console.error('Error importing Excel data:', error.message);
    throw error;
  }
}


// Example usage
try {
  const data = importExcelData(filePath);
  console.log('Imported Data:', data);
  for (const sheetName of sheets) {
    if (data[sheetName]?.data?.length > 0) {
      switch (sheetName) {
        case 'Geozones':
          createOrUpdateGeozone(data[sheetName].data, fetchInfo);
          break;
        case 'Facilities':
          createOrUpdateFacility(data[sheetName].data, fetchInfo);
          break;
        case 'Activities':
          createOrUpdateActivity(data[sheetName].data, fetchInfo);
          break;
        case 'Booking Policies':
        case 'Change Policies':
        case 'Party Policies':
          createOrUpdatePolicy(data[sheetName].data, fetchInfo);
          break;
        case 'Products':
          createOrUpdateProduct(data[sheetName].data, fetchInfo);
          break;
        default:
          console.log('No data to import for sheet:', sheetName);
      }
    }
  }
} catch (error) {
  console.error('Failed to import data:', error.message);
}


