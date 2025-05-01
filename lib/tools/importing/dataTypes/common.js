

// expect polygon to come in the form of a 5 item array, where the first and last item are the same, and the middle items are the corners of the bbox going counterclockwise from the bottom left
// expect polygon to come as [[[long, lat], [long, lat], [long, lat], [long, lat], [long, lat]]]
// expect bbox to return as [[long, lat], [long, lat]] (topleft, bottomright)
function createBBoxFrom5ptPolygon(polygon) {
  polygon = createArrayFromString(polygon);
  if (!Array.isArray(polygon[0]) || polygon[0].length !== 5) {
    throw new Error('Polygon must be an array of 5 points');
  }

  const lats = polygon[0].map((point) => Number(point[1]));
  const longs = polygon[0].map((point) => Number(point[0]));
  const topLeft = [Math.min(...longs), Math.max(...lats)];
  const bottomRight = [Math.max(...longs), Math.min(...lats)];

  // Return the bounding box as [topleft, bottomright]
  return [topLeft, bottomRight];
}

function createArrayFromString(str) {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string');
  }

  try {
    // Use JSON.parse to convert the string into a nested array
    const nestedArray = JSON.parse(str);

    if (!Array.isArray(nestedArray)) {
      throw new Error('Parsed result is not an array');
    }

    return nestedArray;
  } catch (error) {
    throw new Error('Invalid string format for nested array');
  }
}

function createObjFromString(string, isNumberProp = false) {
  try {
    let props = string.replace("{", "").replace("}", "").split(",");
    let obj = {};
    for (let i = 0; i < props.length; i++) {
      let prop = props[i].split(":");
      if (isNumberProp) {
        obj[prop[0].trim()] = Number(prop[1].trim());
      } else {
        obj[prop[0].trim()] = prop[1].trim();
      }
    }
    return obj;
  } catch (error) {
    return null;
  }
}

function createPrimaryKeysFromString(string, array = false) {
  let keys = [];
  string = string.replace('[', '').replace(']', '');
  let strKeys = string.split("}").filter((item) => item.trim() !== "");
  for (const strKey of strKeys) {
    let strToParse = string.replace("{", "").replace("}", "").split(",");
    let pk = strToParse[0].split("pk:")[1].trim();
    let sk = strToParse[1].split("sk:")[1].trim();
    keys.push({ pk: pk, sk: sk });
  }
  console.log('keys:', keys);
  if (keys.length === 0) {
    return null;
  }
  if (keys.length === 1 && !array) {
    return keys[0];
  }
  return keys;
}



module.exports = {
  createBBoxFrom5ptPolygon,
  createArrayFromString,
  createObjFromString,
  createPrimaryKeysFromString
};