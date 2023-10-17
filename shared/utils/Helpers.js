import { EXTENSIONS, MIMETYPES } from '../constants/ImageConstants';
import moment from 'moment';
import '../constants/moment-timezone-with-data-10-year-range';
import 'moment-timezone';
import eventCoverPhotos from '../images/eventCoverPhotos';
import DefaultProfileImg from '../images/DefaultProfileImg.png';
import { userProfile } from '../models/UserProfile';

export function getRadioIndexForValue(array, value, fallback) {
  // initial prop on radio buttons expects an index.
  // this returns the index, or a fallback index if not found
  let i = array.findIndex((obj) => obj.value === value);
  if (i > -1) {
    return i;
  } else {
    return fallback;
  }
}
export function isNullOrEmpty(str) {
  if (!str) {
    return true; // no input
  }
  if (!str.trim()) {
    return true; // only spaces
  }
  return false;
}
//Very simple email validation anystring@anystring.anystring
export function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

//https://regexr.com/37i6s
export function validURL(url) {
  var re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
  return re.test(url);
}

export function isPhoneNumber(phoneNumber) {
  const phoneNumberPattern = /^\d{10}$/; // Matches exactly ten numeric characters in a row
  return phoneNumberPattern.test(phoneNumber);
}

export function isObject(val) {
  if (val === null || Array.isArray(val)) return false;
  return typeof val === 'function' || typeof val === 'object';
}

export function generateBody(data) {
  if (!isObject(data)) {
    throw new TypeError();
  }
  let formBody = [];
  for (let property in data) {
    if (
      typeof data[property] === 'object' ||
      typeof data[property] === 'function' ||
      typeof data[property] === 'symbol' ||
      Array.isArray(data[property])
    ) {
      throw new TypeError();
    }
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(data[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  return formBody.join('&');
}

export function urlToParamsObj(url) {
  const queryString = url.split('?')[1];
  if (queryString === undefined) {
    return {};
  }
  const keyValPairs = queryString.split('&');
  let keyValArray = keyValPairs.map((stringPair) => {
    return stringPair.split('=');
  });
  let paramsObj = {};
  for (let pair of keyValArray) {
    Object.assign(paramsObj, {
      [pair[0]]: pair[1],
    });
  }
  return paramsObj;
}

export function getImageType(image) {
  // Per wordpress spec, this can only be .jpg, .jpeg, .png, and .gif
  let image_name = image.filename.toLowerCase();
  if (
    image_name.endsWith(EXTENSIONS.jpeg) ||
    image_name.endsWith(EXTENSIONS.jpg)
  ) {
    return MIMETYPES.jpg;
  } else if (image_name.endsWith(EXTENSIONS.png)) {
    return MIMETYPES.png;
  } else if (image_name.endsWith(EXTENSIONS.gif)) {
    return MIMETYPES.gif;
  } else {
    throw new Error('The selected image type is not supported.');
  }
}

// send a changed file extension and type for image resizer to handle heic and plist (apple's way of saving edited photos on iOS 13+)
export function convertTypeToJPG(image) {
  // the web app will not run when using filename?.split to do a loader error, instead wrap it in a try catch
  // and on a failure return the image
  try {
    let filename; 
    if (image.image.filename) {
      filename = image.image.filename;
    } else if (image.image.uri) {
      filename = image.image.uri;
    }
    const needsConverted = filename.split('.')[1].toLowerCase() === 'heic' || filename.split('.')[1].toLowerCase() === 'plist';
    if (needsConverted) {
      return {
        image: {
          uri: image.image.uri,
          name: needsConverted ? `${filename.split('.')[0]}.JPG` : filename.split('Camera/')[1],
          type: needsConverted ? 'image/jpeg' : image.type,
        }
      };
    } else {
      return image;
    }
  } catch(err) {
    return image;
  }
}

// For use on id: any, objectList: Array<{id: Number}>
export function getIndexFromID(id, objectList) {
  for (let i = 0; i < objectList.length; i++) {
    if (objectList[i].id === undefined) {
      throw new Error(`List element ${i} does not have id`);
    }
    if (objectList[i].id === id) {
      return i;
    }
  }
  return -1;
}

export function jsonOrThrow(response) {
  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`Response returned ${response.status}`);
  }
}

export function countUsers({ going, interested, checked_in }) {
  const goingCount =
    going && going.pagination ? going.pagination.total_count : 0;
  const interestedCount =
    interested && interested.pagination ? interested.pagination.total_count : 0;
  const checkedInCount =
    checked_in && checked_in.pagination ? checked_in.pagination.total_count : 0;
  return goingCount + interestedCount + checkedInCount;
}

// quick-and-dirty implementation
export function arrayDeepClone(array) {
  return JSON.parse(JSON.stringify(array));
}

export function getBlobFromLocalURI(imageURI) {
  return fetch(imageURI)
    .then((result) => {
      return result
        .blob()
        .then((blob) => {
          return blob;
        })
        .catch((error) => {
          console.warn('Unable to obtain blob', error);
        });
    })
    .catch((error) => {
      console.warn('Fetch URI Error: ', error);
    });
}

// change name...maybe displayableOptionValue?
export function getDisplayableValue(value, options) {
  if (!value) return undefined;
  const entries = Object.entries(options);
  return entries.map((entry) => {
    if (
      entry[1].slug === value ||
      entry[0] === value ||
      entry[1].display === value
    )
      return entry[1].display;
  });
}

function getCurrentTimeUTC() {
  // moment.utc() and moment().utc() still uses local data for time comparisons
  // fromnow also compares to local time
  // get the offset and add that to the hours to get actual UTC time
  const currentTime = moment();
  const offsetHours = currentTime.utcOffset() / 60;
  return currentTime.subtract(offsetHours, 'hours');
}

// check if at any month of the year the device's timezone observes DLS
function observesDLS() {
  let isDLS = false;
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().getDate(); // date of month
  for (let i = 0; i < 12; i++) {
    if (moment([currentYear, `${i}`, currentDate]).isDST()){
      isDLS = true;
      break;
    }
  }
  return isDLS;
}

// times by default display just the offset from UTC by their local time. Add the additional offset from the device,
// which matters when looking at events in different time zones
export function getOffsetTime(time, tz) {
  if (time) {
    const currTime = new moment();
    const localOffsetMinutes = moment().utcOffset();
    let timeOffsetMinutes = time.utcOffset();

    // time comes in as UTC, and UTC is never DST, so convert it to the proper timezone
    let eventTime;
    if (tz) eventTime = time.clone().tz(tz);

    if (observesDLS() && eventTime) {
      if (!eventTime.isDST() && currTime.isDST()) {
        timeOffsetMinutes += 60;
      }
      else if (eventTime.isDST() && !currTime.isDST()) {
        timeOffsetMinutes -= 60;
      }
    }

    const minuteDifference = localOffsetMinutes - timeOffsetMinutes;
    return time.add(minuteDifference, 'minutes');
  }
}

// returns a string for how long ago the post was made
export function howLongAgo(postTime) {
  /* 
    post times do not contain the "Z" at the end indicating it is a utc time
    while comments do. This causes an additional time gap from the local
    time to current time utc for comments
  */
  if (postTime[postTime.length - 1] === 'Z') postTime = postTime.slice(0, -1);
  postTime = moment(postTime);
  const currentTimeUTC = getCurrentTimeUTC();
  // return the number and the first character of time (m, h, d)
  const originalMessage = postTime.from(currentTimeUTC, true).split(' ');
  if (originalMessage[0] === 'an') return '1h';
  else if (originalMessage[0].concat(originalMessage[1]) === 'aday')
    return '1d';
  else if (originalMessage[0].concat(originalMessage[1]) === 'aminute')
    return '1m';
  // a few seconds
  else if (originalMessage[0].concat(originalMessage[1]) === 'afew')
    return '<1m';
  else if (originalMessage[1] === 'minutes' || originalMessage[1] === 'hours' || originalMessage[1] === 'hour')
    return originalMessage[0] + originalMessage[1].slice(0, 1);
  // otherwise return days. Using this format to ensure it sticks with days
  return `${currentTimeUTC.diff(postTime, 'days')}d`;
}

export function displayFullAddress(street, city, state, zip, country) {
  let displayedAddress = street;
  // some addresses come in with the city, state, and country
  // example address: 61088 Manhae Loop, Bend, OR, USA
  // Foreign address example: Place du Panthéon, 75005 Paris, France
  const addressComponents = street.split(",");
  // assuming if there are at least 2 commas the full address was passed in
  if (addressComponents.length >= 3) {
    if (country === 'US' || country === 'USA') {
      // these full addresses in the US do not include the zip
      if (zip) {
        // states will have a space before them
        if (addressComponents[2].trim().length === 2 && addressComponents[2].trim() === addressComponents[2].trim().toUpperCase()){
          // append the zip to the state section
          addressComponents[2] = `${addressComponents[2]} ${zip}`;
          displayedAddress = addressComponents.join(',');
        }
      }
    }
    // NOTE: Did not do too extensive testing with various countries for zip codes
    else {
      addressComponents[1] = ` ${zip}${addressComponents[1]}`
      // example result: 79 Avenue Bosquet, 75007 Paris, France
      displayedAddress = addressComponents.join(',');
    }
  }
  else {
    // requiring city, state, and zip to all be provided.
    if (city && state && zip) displayedAddress += `, ${city}, ${state} ${zip}`;
    if (country) displayedAddress += `, ${country}`;
  }
  return displayedAddress;
}

export function generateFilteredTime(timeSlug) {
  if (!timeSlug) return '';
  let days;
  let endDate;
  let startDate;
  // all and today both start with the current date
  if (timeSlug === 'today' || timeSlug === 'all') days = 0;
  else {
    timeSlug = timeSlug.split('-');
    days = timeSlug[1];
    if (timeSlug[0] === 'past') {
      days *= -1;
    }
  }
  if (days < 0) {
    startDate = moment().startOf('day').add(days, 'days').toISOString();
    endDate = moment().endOf('day').subtract(1, 'day').toISOString();
  } else if (days === 0) {
    // moment uses user's timezone and add it when using toISOString
    startDate = moment().startOf('day').toISOString();
    if (timeSlug === 'today') endDate = moment().endOf('day').toISOString();
    // "all", get events a year into the future
    else endDate = getCurrentTimeUTC().add(365, 'days').toISOString();
  } else {
    startDate = moment().startOf('day').toISOString();
    endDate = moment().endOf('day').add(days, 'days').toISOString();
  }
  return `after=${startDate}&before=${endDate}`;
}

// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function extractAddressComponent(component, address_data) {
  for (let datum of address_data) {
    if (datum.types.includes(component)) {
      return datum;
    }
  }
  // some data might not be found, but depending on the level of data of location (i.e. state), that data might not be found
  return null;
}

export function displayInvitedUsers(invitedUsers) {
  let displayedUsers = '';
  for (let i = 0; i < invitedUsers.length; i++) {
    displayedUsers += `${invitedUsers[i].name} `;
  }
  return displayedUsers;
}

// deprecated. use imported lodash debounce instead
export function debounce(fn, time) {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, time);
  };
}

export const defaultUserPhoto = DefaultProfileImg;

export function defaultEventPhoto(category) {
  if (category) {
    category = category.toLowerCase();
    if (category === 'cycle-mtb') return eventCoverPhotos.cycle;
    else if (category === 'functional-fitness')
      return eventCoverPhotos.functional;
    else if (category === 'hike-ruck') return eventCoverPhotos.hike;
    else if (category === 'meeting') return eventCoverPhotos.meeting;
    else if (category === 'ocr') return eventCoverPhotos.ocr;
    else if (category === 'other-physical') return eventCoverPhotos.other;
    else if (category === 'rock-climbing') return eventCoverPhotos.rock;
    else if (category === 'run-walk') return eventCoverPhotos.run;
    else if (category === 'service') return eventCoverPhotos.service;
    else if (category === 'social') return eventCoverPhotos.social;
    else if (category === 'swim') return eventCoverPhotos.swimming;
    else if (category === 'team-sports') return eventCoverPhotos.team;
    else if (category === 'training') return eventCoverPhotos.training;
    else if (category === 'triathlon') return eventCoverPhotos.triathlon;
    else if (category === 'water-sports') return eventCoverPhotos.water;
    else if (category === 'winter-sports') return eventCoverPhotos.winter;
    else if (category === 'yoga') return eventCoverPhotos.yoga;
    else if (category === 'virtual') return eventCoverPhotos.virtual;
  }
}

export function mergeAttendees(eventAttendees) {
  let totalCount = 0;
  if (eventAttendees) {
    const { checked_in, going, interested } = eventAttendees;
    const mergedAttendees = [
      ...interested.attendees,
      ...going.attendees,
      ...checked_in.attendees,
    ].slice(0, 10);
    totalCount =
      +checked_in.total_count + +going.total_count + +interested.total_count;
    return { mergedAttendees, totalCount };
  } else {
    const mergedAttendees = [];
    return { mergedAttendees, totalCount };
  }
}

export function promiseTimeout(time) {
  (result) => new Promise((resolve) => setTimeout(resolve, time, result));
}

export function generateYears() {
  let currentYear = new Date().getFullYear();
  let endYear = currentYear - 81;
  let years = [];
  for (let i = currentYear; i > endYear; i--) {
    years.push(i.toString());
  }
  return years;
}

export function localizeTime(isVirtual, timeZoneID, time) {
  let adjustedTime;
  if (isVirtual || timeZoneID) {
    adjustedTime = moment.utc(time);
    adjustedTime = getOffsetTime(adjustedTime, timeZoneID || 'America/New_York');
  }
  else {
    adjustedTime = moment(time);
  }
  return adjustedTime;
}

export function localizeDate(isVirtual, timeZoneID, date) {
  let adjustedDate;
  if (isVirtual) {
    adjustedDate = moment.utc(date).tz('America/New_York');
    adjustedDate = getOffsetTime(adjustedDate, 'America/New_York');
  }
  else if (timeZoneID) {
    adjustedDate = moment.utc(date).tz(timeZoneID);
    adjustedDate = getOffsetTime(adjustedDate, timeZoneID);
  }
  else {
    adjustedDate = moment(date);
  };
  return adjustedDate;
}


// localizing time all together modifies the date
// assume that all events take place in one day
export function localizeEventTimesFormatted(date, startTime, endTime) {
  const formattedStartHours = moment(`${date} ${startTime}`).utc().format('HH:mm:ss');
  const formattedEndHours = moment(`${date} ${endTime}`).utc().format('HH:mm:ss');
  const formattedStartDate = moment(`${date} ${startTime}`).utc().format('YYYY-MM-DD');
  const formattedEndDate = moment(`${date} ${endTime}`).utc().format('YYYY-MM-DD');
  return {formattedStartDate, formattedEndDate, formattedStartHours, formattedEndHours};
}

export function formatPostTitle(title, verb) {
  // when there is an event name for event posts, the title is an object we do not want
  if (typeof title === 'object' && title !== null) return '\u25B6\uFE0E';
  if (title && title.includes('interested')) title += ' in';
  else if (title && title.includes('going')) title += ' to';
  // case of loading a single event from notifications
  else if (!title && verb)
    if (verb === 'checked_in') return ' checked in to';
    else if (verb === 'going') return ' is going to';
    else if (verb === 'interested') return ' is interested in';
    else return '\u25B6\uFE0E'; //posts have no title but the verb create
  return title;
}

  // only return users who did not have their name partially deleted and did not have the "@" sign removed
export function validTaggedUsers(taggedUsers, text) {
  let validIDs = [];
  for (let i = 0; i < taggedUsers.length; i++) {
    let user = taggedUsers[i];
    if (user.name === undefined && user.first_name && user.last_name) {
      user.name = `${user.first_name} ${user.last_name}`;
    }
    if (text.includes(`@${user.name}`))
      validIDs.push(user.id);
  }
  return validIDs;
};

export function capitalizeFirstLetter(word) {
  return `${word.slice(0,1).toUpperCase()}${word.slice(1,word.length)}`;
}

// version numbers are always X.Y.Z
// if the version is less than the required version, the front end will send the user through the appropriate onboarding process
// at the end of that onboarding process, the version will be updated
export function isUpdateNeeded(curVersion, checkedVersion) {
  let splitCurVersion = curVersion.split('.');
  let splitCheckedVersion = checkedVersion.split('.');
  for (let i = 0; i < splitCurVersion.length; i++) {
    if (parseInt(splitCurVersion[i]) < parseInt(splitCheckedVersion[i])) return true;
    else if (parseInt(splitCurVersion[i]) > parseInt(splitCheckedVersion[i])) return false;
  }
  return false;
}

export function isMilitaryAddress(address, city, state) {
  const militaryOffices = ['APO', 'DPO', 'FPO'];
  let isMilitaryAddress = false;

  address = address.toUpperCase();
  city = city.toUpperCase();
  state = state.toUpperCase();

  // Generally APO/DPO/FPO is put manually in the city field, but also check state field
  if (militaryOffices.includes(city) || militaryOffices.includes(state)) isMilitaryAddress = true;
  // on the offchance the user puts it in the street address
  else {
    const splitAddress = address.split(" ");
    for (let i = 0; i < splitAddress.length; i++) {
      if (militaryOffices.includes(splitAddress[i])) {
        isMilitaryAddress = true;
        break;
      }
    }
  }
  return isMilitaryAddress;
}

export function ordinalIndicator(number) {
  if (number === undefined) return '';
  let num = number.toString();
  let indicator;
  const lastValue = num.slice(-1);
  if (lastValue === '1') indicator = 'st';
  else if (lastValue === '2') indicator = 'nd';
  else if (lastValue === '3') indicator = 'rd';
  else indicator = 'th';
  return `${number}${indicator}`;
}

export function getPercentage(value, maximum) {
  let percentage = ((value / maximum) * 100);
  if (percentage > 100) percentage = 100;
  return percentage.toString().concat('%');
}

// used for attendees preview
export function putUserFirst(users, joined) {
  if (!joined) return users;
  const userProf = userProfile.getUserProfile();
  const currentUser = users.find((user) => user.id === userProf.id);
  // the user is in the returned amount, place them in front
  if (currentUser) {
    users = users.filter((user) => user.id !== userProf.id);
    return [currentUser, ...users];
  }
  // the user has joined but is not found in the list, place them in front
  else return [userProf, ...users];
}

// event/group feeds are followed and will otherwise show up in following
export function isValidFollowing(item) {
  return !item.target_id.includes('event') && !item.target_id.includes('group');
}
