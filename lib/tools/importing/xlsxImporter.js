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

const TOKEN = 'eyJraWQiOiJndDI5ZnNvUTNzXC9VcGU1azlpMmh2djRIKzBEN0wrXC9PMk90eGRPdWtaXC9BPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIzY2JkNzU5OC01MGExLTcwNWItMGY1OS0yNDA1OTlkMDFlMjEiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuY2EtY2VudHJhbC0xLmFtYXpvbmF3cy5jb21cL2NhLWNlbnRyYWwtMV9MY016bFBFQm8iLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiJhYWRtdGc0ZmoxbHM5NjhrdDRhZzVnbzdkIiwib3JpZ2luX2p0aSI6ImZjNzE2OGRjLWQ4MWMtNDA0Ni1iZjIwLTJiYzBiYWE4YjEwNiIsImV2ZW50X2lkIjoiOWEwMTY4MTUtNzc2OC00MDc2LThjMDYtNWE4NWViYmU1M2ZhIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiBvcGVuaWQgcHJvZmlsZSBlbWFpbCIsImF1dGhfdGltZSI6MTc0NjA2MjM5OSwiZXhwIjoxNzQ2MTQ4Nzk5LCJpYXQiOjE3NDYwNjIzOTksImp0aSI6IjQ2MThlOWRhLTVhODgtNDY2MS1hODRhLTdjMjVhOGU4ZTAwNyIsInVzZXJuYW1lIjoiY2FtZXJvbnBldHRpdCJ9.ju8INQGBQ_PyLJAPgm6ZZsq93h0JJ2byoV1dzGZyaJN3mMl3gzem1dYgVK6KOxoIAxY-NqrmtTRHThoBeLfaTaldZQAB46X1osm7Ze8CBC1t-Sh5lUsN0S06UGv__EWmzMhlQ-J8AwqawyCc16mnGqY2FtX9jLzF4GF-5JU0BaYaCeiKYLhTLAMV7n7bQWNuuo3T8lmvSUer-8jXk0BGcykmuicrxJjmXXoxROeB9p9dgkv49CFexgyYgkxTxYmHWzYYoILaqoMpCv3kKpokQe-6u03GsTrdCr8g4ecwLNI1CgN9gioxmxVFojltk7xd_42lTZKbvMsw3uX_NXemjw';

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


