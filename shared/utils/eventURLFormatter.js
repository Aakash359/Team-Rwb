import googleAPI from '../apis/googleAPI';
import {
  DISTANCE_OPTIONS,
  EVENT_OPTIONS,
  GROUP_OPTIONS,
  VIRTUAL_EVENT_OPTIONS,
  VIRTUAL_GROUP_OPTIONS,
} from '../constants/EventFilters';
import {generateFilteredTime} from './Helpers';
import {
  CHALLENGE_EVENT_TAB_TYPES,
  EVENT_TAB_TYPES,
  GROUP_EVENT_TAB_TYPES,
  MY_EVENT_TYPES,
  PAST_EVENT_TYPES,
} from '../constants/EventTabs';
import moment from 'moment';
import {DEFAULT_VIRTUAL_OPTIONS} from '../constants/DefaultFilters';

const DEFAULT_LOCALE = 'Everywhere';
const NO_SAVED_LOCATION_ERROR =
  'Unable to find a location for this account. Please update your address in "Personal Information".';
const NO_CHAPTER_ERROR =
  'Unable to find a chapter for this account. Please update your address in "Preferred Chapter".';
const GOOGLE_API_ERROR =
  'Unable to find the coordinates of that location. Please try again with a different location.';

// this returns a promise with a reject on cases there was an error loading something in and resolves otherwise
// the prime reason this is a promise is due to the usage of googleAPI and keeping behavior consistent
const eventURLFormatter = (state, user) => {
  let {
    locale,
    eventDistance,
    eventCategory,
    eventDate,
    search,
    page,
    sortBy,
    lat,
    long,
    activeTab,
    activeMyEventsType,
    activePastEventType,
    virtualSubtype,
    groupId,
    eventGroupOption,
    eventFilterNavTab,
    virtualTime,
    challengeId,
  } = state;

  if (
    !Object.values(EVENT_TAB_TYPES).includes(activeTab) &&
    !Object.values(GROUP_EVENT_TAB_TYPES)
  )
    throw new Error(
      `Expecting type "local", "virtual", "my", or "past for activeTab. Received ${activeTab}`,
    );
  // if no locale or locale is set to "everywher", try and get a useble locale for the google api lookup
  if (!locale || locale === DEFAULT_LOCALE) {
    let {zip, city, address_state} = user.location;
    // when registering a user, if there is a SF sync issue which prevents location from being saved
    // no results can be found and there would be an infinite spinner. Alert users if that is the case.
    if (!zip || !city || !address_state) {
      return new Promise((resolve, reject) => {
        reject(NO_SAVED_LOCATION_ERROR);
      });
    } else locale = `${zip.slice(0, 5)} ${city}, ${address_state}`;
  }

  let user_chapter = user.preferred_chapter.hasOwnProperty('id')
    ? user.preferred_chapter.id
    : user.anchor_chapter.id;

  if (!user_chapter) {
    return new Promise((resolve, reject) => {
      reject(NO_CHAPTER_ERROR);
    });
  }

  let urlParams = [];
  // common parameters to all types
  urlParams.push(`page=${page}`);
  const localSearchingGroups =
    eventFilterNavTab === 'group' && activeTab == 'local';
  if (search) urlParams.push(`search=${encodeURIComponent(search)}`);
  if (groupId) urlParams.push(`chapter_id=${groupId}`); //backend expects old filter chapter_id
  if (challengeId) urlParams.push(`challenge_id=${challengeId}`);
  if (eventCategory && eventCategory !== 'all-activities')
    urlParams.push(`category=${EVENT_OPTIONS[eventCategory].slug}`);
  if (eventGroupOption) {
    if (localSearchingGroups)
      urlParams.push(`group_filter=${GROUP_OPTIONS[eventGroupOption].slug}`);
    else if (activeTab === 'virtual') {
      // if the default is not properly set to national on the event page, search national here to avoid crash
      // this is for alpha testers who had old filters saved to their device
      if (!(eventGroupOption in VIRTUAL_GROUP_OPTIONS))
        eventGroupOption = 'national';
      urlParams.push(
        `group_filter=${VIRTUAL_GROUP_OPTIONS[eventGroupOption].slug}`,
      );
    }
  }
  if (eventFilterNavTab && eventFilterNavTab === 'member' && !groupId)
    urlParams.push('chapter_id=0'); // sending chapter_id=0 retrieves all member events
  // search on a specific group event page
  if (groupId !== null && groupId !== undefined)
    urlParams.push('chapter_hosted=true');
  else {
    // only the local event filters has the option to only be groups or only be members
    if (localSearchingGroups) urlParams.push('chapter_hosted=true');
    else if (activeTab === 'local' && eventFilterNavTab === 'member')
      urlParams.push('chapter_hosted=false');
  }
  if (
    activeTab === 'virtual' &&
    virtualTime !== DEFAULT_VIRTUAL_OPTIONS.virtualTime
  )
    urlParams.push(`is_all_day=${virtualTime === 'all-day' ? true : false}`);

  // type-specific parameters
  if (activeTab === EVENT_TAB_TYPES.my) {
    if (!Object.values(MY_EVENT_TYPES).includes(activeMyEventsType))
      throw new Error(
        'Expecting type "hosting", "upcoming", or "past" for my event tab',
      );

    const dateNowString = moment().toISOString();

    urlParams.push(`sort=date`);
    if (activeMyEventsType === MY_EVENT_TYPES.hosting) {
      urlParams.push(`host_id=${user.id}`);
      urlParams.push(`sort_order=desc`);
    } else if (activeMyEventsType === MY_EVENT_TYPES.upcoming) {
      urlParams.push(`after=${dateNowString}`);
      urlParams.push(`sort_order=asc`);
      urlParams.push(`attendee=${user.id}`);
    } else if (activeMyEventsType === MY_EVENT_TYPES.past) {
      urlParams.push(`before=${dateNowString}`);
      urlParams.push(`sort_order=desc`);
      urlParams.push(`attendee=${user.id}`);
    }
    urlParams = urlParams.join('&');
    return new Promise((resolve) => {
      resolve({urlParams, state});
    });
  }
  // this is shared by group event list and challenge events list
  else if (
    activeTab === GROUP_EVENT_TAB_TYPES.past ||
    activeTab === CHALLENGE_EVENT_TAB_TYPES.past
  ) {
    const dateNowString = moment().toISOString();
    urlParams.push(`sort=date`);
    urlParams.push(`before=${dateNowString}`);
    urlParams.push(`sort_order=desc`);
    urlParams.push(`sort=date`);
    if (activePastEventType === PAST_EVENT_TYPES.local) {
      urlParams.push('is_virtual=false');
    } else if (activePastEventType === PAST_EVENT_TYPES.virtual) {
      urlParams.push('is_virtual=true');
    }
    urlParams = urlParams.join('&');
    return new Promise((resolve) => {
      resolve({urlParams, state});
    });
  } else {
    // Determine if this used/needed on the web
    state.distanceSliderValue = distanceSliderHandler(eventDistance);

    if (activeTab === EVENT_TAB_TYPES.local) urlParams.push('is_virtual=false');

    const dateFilter = generateFilteredTime(eventDate);

    if (dateFilter) urlParams.push(dateFilter);

    urlParams.push(
      `sort=${sortBy}&sort_order=${
        sortBy === 'date' && eventDate !== 'past-30' ? 'asc' : 'desc'
      }`,
    );

    if (activeTab === EVENT_TAB_TYPES.virtual) {
      urlParams.push('is_virtual=true');
      if (virtualSubtype !== VIRTUAL_EVENT_OPTIONS.all.slug)
        urlParams.push(`virtual_event_category=${virtualSubtype}`);

      // virtual events do not require a location/distance
      return new Promise((resolve) => {
        urlParams = urlParams.join('&');
        resolve({urlParams, state});
      });
    } else if (DISTANCE_OPTIONS[eventDistance].slug && lat && long) {
      if (!groupId) {
        urlParams.push(
          `distance=${DISTANCE_OPTIONS[eventDistance].slug}&lat=${lat}&long=${long}`,
        );
      }
      return new Promise((resolve) => {
        urlParams = urlParams.join('&');
        resolve({urlParams, state});
      });
    } else if (
      DISTANCE_OPTIONS[eventDistance].slug &&
      locale &&
      (!lat || !long)
    ) {
      return new Promise((resolve, reject) => {
        return googleAPI
          .geocode(locale)
          .then((result) => {
            if (!groupId) {
              const lat = result.results[0].geometry.location.lat;
              const long = result.results[0].geometry.location.lng;
              // return lat,long in state to avoid unncessary google api calls
              state.lat = lat;
              state.long = long;
              urlParams.push(
                `distance=${DISTANCE_OPTIONS[eventDistance].slug}&lat=${lat}&long=${long}`,
              );
            }
            urlParams = urlParams.join('&');
            resolve({urlParams, state});
          })
          .catch((err) => {
            reject(GOOGLE_API_ERROR);
          });
      });
    }
  }
};

// determines the visual aspects of the slider for local events
function distanceSliderHandler(eventDistance) {
  if (eventDistance === '25-miles') {
    return 25;
  } else if (eventDistance === '50-miles') {
    return 100;
  } else if (eventDistance === '100-miles') {
    return 175;
  } else {
    return 250;
  }
}

export {eventURLFormatter};
