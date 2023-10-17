import React, {useState} from 'react';
import styles from './CreateEvent.module.css';
import {IoIosCloseCircle as RemoveIcon} from 'react-icons/io';
import moment from 'moment';
import {
  Toolbar,
  IconButton,
  Button,
  makeStyles,
  Paper,
} from '@material-ui/core';
import CustomModal from './CustomModal';
import Loading from '../Loading';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {rwbApi} from '../../../../shared/apis/api';
import {userProfile} from '../../../../shared/models/UserProfile';
import {EVENT_OPTIONS} from '../../../../shared/constants/EventFilters';
import {
  validURL,
  debounce,
  extractAddressComponent,
  isNullOrEmpty,
} from '../../../../shared/utils/Helpers';
import {getAllDayEventTimes} from '../../../../shared/utils/EventHelpers';
import EventLinkInput from './EventLinkInput';
import SearchGooglePlaces from '../SearchGooglePlaces';
import PlacesList from './PlacesList';
import googleAPI from '../../../../shared/apis/googleAPI';
import InvitedUsersSearchList from './InvitedUsersSearchList';
import TextArea from '../TextArea';
import ChapterEventUserCard from './ChapterEventUserCard';
import imageHandler from '../ImageHandler';
import {
  EXECUTION_STATUS,
  logCreateEvent,
  logEventCoverPhoto,
  logUpdateEvent,
} from '../../../../shared/models/Analytics';
import {userLocation} from '../../../../shared/models/UserLocation';
import {
  getLatLng,
  geocodeByAddress,
} from '../../react-places-autocomplete/dist/utils';
import ReusableTabs from '../ReusableTabs';
import {CREATE_EVENT_NAV_ELEMENTS} from '../../../../shared/constants/EventTabs';
import ToggleSwitch from '../ToggleSwitch';
//svgs
import XIcon from '../svgs/XIcon';
import CalenderIcon from '../svgs/CalenderIcon';
import ClockIcon from '../svgs/ClockIcon';
import LocationIcon from '../svgs/LocationIcon';
import ActivityIcon from '../svgs/ActivityIcon';
import LinksIcon from '../svgs/LinksIcon';
import GalleryIcon from '../svgs/GalleryIcon';
import CheckIcon from '../svgs/CheckIcon';

const EVENT_STATUS = {
  canceled: 'Canceled',
  completed: 'Completed',
  in_progress: 'In Progress',
};

const LINK_CHAR_LIMIT = 40;
const DESCRIPTION_CHAR_LIMIT = 3000;

const CreateEvent = ({
  closeModalHandlers,
  setCreateEventChoices,
  groupId,
  challengeId,
  groupName,
  groupType,
  selectedTab,
  eventData,
  refreshEvents,
  isAdmin,
  isVirtual,
  virtualCategory,
}) => {
  let utcStartTime;
  let utcEndTime;
  let utcDate;
  // this is to ensure copying to avoid mutations and cause issues elsewhere
  let eventCategories = {...EVENT_OPTIONS};
  delete eventCategories['all-activities'];
  if (eventData) {
    utcDate = moment.utc(eventData.start);
    utcStartTime = moment.utc(eventData.start);
    utcEndTime = moment.utc(eventData.end);
  }

  const [eventId, setEventId] = useState(eventData?.id || null);
  const [hostUserId, setHostUserId] = useState(eventData?.host.id || null);
  const [address, setAddress] = useState(eventData?.location.address || '');
  const [addressError, setAddressError] = useState(null);
  const [city, setCity] = useState(eventData?.location?.city || '');
  const [zip, setZip] = useState(eventData?.location?.zip || '');
  const [addressState, setAddressState] = useState(
    eventData?.location?.state || '',
  );
  const [country, setCountry] = useState(eventData?.location?.country || '');
  const [latitude, setLatitude] = useState(
    eventData?.location.latitude || null,
  );
  const [longitude, setLongitude] = useState(
    eventData?.location.longitude || null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [eventTitle, setEventTitle] = useState(eventData?.name || '');
  const [eventTitleError, setEventTitleError] = useState(null);
  const [isAllDayEvent, setIsAllDayEvent] = useState(
    eventData?.is_all_day || false,
  );
  const [date, setDate] = useState(
    eventData ? utcDate : moment(new Date()).utc(),
  );
  const [startTime, setStartTime] = useState(eventData ? utcStartTime : null);
  const [startTimeError, setStartTimeError] = useState(null);
  const [endTime, setEndTime] = useState(eventData ? utcEndTime : null);
  const [endTimeError, setEndTimeError] = useState(null);
  const [locationSearchInput, setLocationSearchInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  // set on error state for event lookup. This is currently just used for no results
  const [locationError, setLocationError] = useState(null);
  const [eventImage, setEventImage] = useState(eventData?.photo_url || null);
  const [eventImageFile, setEventImageFile] = useState(
    eventData?.photo_url || null,
  );
  const [linksClicked, setLinksClicked] = useState(!!eventData?.links);
  const [linkText1, setLinkText1] = useState(eventData?.links?.[0]?.text || '');
  const [linkURL1, setLinkURL1] = useState(eventData?.links?.[0]?.url || '');
  const [linkText1Error, setLinkText1Error] = useState(null);
  const [linkURL1Error, setLinkURL1Error] = useState(null);
  const [linkText2, setLinkText2] = useState(eventData?.links?.[1]?.text || '');
  const [linkURL2, setLinkURL2] = useState(eventData?.links?.[1]?.url || '');
  const [linkText2Error, setLinkText2Error] = useState(null);
  const [linkURL2Error, setLinkURL2Error] = useState(null);
  const [eventDescription, setEventDescription] = useState(
    eventData?.description || '',
  );
  const [eventDescriptionError, setEventDescriptionError] = useState(null);
  const [invitedUsersInputValue, setInvitedUsersInputValue] = useState('');
  const [invitedUsersSearchList, setInvitedUsersSearchList] = useState([]);
  const [invitedUsersNames, setInvitedUsersName] = useState([]);
  const [invitedUsersIDs, setInvitedUsersIDs] = useState([]);
  const [eventActivityModalIsOpen, setEventActivityModalIsOpen] = useState(
    false,
  );
  const [
    eventActivityModalSelectedValue,
    setEventActivityModalSelectedValue,
  ] = useState(eventData?.category || null);
  const [
    eventActivityModalSelectedValueError,
    setEventActivityModalSelectedValueError,
  ] = useState(null);
  const [activeTab, setActiveTab] = useState(
    eventData?.is_virtual ? 1 : selectedTab,
  );
  const handleActiveTab = (index) => {
    // local
    if (index === 0) setVirtualEventCategory(null);
    else setVirtualEventCategory('workouts');
    setActiveTab(index);
    setIsAllDayEvent(false);
  };
  const eventActivityModalHandler = () =>
    setEventActivityModalIsOpen((prevState) => !prevState);

  const eventActivityModalSelectHandler = (value) =>
    setEventActivityModalSelectedValue(value || 'all-activities');
  const [virtualEventCategory, setVirtualEventCategory] = useState(
    eventData?.virtual_event_category
      ? eventData.virtual_event_category
      : isVirtual
      ? 'workouts'
      : null,
  );

  const useStyles = makeStyles(() => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: '15px',
      color: 'var(--white)',
    },
    title: {
      color: 'var(--white)',
      textTransform: 'capitalize',
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      backgroundColor: 'var(--magenta)',
      height: 64,
    },
    button: {
      color: 'white',
      textTransform: 'capitalize',
      fontWeight: 'bold',
    },
  }));
  const classes = useStyles();

  const eventTitleHandler = (e) => setEventTitle(e.target.value);
  // keep the start time and date together so that the days adjust appropriately
  const handleTimeDateChange = (time) => {
    // wrap the localized time in a moment object
    let momentDate = moment(date.toDate());
    let momentTime = moment(time.toDate());
    // format the date and time separately as they can have invalid values from the picker
    let mDateFormatted = momentDate.format('YYYY-MM-DD');
    let mTimeFormatted = momentTime.format('HH:mm:ss');
    // combine them and format it to send
    return moment(`${mDateFormatted} ${mTimeFormatted}`)
      .utc()
      .format('YYYY-MM-DD HH:mm:ss');
  };
  const convertToUTC = (time) => moment.utc(time.toISOString());
  const handleDateChange = (date) => setDate(convertToUTC(date));
  const handleStartTime = (time) => setStartTime(convertToUTC(time));
  const handleEndTime = (time) => setEndTime(convertToUTC(time));
  const eventDescriptionHandler = (desc) => setEventDescription(desc);

  const clearErrors = () => {
    setEventTitleError(null);
    setEndTimeError(null);
    setStartTimeError(null);
    setAddressError(null);
    setEventActivityModalSelectedValueError(null);
    setLinkText1Error(null);
    setLinkText2Error(null);
    setLinkURL1Error(null);
    setLinkURL2Error(null);
    setEventDescriptionError(null);
  };

  const hasErrors = () => {
    let hasError = false;
    clearErrors();

    const isVirtual = groupId !== null && activeTab === 1;

    const CHAR_LIMIT_WARNING_LINK = `EXCEEDED ${LINK_CHAR_LIMIT} CHARACTER LIMIT`;
    const CHAR_LIMIT_WARNING_DESC = `EXCEEDED ${DESCRIPTION_CHAR_LIMIT} CHARACTER LIMIT`;
    const MISSING_TEXT_WARNING = 'MISSING TEXT FOR LINK';
    const MISSING_LINK_WARNING = 'MISSING LINK FOR TEXT';
    const INVALID_URL_WARNING = 'INVALID URL (example: https://teamrwb.org)';
    const INVALID_END_TIME = 'MUST BE AFTER START TIME';
    const MISSING_FIELD = 'THIS FIELD IS REQUIRED';

    if (linkURL1) {
      if (!linkText1) {
        setLinkText1Error(MISSING_TEXT_WARNING);
        hasError = true;
      }
      if (!validURL(linkURL1)) {
        setLinkURL1Error(INVALID_URL_WARNING);
        hasError = true;
      }
    }
    if (linkText1) {
      if (linkText1.length > LINK_CHAR_LIMIT) {
        setLinkText1Error(CHAR_LIMIT_WARNING_LINK);
        hasError = true;
      }
      if (!linkURL1) {
        setLinkURL1Error(MISSING_LINK_WARNING);
        hasError = true;
      }
    }
    if (linkURL2) {
      if (!linkText2) {
        setLinkText1Error(MISSING_TEXT_WARNING);
        hasError = true;
      }
      if (!validURL(linkURL2)) {
        setLinkURL2Error(INVALID_URL_WARNING);
        hasError = true;
      }
    }
    if (linkText2) {
      if (linkText2.length > LINK_CHAR_LIMIT) {
        setLinkText2Error(CHAR_LIMIT_WARNING_LINK);
        hasError = true;
      }
      if (!linkURL2) {
        setLinkURL2Error(MISSING_LINK_WARNING);
        hasError = true;
      }
    }
    if (eventDescription.length > DESCRIPTION_CHAR_LIMIT) {
      setEventDescriptionError(CHAR_LIMIT_WARNING_DESC);
      hasError = true;
    }
    if (isNullOrEmpty(eventTitle)) {
      setEventTitleError(MISSING_FIELD);
      hasError = true;
    }
    if (isNullOrEmpty(eventDescription)) {
      setEventDescriptionError(MISSING_FIELD);
      hasError = true;
    }
    if (!eventActivityModalSelectedValue) {
      setEventActivityModalSelectedValueError(MISSING_FIELD);
      hasError = true;
    }
    if (!isVirtual && isNullOrEmpty(address)) {
      setAddressError(MISSING_FIELD);
      hasError = true;
    }
    let momentEndTime = moment(endTime);
    let momentStartTime = moment(startTime);
    if (momentEndTime.isSameOrBefore(momentStartTime)) {
      setEndTimeError(INVALID_END_TIME);
      hasError = true;
    }
    if (!endTime && !isAllDayEvent) {
      setEndTimeError(MISSING_FIELD);
      hasError = true;
    }
    if (!startTime && !isAllDayEvent) {
      setStartTimeError(MISSING_FIELD);
      hasError = true;
    }
    return hasError;
  };

  const createEventHandler = () => {
    if (hasErrors()) return false;

    setIsLoading(true);
    // if not virtual
    if (activeTab != 1) {
      const convertedDate = new Date(date).toISOString().substring(0, 10);
      const convertedStartTime = startTime.toString().substring(16, 24);
      const eventDateTime = moment(`${convertedDate} ${convertedStartTime}`);
      googleAPI
        .timezone(latitude, longitude, eventDateTime.unix())
        .then((response) =>
          formatPayload(response.timeZoneId, response.timeZoneName),
        );
    } else formatPayload();
  };

  const formatPayload = async (timeZoneId, timeZoneName) => {
    const user = userProfile.getUserProfile();
    let links = [];
    if (linkText1 && linkURL1) {
      links.push({text: linkText1, url: linkURL1});
    }
    if (linkText2 && linkURL2) {
      links.push({text: linkText2, url: linkURL2});
    }
    // date is already a moment object, use just the string to be formatted into a utc moment object
    const dateString = date.format('YYYY-MM-DD');
    let eventStartTime;
    let eventEndTime;
    // SF times are not the set times in the app, keep the time if updating an event
    if (isAllDayEvent && !eventId) {
      const allDayTimes = getAllDayEventTimes(dateString);
      eventStartTime = allDayTimes.startOfDay;
      eventEndTime = allDayTimes.endOfDay;
    } else {
      eventStartTime = handleTimeDateChange(startTime);
      eventEndTime = handleTimeDateChange(endTime);
    }

    const isVirtual = groupId !== null && activeTab === 1; // need to check for the groupId, otherwise creating event from My Events tab will result as virtual
    const payload = {
      name: eventTitle.slice(0, 68), // event title needs to be limited to 68 characters for SF sync
      creator: user.id,
      host: hostUserId || user.id,
      category: eventActivityModalSelectedValue,
      description: eventDescription,
      start: eventStartTime,
      end: eventEndTime,
      status: EVENT_STATUS.in_progress,
      chapter_id: groupId || 0, // // backend stores it as chapter_id to match old convention
      chapter_hosted: groupId ? true : false,
      photo_url: eventImage,
      links,
      tagged: invitedUsersIDs,
      location: {
        latitude: isVirtual ? 0 : latitude.toString(),
        longitude: isVirtual ? 0 : longitude.toString(),
        address: isVirtual ? null : address,
        city: isVirtual ? null : city,
        state: isVirtual ? null : addressState,
        zip: isVirtual ? null : zip,
        country: isVirtual ? null : country,
      },
      is_virtual: isVirtual,
      is_all_day: isAllDayEvent,
      virtual_event_category: virtualEventCategory,
    };
    // off chance of updating virtual events, do not update
    if (timeZoneId && timeZoneName) {
      payload.time_zone_id = timeZoneId;
      payload.time_zone_name = timeZoneName;
    }
    let imageData = null;
    // do not try and make an imageData object if we already have a photo as a url
    if (eventImage && typeof eventImage !== 'string') {
      imageData = {
        media_filename: 'eventCoverPhoto',
        media_intent: 'event',
      };
    }
    if (!imageData) {
      uploadEvent(payload);
    } else {
      imageHandler(eventImage, 'event')
        .then((result) => {
          payload.photo_url = result;
          uploadEvent(payload);
        })
        .catch((error) => {
          setIsLoading(false);
          alert('Team RWB: Error uploading event image');
        });
    }
  };

  const uploadEvent = (payload) => {
    if (eventId) {
      let analyticsObj = {
        activity_sub_type: payload.category,
        event_record_type: payload.is_virtual ? 'virtual' : 'event',
        event_id: `${eventData.id}`,
        challenge_id: challengeId !== 0 ? `${challengeId}` : null,
        group_id: payload.chapter_hosted ? `${payload.chapter_id}` : null,
        has_image: !isNullOrEmpty(eventData.photo_url),
      };
      return rwbApi
        .putEvent(eventId, JSON.stringify(payload))
        .then(() => {
          if (eventData?.photo_url !== payload.photo_url) {
            analyticsObj.execution_status = EXECUTION_STATUS.success;
            logEventCoverPhoto(analyticsObj);
          }
          logUpdateEvent();
          if (refreshEvents) refreshEvents();
        })
        .catch((error) => {
          if (eventData?.photo_url !== payload.photo_url) {
            analyticsObj.execution_status = EXECUTION_STATUS.failure;
            logEventCoverPhoto(analyticsObj);
          }
          console.warn(error);
          alert('TeamRWB: Error uploading updated event to Team RWB Servers.');
        })
        .finally(() => {
          setIsLoading(false);
          closeModalHandlers();
        });
    } else {
      return rwbApi
        .postEvent(JSON.stringify(payload))
        .then(() => {
          logCreateEvent();
          // retrieving the feed after so the post is in existence and can be reacted to
          // (small delay to ensure stream gets the post)
          setTimeout(() => {
            if (refreshEvents) refreshEvents();
            return rwbApi.getUserFeed(userProfile.getUserProfile().id);
          }, 100);
        })
        .catch((error) => {
          console.warn(error);
          alert('TeamRWB: Error uploading event to Team RWB Servers.');
        })
        .finally(() => {
          setIsLoading(false);
          setCreateEventChoices(false);
          closeModalHandlers();
        });
    }
  };

  const addImageHandler = (e) => {
    const file = e.target.files[0];
    setEventImage(file); // this will be used for upload image on post

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setEventImageFile(reader.result); // preview image before upload
    };
  };

  const removeImageHandler = () => {
    setEventImage(null);
    setEventImageFile(null);
  };

  const linksHandler = () => setLinksClicked((prevState) => !prevState);

  const getSuggestionsHandler = (suggestions) => {
    setLocationSuggestions(suggestions);
    if (suggestions.length > 0) setLocationError(null);
  };

  const getSuggestionsDebounce = debounce(getSuggestionsHandler, 500);

  const selectLocationHandler = (address) => {
    geocodeByAddress(address).then((results) => {
      const addressComponents = results[0].address_components;
      const city = extractAddressComponent('locality', addressComponents)
        .long_name;
      const state = extractAddressComponent(
        'administrative_area_level_1',
        addressComponents,
      ).short_name;
      let zip = extractAddressComponent('postal_code', addressComponents);
      // not all locations have an associated zip
      if (zip) zip = zip.long_name;
      const country = extractAddressComponent('country', addressComponents)
        .short_name;
      getLatLng(results[0])
        .then((latLng) => {
          handleGoogleResponse({
            address,
            city,
            state,
            zip,
            country,
            lat: latLng.lat,
            long: latLng.lng,
          });
        })
        .catch(() => alert('Error with selecting the location.'));
    });
  };

  const addressFromLatLng = async (lat, lng) => {
    var geocoder = new window.google.maps.Geocoder();
    var OK = window.google.maps.GeocoderStatus.OK;

    var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
    return new Promise(function (resolve, reject) {
      geocoder.geocode({location: latlng}, function (results, status) {
        if (status !== OK) {
          reject(status);
        }
        resolve(results);
      });
    });
  };

  const selectCurrentLocationHandler = () => {
    try {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition((position) => {
        const {latitude, longitude} = position.coords;
        if (latitude && longitude) {
          addressFromLatLng(latitude, longitude).then((results) => {
            let match;
            for (let result of results) {
              if (
                result.types.includes('street_address') ||
                result.types.includes('establishment') ||
                result.types.includes('premise') ||
                result.types.includes('point_of_interest')
              ) {
                match = result;
              }
            }
            if (match?.formatted_address)
              selectLocationHandler(match.formatted_address);
            else {
              setIsLoading(false);
              window.alert('Team RWB: Location cannot be found.');
            }
          });
        } else {
          setIsLoading(false);
          window.alert('Team RWB: Location cannot be found.');
        }
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleGoogleResponse = (response) => {
    if (response) {
      setLocationSearchInput('');
      setIsLoading(false);

      clearEvents({
        lat: response.lat.toString(),
        long: response.long.toString(),
        address: response.address,
        city: response.city,
        state: response.state,
        zip: response.zip,
        country: response.country,
      });
    }
  };

  const clearEvents = (search_props) => {
    const {lat, long, address, city, state, zip, country} = search_props;
    setLatitude(lat);
    setLongitude(long);
    setAddress(address);
    setCity(city);
    setAddressState(state);
    setZip(zip);
    setCountry(country);
  };

  const invitedUsersHandler = (inviteUser) => {
    setInvitedUsersInputValue(inviteUser);
    rwbApi.searchUser(inviteUser).then((result) => {
      setInvitedUsersSearchList(result); //validate there is no already invited users
      scrollToTheBottom();
    });
  };

  const onInviteUserHandler = async (name) => {
    setInvitedUsersSearchList([]);
    setInvitedUsersInputValue('');
    const userId = await rwbApi.searchUser(name);
    setInvitedUsersName([...invitedUsersNames, name]);
    setInvitedUsersIDs([...invitedUsersIDs, userId[0]._source.id]);
  };

  const removeInvitedUserHandler = (removedUser) => {
    const leftUsers = invitedUsersNames.filter((user) => user !== removedUser);
    setInvitedUsersName(leftUsers);
  };

  const scrollToTheBottom = () => {
    const container = document.getElementById('createEventContainer');
    container.scrollTop = container.scrollHeight;
  };

  // TODO, expand upon this
  const handleLocationError = (err) => {
    // ReactPlacesAutocomplete has a very finicky loading state
    // in order to determine if it is done loading when there are zero results we check for the error instead
    if (err === 'ZERO_RESULTS') setLocationError('No Results Found');
  };
  const hasLocation = activeTab != 1;
  return (
    <div className={styles.container} id="createEventContainer">
      {isLoading && (
        <Loading size={100} color={'var(--white)'} loading={true} />
      )}

      <Paper className={classes.root}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            onClick={closeModalHandlers}
            className={classes.menuButton}
            color="inherit">
            <XIcon tintColor={'var(--white)'} />
          </IconButton>
          <div className={styles.titleContainer}>
            <p className="title">
              {groupName || groupId > 0
                ? 'Create Group Event'
                : userProfile.getUserProfile().eagle_leader
                ? 'Create NON-CHAPTER Event'
                : 'Create Event'}
            </p>
            {groupId !== 0 && groupId && (
              <p className="titleSubheader">{groupName}</p>
            )}
          </div>
          <Button
            color="inherit"
            className={classes.button}
            onClick={createEventHandler}>
            <CheckIcon tintColor={'var(--white)'} />
          </Button>
        </Toolbar>
      </Paper>
      <div className={styles.contentScroll}>
        <div className={styles.content}>
          {groupId !== 0 && groupId && isAdmin && (
            <ReusableTabs
              selectedValue={activeTab}
              values={CREATE_EVENT_NAV_ELEMENTS.map(({name}) => name)}
              onChangeHandler={handleActiveTab}
            />
          )}
          <input
            className={styles.titleInput}
            placeholder={`${eventTitle || 'enter title'}`}
            value={eventTitle}
            onChange={eventTitleHandler}
          />
          <p className="errorMessage">{eventTitleError}</p>
          {groupId !== 0 && groupId && (
            <>
              <div>
                <ChapterEventUserCard
                  title="Creator"
                  userDetails={userProfile.getUserProfile()}
                />
              </div>
              <div>
                <ChapterEventUserCard
                  title="Host"
                  userDetails={userProfile.getUserProfile()}
                  setHostUserId={setHostUserId}
                />
              </div>
            </>
          )}
          {activeTab === 1 && (
            <div className={styles.subtypeContainer}>
              <div
                className={`${styles.subtypeButton} ${
                  virtualEventCategory === 'workouts'
                    ? styles.activeSubtypeButton
                    : styles.unactiveSubtypeButton
                }`}
                onClick={() => setVirtualEventCategory('workouts')}>
                <p>Workout</p>
              </div>
              <div
                className={`${styles.subtypeButton} ${
                  virtualEventCategory === 'challenges'
                    ? styles.activeSubtypeButton
                    : styles.unactiveSubtypeButton
                }`}
                onClick={() => setVirtualEventCategory('challenges')}>
                <p>Challenge</p>
              </div>
            </div>
          )}

          <div className={styles.eventCreationFields}>
            <div className={styles.fullInlineContainer}>
              <div className={styles.item}>
                <CalenderIcon className={styles.icon} />
                <DatePicker
                  placeholderText="Pick a Date"
                  selected={date.toDate()}
                  minDate={moment().toDate()} //set the minimum date to today
                  onChange={handleDateChange}
                />
              </div>
              {activeTab === 1 && (
                // Virtual tab
                <div className={styles.allDayEventContainer}>
                  <p className={`bodyCopyForm ${styles.label}`}>
                    All Day Event
                  </p>
                  <ToggleSwitch
                    value={isAllDayEvent}
                    onChange={() => setIsAllDayEvent(!isAllDayEvent)}
                    greenBackground
                  />
                </div>
              )}
            </div>
            <div
              className={`${styles.fullInlineContainer} ${
                isAllDayEvent && styles.disabledContainer
              }`}>
              <div className={styles.item}>
                <ClockIcon className={styles.icon} />
                <DatePicker
                  placeholderText="Start"
                  selected={startTime?.toDate()}
                  onChange={handleStartTime}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                />
              </div>
              <div
                className={`${styles.fullInlineContainer} ${
                  isAllDayEvent && styles.disabledContainer
                }`}>
                <div className={styles.item}>
                  <DatePicker
                    className={styles.endTimePicker}
                    placeholderText="End"
                    selected={endTime?.toDate()}
                    onChange={handleEndTime}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                  />
                  <ClockIcon className={styles.endTimeIcon} />
                </div>
              </div>
            </div>
            <div style={{display: 'flex', flex: 1}}>
              <p className="errorMessage">{startTimeError}</p>
              <p
                className="errorMessage"
                style={{display: 'flex', flex: 1, justifyContent: 'flex-end'}}>
                {endTimeError}
              </p>
            </div>
            {hasLocation && (
              /* Event Location */
              <div className={styles.locationItem}>
                <LocationIcon className={styles.icon} />
                <div className={styles.locationSearchInputContainer}>
                  <SearchGooglePlaces
                    persistentClear={true}
                    value={locationSearchInput}
                    onChange={(value) => {
                      setLocationSearchInput(value);
                      value.length < 3 && getSuggestionsHandler([]);
                    }}
                    onClearSearch={() => {
                      setLocationSearchInput('');
                      getSuggestionsHandler([]);
                    }}
                    clearPlaceholder={() => {
                      setAddress('');
                    }}
                    handleError={handleLocationError}
                    getSuggestions={getSuggestionsDebounce}
                    placeholder={address || 'Enter Location'}
                    type="establishment"
                  />
                </div>
              </div>
            )}
            {hasLocation && <p className="errorMessage">{addressError}</p>}
            {locationSearchInput.length > 0 && (
              <div className={styles.locationPlacesList}>
                <PlacesList
                  locationError={locationError}
                  locationSuggestions={locationSuggestions}
                  onSelect={selectLocationHandler}
                  onCurrentLocationSelect={selectCurrentLocationHandler}
                />
              </div>
            )}
            <div className={styles.item}>
              <ActivityIcon className={styles.icon} />
              <CustomModal
                items={eventCategories}
                isOpen={eventActivityModalIsOpen}
                selectedValue={eventActivityModalSelectedValue}
                placeholder={'Pick An Activity'}
                modalHandler={eventActivityModalHandler}
                onSelect={eventActivityModalSelectHandler}
              />
            </div>
            <p className="errorMessage">
              {eventActivityModalSelectedValueError}
            </p>
            <div className={styles.item}>
              <LinksIcon className={styles.icon} />
              <span className={styles.linkItem} onClick={linksHandler}>
                Links
              </span>
            </div>
            {linksClicked && (
              <div className={styles.linksContainer}>
                <EventLinkInput
                  label="Link Text #1"
                  value={linkText1}
                  onChangeText={setLinkText1}
                  error={linkText1Error}
                  maxCharacters={LINK_CHAR_LIMIT}
                />
                <EventLinkInput
                  label="Link URL #1"
                  value={linkURL1}
                  onChangeText={setLinkURL1}
                  error={linkURL1Error}
                  reducedMargin={true}
                />
                <EventLinkInput
                  label="Link Text #2"
                  value={linkText2}
                  onChangeText={setLinkText2}
                  error={linkText2Error}
                  maxCharacters={LINK_CHAR_LIMIT}
                />
                <EventLinkInput
                  label="Link URL #2"
                  value={linkURL2}
                  onChangeText={setLinkURL2}
                  error={linkURL2Error}
                  reducedMargin={true}
                />
              </div>
            )}
          </div>
          <div className={styles.descriptionTextArea}>
            <TextArea
              placeholder="Describe your event"
              value={eventDescription}
              onChange={eventDescriptionHandler}
              maxCharacters={DESCRIPTION_CHAR_LIMIT}
            />
            <p className="errorMessage" style={{textAlign: 'right'}}>
              {eventDescriptionError}
            </p>
            {eventImageFile && (
              <div className={styles.imgPreviewContainer}>
                <img
                  src={eventImageFile}
                  alt={'Event'}
                  className={styles.imgPreview}
                />
                <div
                  className={styles.modalXContainer}
                  onClick={removeImageHandler}>
                  <XIcon tintColor={'var(--magenta)'} />
                </div>
              </div>
            )}
          </div>
          {!eventData?.id && (
            <>
              <div className={styles.inviteUsersTextArea}>
                <TextArea
                  placeholder="Tag some people to notify them about your event!"
                  value={invitedUsersInputValue}
                  onChange={invitedUsersHandler}
                />
                {invitedUsersInputValue && invitedUsersSearchList.length > 0 ? (
                  <div className={styles.invitedUsersList}>
                    {invitedUsersSearchList.map((user, key) => (
                      <InvitedUsersSearchList
                        key={key}
                        user={user}
                        onInviteUserHandler={onInviteUserHandler}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              {invitedUsersNames.map((user, key) => (
                <span
                  key={key}
                  className={`namesAndObjects ${styles.inviteSelectedUser}`}>
                  {user}
                  <RemoveIcon onClick={() => removeInvitedUserHandler(user)} />
                </span>
              ))}
            </>
          )}
        </div>
      </div>
      <div className={styles.attachPhotoContainer}>
        <label className={styles.attachPhotoButton}>
          <GalleryIcon tintColor="var(--white)" />
          <span className={`formLabel ${styles.attachPhotoText}`}>
            Add a photo to your event
          </span>
          <input
            type="file"
            accept="image/*"
            className={styles.hideDefaultUpload}
            onChange={addImageHandler}
          />
          {/* TODO: Make photo appear */}
        </label>
      </div>
    </div>
  );
};

export default CreateEvent;
