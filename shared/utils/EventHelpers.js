import moment from 'moment';
import {EVENT_TAB_TYPES, GROUP_EVENT_TAB_TYPES} from '../constants/EventTabs';
import {userLocation} from '../models/UserLocation';
import {userProfile} from '../models/UserProfile';
import { localizeDate, localizeTime } from './Helpers';

export function isCreateEventButtonVisible(groupName, activeTab, isLoading, createVisible, user, groupType, isAdmin, joinedGrouped, challengeId) {
  let isVisible = true;
  // group event list
  if (groupName) {
    if (activeTab === GROUP_EVENT_TAB_TYPES.past) isVisible = false;
    if (!joinedGrouped) isVisible = false;
    // chapter groups
    if (groupType === 'chapter') {
      // user is not an eagle leader, or lacks the admin membership role
      if (activeTab === GROUP_EVENT_TAB_TYPES.local && (!user.eagle_leader && !isAdmin)) isVisible = false;
      // user lacks the admin membership role
      else if (activeTab === GROUP_EVENT_TAB_TYPES.virtual && !isAdmin) isVisible = false;
    }
    else if (groupType === 'activity') {
      // user lacks the admin membership role
      if (!isAdmin) isVisible = false;
    }
    else if (groupType === 'sponsor') {
      // user lacks the admin membership role
      if (!isAdmin) isVisible = false;
    }
  }
  // event tab events list
  else {
    if (activeTab === EVENT_TAB_TYPES.virtual) isVisible = false;
  }
  if (isLoading || createVisible || user.anonymous_profile || challengeId) isVisible = false;
  return isVisible;
};

export function localeFormatter(lastLocale, lastCity) {
  const DEFAULT_LOCALE = 'Everywhere';
  let locale = '';
  let displayCity = '';
  if (!lastLocale) {
    let {city, state, zip} = userLocation.getUserLocation();
    if (city || state || zip) {
      if (zip) {
        locale += `${zip.slice(0, 5)}`;
      }
      if (city) {
        locale += ` ${city}`;
      }
      if ((city && state) || (zip && state && !city)) {
        locale += `,`;
      }
      if (state) {
        locale += ` ${state}`;
      }
      if (city) displayCity = city;
    } else {
      let {zip, city, address_state} = userProfile.getUserProfile().location;

      if (zip) {
        locale += `${zip.slice(0, 5)}`;
      }
      if (city) {
        locale += ` ${city}`;
      }
      if ((city && address_state) || (zip && address_state && !city)) {
        locale += `,`;
      }
      if (address_state) {
        locale += ` ${address_state}`;
      }
      if (city) displayCity = city;
      locale = locale.trim();
    }
    if (locale === '') {
      locale = DEFAULT_LOCALE;
    }
  } else {
    locale = lastLocale;
    displayCity = lastCity;
  }
  return {locale, displayCity};
}

export function getAllDayEventTimes(date) {;
  const startOfDay = moment(date).startOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
  const endOfDay = moment(date).endOf('day').utc().format('YYYY-MM-DD HH:mm:ss');
  return {startOfDay, endOfDay};
}

export function isEventOver(eventData) {
  const today = moment();
  const eventDate = localizeDate(
    eventData.is_virtual,
    eventData.time_zone_id,
    eventData.end,
  );
  return today.isAfter(eventDate);
}

export function formatDateAndTimes(event) {
  const {is_virtual, time_zone_id, is_all_day, start, end} = event;
  let startTime = localizeTime(is_virtual, time_zone_id, start);
  let endTime = localizeTime(is_virtual, time_zone_id, end);
  let startTimeUnformatted;
  let endTimeUnformatted;
  let date;
  if (is_virtual || time_zone_id) {
    date = startTime.format('YYYY-MM-DD');
    startTimeUnformatted = startTime.format('HH:mm:ss');
    endTimeUnformatted = endTime.format('HH:mm:ss');
  }
  // For old (and currently salesforce events) without time_zone_id
  else {
    date = event.start.split(' ')[0]; //retrieve the data (YYYY-MM-DD) from the start time
    startTimeUnformatted = event.start.split(' ')[1];
    endTimeUnformatted = event.end.split(' ')[1];
  }
  let todayTime = moment();
  const localOffset = todayTime.utcOffset();
  let compareDate;
  // Even after localizing the start time, the moment object has it saved as a UTC time
  // this means that when we do a comparison with it, additional time will be added/subtracted.
  // That could modify the date which affects checking in and allow early check in.
  // To compensate for how moment works, we add (subtract the negative) minute offset for local time
  if (is_all_day && localOffset < 0)
    compareDate = moment(startTime).subtract(localOffset, 'minutes');
  else compareDate = startTime;
  return {startTime, endTime, startTimeUnformatted, endTimeUnformatted, compareDate, date, todayTime};
}
