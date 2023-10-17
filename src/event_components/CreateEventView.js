import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Keyboard,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import moment from 'moment';

import PhotoController from '../design_components/PhotoController';
import {EVENT_OPTIONS} from '../../shared/constants/EventFilters';
import {rwbApi} from '../../shared/apis/api';
import googleAPI from '../../shared/apis/googleAPI';
import GoogleAutocompleteView from '../autocomplete_components/GoogleAutocomplete';
import SearchBar from '../design_components/SearchBar';
import {userProfile} from '../../shared/models/UserProfile';
import {userEventDrafts} from '../../shared/models/UserEventDrafts';
import RWBButton from '../design_components/RWBButton';
import RWBTextField from '../design_components/RWBTextField';
import {
  CustomScrollablePickerList,
  generateCustomPickerItems,
} from '../design_components/CustomScrollablePicker';
import PeopleSearchBar from '../design_components/ElasticSearchBar';
import InviteUsersView from '../design_components/InviteUsersView';
import EVENT_STATUS from '../../shared/constants/EventStatus';
import {
  getBlobFromLocalURI,
  validURL,
  displayInvitedUsers,
  localizeEventTimesFormatted,
  isNullOrEmpty,
} from '../../shared/utils/Helpers';
import DateTimePicker from './DateTimePicker';
import {EXECUTION_STATUS, logCreateEvent, logEventCoverPhoto, logUpdateEvent} from '../../shared/models/Analytics';
import NavTabs from '../design_components/NavTabs';
import {CREATE_EVENT_NAV_ELEMENTS} from '../../shared/constants/EventTabs';
import {getAllDayEventTimes} from '../../shared/utils/EventHelpers';
import globalStyles, {RWBColors} from '../styles';
// svgs
import XIcon from '../../svgs/XIcon';
import MapMarkerIcon from '../../svgs/MapMarkerIcon';
import CalendarIcon from '../../svgs/CalenderIcon';
import LocationIcon from '../../svgs/LocationIcon';
import ClockIcon from '../../svgs/ClockIcon';
import ActivityIcon from '../../svgs/ActivityIcon';
import LinksIcon from '../../svgs/LinksIcon';
import AccountIcon from '../../svgs/AccountIcon';
import CheckIcon from '../../svgs/CheckIcon';

const LINK_CHAR_LIMIT = 40;
const DESCRIPTION_CHAR_LIMIT = 3000;

export default class CreateEvent extends React.Component {
  constructor(props) {
    super(props);
    // this is to ensure copying to avoid mutations and cause issues elsewhere
    this.eventCategories = {...EVENT_OPTIONS};
    delete this.eventCategories['all-activities'];
    // userProf is for host on member events, and creator on chapter events
    const userProf = userProfile.getUserProfile();
    this.state = {
      eventID: this.props.eventID,
      eventTitle: this.props.title || '',
      eventTitleError: null,
      eventDate: this.props.eventDate || '',
      eventDateError: null,
      eventStartTime: this.props.eventStartTime || '',
      eventEndTime: this.props.eventEndTime || '',
      eventLat: this.props.latitude || null,
      eventLong: this.props.longitude || null,
      eventCity: this.props.city || '',
      eventZip: this.props.zip || '',
      eventState: this.props.state || '',
      eventCountry: this.props.country || '',
      eventFullAddress: this.props.eventLocation || '',
      eventAddressError: null,
      eventThoroughfare: '',
      activity_category: this.props.activityCategory || '',
      activityCategoryError: null,
      eventDescription: this.props.eventDescription || '',
      eventDescriptionError: null,
      eventChapterID: userProf.preferred_chapter.id,
      changeableHost: this.props.groupId !== 0 && this.props.groupId, // previously used chapter_host. Now building off having groupId
      eventImage: this.props.eventImage,
      isAllDayEvent: this.props.isAllDayEvent || false,
      dateVisible: false,
      startTimeVisible: false,
      startTimeError: null,
      endTimeVisible: false,
      endTimeError: null,
      locationVisible: false,
      activityVisible: false,
      linksVisible: false,
      inviteUsersVisible: false,
      invitedUsers: [], // user profiles retrieved after tagging them
      pickerType: '',
      locationSearchInput: '',
      linkText1:
        (this.props.links && this.props.links[0] && this.props.links[0].text) ||
        '',
      linkText2:
        (this.props.links && this.props.links[1] && this.props.links[1].text) ||
        '',
      linkURL1:
        (this.props.links && this.props.links[0] && this.props.links[0].url) ||
        '',
      linkURL2:
        (this.props.links && this.props.links[1] && this.props.links[1].url) ||
        '',
      linkText1Error: null,
      linkText2Error: null,
      linkURL1Error: null,
      linkURL2Error: null,
      isLoading: false,
      searchingUser: false,
      keyboardIsShowing: false,
      eventMade: false, //set as true on server call to prevent accidental duplicates and reset to false on server failures
      activeTab: this.props.isVirtual ? 'virtual' : 'local',
      virtualEventCategory:
        this.props.virtualEventCategory || this.props.isVirtual
          ? 'workouts'
          : null,
    };
    this.keyboardHeight = 0;
  }

  componentDidMount = () => {
    // userEventDrafts.setUserID(userProfile.getUserProfile().id);
    // if (this.props.draft) {
    //   this.storedEventID = draft.draft_id;
    //   this.setState(draft);
    // }
    this.setCreatorInfo();
    this.setHostInfo();
    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this._keyboardWillShow,
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this._keyboardWillHide,
    );
  };

  setCreatorInfo = () => {
    let userProf;
    if (this.state.eventID) userProf = this.props.eventCreator;
    else userProf = userProfile.getUserProfile();
    this.setState({
      eventCreatorName: `${userProf.first_name} ${userProf.last_name}`,
      eventCreatorChapter: `${userProf.preferred_chapter.name}`,
      eventCreatorMilitaryStatus: userProf.military_status,
      eventCreatorMilitaryBranch: userProf.military_branch,
      eventCreatorPic: `${userProf.profile_photo_url || userProf.photo_url}`,
      eventCreatorID: userProf.id,
    });
  };

  setHostInfo = () => {
    let userProf;
    if (this.state.eventID) userProf = this.props.eventHost;
    else userProf = userProfile.getUserProfile();
    this.setState({
      eventHostName: `${userProf.first_name} ${userProf.last_name}`,
      eventHostChapter: `${userProf.preferred_chapter.name}`,
      eventHostMilitaryStatus: userProf.military_status,
      eventHostMilitaryBranch: userProf.military_branch,
      eventHostPic: `${userProf.profile_photo_url || userProf.photo_url}`,
      eventHostID: userProf.id,
    });
  };

  componentWillUnmount() {
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();
  }

  _keyboardWillShow = (e) => {
    this.keyboardHeight = e.endCoordinates.height;
    this.setState({keyboardIsShowing: true});
    this.forceUpdate();
  };

  _keyboardWillHide = (e) => {
    this.keyboardHeight = 0;
    this.setState({keyboardIsShowing: false});
    this.forceUpdate();
  };

  setOnlyVisible = (field) => {
    this.setState({
      dateVisible: field === 'date' ? true : false,
      startVisible: field === 'start' ? true : false,
      endVisible: field === 'end' ? true : false,
      activityVisible: field === 'activity' ? true : false,
    });
  };

  setDateAndTime = (val) => {
    let type = this.state.pickerType;
    // set it back to empty to string. Prevents it from popping up after returning from location selector
    this.setState({pickerType: ''});
    if (val && type === 'date') {
      val = moment(val);
      this.setState({eventDate: val.format('YYYY-MM-DD')});
    } else if (val && (type === 'start' || type === 'end')) {
      val = moment(val);
      if (type === 'start')
        this.setState({eventStartTime: val.format('HH:mm:ss')});
      else this.setState({eventEndTime: val.format('HH:mm:ss')});
    }
  };

  isVirtualAndAllDay() {
    const {isAllDayEvent, activeTab} = this.state;
    return isAllDayEvent && activeTab === 'virtual';
  }

  getDisplayableValue(value, options) {
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

  selectDateTimePicker = (type) => {
    this.setState({
      dateTimePickerVisible: true,
      pickerType: type,
    });
  };

  isComplete = () => {
    let complete =
      !isNullOrEmpty(this.state.eventTitle) &&
      this.state.eventCreatorName &&
      this.state.eventCreatorChapter &&
      this.state.eventHostName &&
      this.state.eventHostChapter &&
      this.state.eventDate &&
      ((this.state.eventStartTime && this.state.eventEndTime) ||
        this.isVirtualAndAllDay()) &&
      this.state.activity_category &&
      this.state.eventDescription;
    if (this.state.activeTab === 'local') {
      if (this.state.eventLat === null || this.state.eventLong === null)
        complete = false;
    }
    return complete;
  };

  isStarted = () => {
    const {
      eventTitle,
      eventDate,
      eventStartTime,
      eventEndTime,
      eventLat,
      eventLong,
      activity_category,
      eventDescription,
    } = this.state;

    return (
      eventTitle ||
      eventDate ||
      eventStartTime ||
      eventEndTime ||
      eventLat ||
      eventLong ||
      activity_category ||
      eventDescription
    );
  };

  saveDraft = () => {
    const {
      eventTitle,
      eventCreatorName,
      eventCreatorChapter,
      eventHostName,
      eventHostChapter,
      eventDate,
      eventStartTime,
      eventEndTime,
      eventLat,
      eventLong,
      activity_category,
      eventDescription,
      eventImage,
    } = this.state;
    const event_data = {
      eventTitle,
      eventCreatorName,
      eventCreatorChapter,
      eventHostName,
      eventHostChapter,
      eventDate,
      eventStartTime,
      eventEndTime,
      eventLat,
      eventLong,
      activity_category,
      eventDescription,
      eventImage,
    };
    if (this.storedEventID) {
      userEventDrafts.updateDraft(event_data, this.storedEventID);
    } else {
      userEventDrafts.createDraft(event_data);
    }
    this.props.close();
  };

  clearErrors = () => {
    this.setState({
      eventTitleError: null,
      activityCategoryError: null,
      eventAddressError: null,
      eventDateError: null,
      endTimeError: null,
      startTimeError: null,
      linkText1Error: null,
      linkText2Error: null,
      linkURL1Error: null,
      linkURL2Error: null,
      eventDescriptionError: null,
    });
  };

  hasErrors = () => {
    const {
      eventTitle,
      linkText1,
      linkText2,
      linkURL1,
      linkURL2,
      eventDate,
      eventStartTime,
      eventEndTime,
      eventDescription,
      activity_category,
      eventFullAddress,
    } = this.state;
    let hasError = false;

    this.clearErrors();

    const CHAR_LIMIT_WARNING_LINK = `EXCEEDED ${LINK_CHAR_LIMIT} CHARACTER LIMIT`;
    const MISSING_TEXT_WARNING = 'MISSING TEXT FOR LINK';
    const MISSING_LINK_WARNING = 'MISSING LINK FOR TEXT';
    const INVALID_URL_WARNING = 'INVALID URL (example: https://teamrwb.org)';
    const INVALID_END_TIME = 'MUST BE AFTER START TIME';
    const MISSING_FIELD = 'THIS FIELD IS REQUIRED';

    if (linkURL1) {
      if (!linkText1) {
        this.setState({linkText1Error: MISSING_TEXT_WARNING});
        hasError = true;
      }
      if (!validURL(linkURL1)) {
        this.setState({linkURL1Error: INVALID_URL_WARNING});
        hasError = true;
      }
    }
    if (linkText1) {
      if (linkText1.length > LINK_CHAR_LIMIT) {
        this.setState({linkText1Error: CHAR_LIMIT_WARNING_LINK});
        hasError = true;
      }
      if (!linkURL1) {
        this.setState({linkURL1Error: MISSING_LINK_WARNING});
        hasError = true;
      }
    }
    if (linkURL2) {
      if (!linkText2) {
        this.setState({linkText2Error: MISSING_TEXT_WARNING});
        hasError = true;
      }
      if (!validURL(linkURL2)) {
        this.setState({linkURL2Error: INVALID_URL_WARNING});
        hasError = true;
      }
    }
    if (isNullOrEmpty(eventDescription)) {
      this.setState({eventDescriptionError: MISSING_FIELD});
      hasError = true;
    }
    if (linkText2) {
      if (linkText2.length > LINK_CHAR_LIMIT) {
        this.setState({linkText2Error: CHAR_LIMIT_WARNING_LINK});
        hasError = true;
      }
      if (!linkURL2) {
        this.setState({linkURL2Error: MISSING_LINK_WARNING});
        hasError = true;
      }
    }
    if (isNullOrEmpty(eventTitle)) {
      this.setState({eventTitleError: MISSING_FIELD});
      hasError = true;
    }
    if (this.state.activeTab !== 'virtual' && isNullOrEmpty(eventFullAddress)) {
      this.setState({eventAddressError: MISSING_FIELD});
      hasError = true;
    }
    if (isNullOrEmpty(eventDate)) {
      this.setState({eventDateError: MISSING_FIELD});
      hasError = true;
    }
    if (!this.isVirtualAndAllDay()) {
      let momentEndTime = moment(`${eventDate} ${eventEndTime}`);
      let momentStartTime = moment(`${eventDate} ${eventStartTime}`);
      if (momentEndTime.isSameOrBefore(momentStartTime)) {
        this.setState({endTimeError: INVALID_END_TIME});
        hasError = true;
      }
      if (!eventEndTime) {
        this.setState({endTimeError: MISSING_FIELD});
        hasError = true;
      }
      if (!eventStartTime) {
        this.setState({startTimeError: MISSING_FIELD});
        hasError = true;
      }
    }
    if (!activity_category) {
      this.setState({activityCategoryError: MISSING_FIELD});
      hasError = true;
    }
    return hasError;
  };

  createEvent = () => {
    if (this.hasErrors()) return false;
    this.setState({isLoading: true, eventMade: true});
    const {
      eventDate,
      eventStartTime,
      eventLat,
      eventLong,
      activeTab,
    } = this.state;

    if (activeTab !== 'virtual') {
      const eventDateTime = moment(`${eventDate} ${eventStartTime}`);
      googleAPI
        .timezone(eventLat, eventLong, eventDateTime.unix())
        .then((response) => {
          this.formatPayload(response.timeZoneId, response.timeZoneName);
        });
    } else this.formatPayload();
  };

  setFlag = (flag) => {
    this.setState({
      activeTab: flag,
      virtualEventCategory: flag === 'virtual' ? 'workouts' : null,
    });
  };

  formatPayload = (timeZoneId, timeZoneName) => {
    const {
      eventTitle,
      eventDate,
      eventStartTime,
      eventEndTime,
      eventLat,
      eventLong,
      eventFullAddress,
      eventCity,
      eventState,
      eventZip,
      eventCountry,
      activity_category,
      eventDescription,
      eventImage,
      linkText1,
      linkText2,
      linkURL1,
      linkURL2,
      eventHostID,
      eventCreatorID,
      eventThoroughfare,
      invitedUsers,
      activeTab,
      isAllDayEvent,
      virtualEventCategory,
    } = this.state;
    // add link objects if they exist
    let links = [];
    if (linkText1 && linkURL1) {
      links.push({text: linkText1, url: linkURL1});
    }
    if (linkText2 && linkURL2) {
      links.push({text: linkText2, url: linkURL2});
    }
    let eventTimes;
    let startTime;
    let endTime;
    if (this.isVirtualAndAllDay() && !this.state.eventID) {
      const allDayTimes = getAllDayEventTimes(eventDate);
      startTime = allDayTimes.startOfDay;
      endTime = allDayTimes.endOfDay;
    } else {
      eventTimes = localizeEventTimesFormatted(
        eventDate,
        eventStartTime,
        eventEndTime,
      );
      startTime = `${eventTimes.formattedStartDate} ${eventTimes.formattedStartHours}`;
      endTime = `${eventTimes.formattedEndDate} ${eventTimes.formattedEndHours}`;
    }
    const isVirtual = activeTab === 'virtual';
    const payload = {
      name: eventTitle.slice(0, 68), // event title needs to be limited to 68 characters for SF sync
      creator: eventCreatorID,
      host: eventHostID,
      category: activity_category,
      description: eventDescription,
      start: startTime,
      end: endTime,
      status: EVENT_STATUS.in_progress,
      chapter_id: this.props.groupId || 0, // backend stores it as chapter_id to match old convention
      chapter_hosted: this.props.groupId ? true : false,
      photo_url: eventImage,
      links,
      location: {
        latitude: isVirtual ? 0 : eventLat.toString(),
        longitude: isVirtual ? 0 : eventLong.toString(),
        address: isVirtual ? null : eventThoroughfare || eventFullAddress,
        city: isVirtual ? null : eventCity,
        state: isVirtual ? null : eventState,
        zip: isVirtual ? null : eventZip,
        country: isVirtual ? null : eventCountry,
      },
      is_all_day: isAllDayEvent,
      tagged: [],
      is_virtual: isVirtual,
      virtual_event_category: virtualEventCategory,
    };
    // these will only be defined on non-virtual events
    if (timeZoneId && timeZoneName) {
      payload.time_zone_id = timeZoneId;
      payload.time_zone_name = timeZoneName;
    }
    if (invitedUsers.length) {
      for (let i = 0; i < invitedUsers.length; i++) {
        payload.tagged.push(invitedUsers[i].id);
      }
    }
    let imageData = null;
    // do not go through the uploading image flow if the image stored is the url received
    if (eventImage && eventImage !== this.props.eventImage) {
      imageData = {
        media_filename: eventImage.name,
        media_intent: 'event',
      };
    }
    if (!imageData) {
      this.uploadEvent(payload);
    } else {
      getBlobFromLocalURI(eventImage.uri).then((blob) => {
        rwbApi
          .getMediaUploadURL(JSON.stringify(imageData))
          .then((result) => {
            const url = result.data;
            rwbApi
              .putMediaUpload(url, blob)
              .then(() => {
                const event_photo_url = url.split('?')[0];
                payload.photo_url = event_photo_url;
                this.uploadEvent(payload);
              })
              .catch((error) => {
                // Unable to upload the file to Azure
                console.warn('error: ', error);
                this.setState({isLoading: false});
                Alert.alert(
                  'Team RWB',
                  'Error uploading event image to Team RWB Servers.',
                );
              });
          })
          .catch((error) => {
            // Unable to retrieve the upload URL
            console.warn('error: ', error);
            this.setState({isLoading: false});
            Alert.alert(
              'Team RWB',
              'Error uploading event image to Team RWB Servers.',
            );
          });
      });
    }
  };

  uploadEvent = (payload) => {
    if (this.state.eventID) {
      // updating event
      let analyticsObj = {
        activity_sub_type: payload.category,
        event_record_type: payload.isVirtual ? 'virtual' : 'event',
        event_id: `${this.state.eventID}`,
        challenge_id: this.props.challenge_id !== 0 ? `${this.props.challenge_id}` : null,
        group_id: payload.chapter_hosted ? `${payload.chapter_id}` : null,
        has_image: !isNullOrEmpty(this.props.eventImage),
      };
      return rwbApi
        .putEvent(this.state.eventID, JSON.stringify(payload))
        .then(() => {
          if (this.props.eventImage !== payload.photo_url) {
            analyticsObj.execution_status = EXECUTION_STATUS.success;
            logEventCoverPhoto(analyticsObj);
          }
          analyticsObj.execution_status = EXECUTION_STATUS.success;
          logUpdateEvent(analyticsObj);
          this.props.refreshEvents();
          this.props.close(true);
        })
        .catch((error) => {
          if (this.props.eventImage !== payload.photo_url) {
            analyticsObj.execution_status = EXECUTION_STATUS.failure;
            logEventCoverPhoto(analyticsObj);
          }
          analyticsObj.execution_status = EXECUTION_STATUS.failure;
          logUpdateEvent(analyticsObj);
          this.setState({eventMade: false});
          console.warn(error);
          Alert.alert(
            'Team RWB',
            'Error uploading updated event to Team RWB Servers.',
          );
        })
        .finally(() => {
          this.setState({isLoading: false});
        });
    } else {
      let analyticsObj = {
        'has_image': !isNullOrEmpty(this.props.eventImage),
        'origin_type': payload.origin_type,
        'group_record_type': payload.isVirtual ? 'virtual' : 'event',
        'activity_sub_type': payload.category,
        'event_record_type': payload.event_record_type,
        'challenge_id': this.props.challenge_id !== 0 ? `${this.props.challenge_id}` : null,
        'group_id': payload.chapter_hosted ? `${payload.chapter_id}` : null,
        'app_version': payload.app_version,
      };
      return rwbApi
        .postEvent(JSON.stringify(payload))
        .then(() => {
          analyticsObj.execution_status = EXECUTION_STATUS.success;
          logCreateEvent(analyticsObj);
          // retrieving the feed after so the post is in existence and can be reacted to
          // (small delay to ensure stream gets the post)
          setTimeout(() => {
            return rwbApi
              .getUserFeed(userProfile.getUserProfile().id)
              .then(() => {
                this.props.refreshEvents();
                this.props.close(true);
              });
          }, 100);
        })
        .catch((error) => {
          this.setState({eventMade: false});
          console.warn(error);
          Alert.alert('Team RWB', 'Error uploading event to Team RWB Servers.');
          analyticsObj.execution_status = EXECUTION_STATUS.failure;
          logCreateEvent(analyticsObj);
        })
        .finally(() => {
          this.setState({isLoading: false});
        });
    }
  };

  showFeed() {}

  locallySaveEventType = (activity, value) => {
    // virtual events in v1 had a lat/long of 0
    if (value === 'virtual') this.setState({eventLat: 0, eventLong: 0});
    else {
      // only if the previous event was virtual reset lat/long
      if (this.state.eventLat === 0 && this.state.eventLong === 0)
        this.setState({eventLat: null, eventLong: null});
    }
    this.setState({[activity]: value});
  };

  // might put all users names in a string and save the IDs in state to submit to the server
  handleInvitedUsers = (users) => {
    this.setState({invitedUsers: users, inviteUsersVisible: false});
  };

  onSearchTextChange = (text) => {
    this.setState({locationSearchValue: text});
  };

  handleGoogleResponse = (response) => {
    if (response) {
      this.setState({
        eventFullAddress: response.fullAddress,
        locationVisible: false,
        eventLat: response.lat,
        eventLong: response.long,
        eventZip: response.zip,
        eventCountry: response.country,
        eventCity: response.city,
        eventState: response.country === 'US' ? response.state : null,
        eventThoroughfare: response.thoroughfare,
      });
    }
  };

  handleSelectedUser = (user) => {
    this.setState({
      searchingUser: false,
      eventChapterID: user.preferred_chapter.id,
      eventHostName: user.full_name,
      eventHostMilitaryStatus: user.military_status,
      eventHostMilitaryBranch: user.military_branch,
      eventHostChapter: user.preferred_chapter.name,
      eventHostPic: user.profile_photo_url,
      eventHostID: user.id,
    });
  };

  render() {
    const {
      activity_category,
      activityCategoryError,
      changeableHost,
      eventTitle,
      eventTitleError,
      eventCreatorName,
      eventCreatorChapter,
      eventCreatorMilitaryStatus,
      eventCreatorMilitaryBranch,
      eventCreatorPic,
      eventHostName,
      eventHostChapter,
      eventHostMilitaryStatus,
      eventHostMilitaryBranch,
      eventHostPic,
      eventDate,
      eventDateError,
      eventStartTime,
      startTimeError,
      eventEndTime,
      endTimeError,
      eventLat,
      eventLong,
      eventFullAddress,
      eventAddressError,
      eventDescription,
      eventDescriptionError,
      eventImage,
      locationVisible,
      activityVisible,
      pickerType,
      linkText1,
      linkText2,
      linkURL1,
      linkURL2,
      linkText1Error,
      linkText2Error,
      linkURL1Error,
      linkURL2Error,
      isLoading,
      isAllDayEvent,
      virtualEventCategory,
    } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          animated={true}
          translucent={false}
          backgroundColor={RWBColors.magenta}
        />

        <KeyboardAwareScrollView
          bounces={false}
          extraScrollHeight={60} // 60 is the height of the "Add to your post" container
          style={{backgroundColor: RWBColors.white}}>
          {isLoading && (
            <View style={[{zIndex: 3}, globalStyles.centeredActivityIndicator]}>
              <ActivityIndicator animating size="large" />
            </View>
          )}
          {/* Header */}
          <View style={styles.header}>
            <View>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => this.props.close(false)}>
                <XIcon
                  tintColor={RWBColors.white}
                  style={globalStyles.headerIcon}
                />
              </TouchableOpacity>
            </View>
            <View style={{alignItems: 'center'}}>
              <Text style={globalStyles.title}>
                {this.props.groupName || this.props.groupId > 0
                  ? 'Create Group Event'
                  : userProfile.eagle_leader
                  ? 'Create NON-CHAPTER Event'
                  : 'Create Event'}
              </Text>
              {this.props.groupName && (
                <Text style={globalStyles.titleSubheader}>
                  {this.props.groupName}
                </Text>
              )}
            </View>
            <View>
              <TouchableOpacity
                onPress={this.createEvent}
                style={styles.headerButton}
                disabled={this.state.eventMade} // set to true once pressed to avoid duplications
                accessible={true}
                accessibilityLabel={'Create event'}
                accessibilityRole={'button'}>
                <CheckIcon
                  style={globalStyles.headerIcon}
                  color={RWBColors.white}
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* determine if events can be edited to become local/virtual */}
          {this.props.groupName && this.props.isAdmin ? (
            <NavTabs
              tabs={CREATE_EVENT_NAV_ELEMENTS}
              selected={this.state.activeTab}
              handleOnPress={this.setFlag}
            />
          ) : null}
          {/* Title */}
          <View style={styles.inputContainerTitle}>
            <TextInput
              placeholder="Enter Title"
              placeholderTextColor={RWBColors.grey40}
              onChangeText={(text) => this.setState({eventTitle: text})}
              value={eventTitle}
              returnKeyType="go"
              style={styles.eventTitle}
              error={this.state.eventTitleError}
            />
            {eventTitleError && (
              <Text style={globalStyles.errorMessage}>
                {'\n'}
                {eventTitleError}
              </Text>
            )}
          </View>
          {/* Between the two inputs */}
          <View style={styles.centerContainer}>
            {changeableHost ? (
              <View>
                <View>
                  <View style={{flexDirection: 'row'}}>
                    <AccountIcon style={styles.icon} />
                    <Text style={globalStyles.h3}>Creator</Text>
                  </View>
                  <View style={styles.userContainer}>
                    <Image
                      style={[
                        globalStyles.mediumProfileImage,
                        {marginRight: 10},
                      ]}
                      source={
                        eventCreatorPic !== 'null'
                          ? {uri: eventCreatorPic}
                          : require('../../shared/images/DefaultProfileImg.png')
                      }
                    />
                    <View style={styles.userInfo}>
                      <Text style={globalStyles.h3}>
                        {eventCreatorName}{' '}
                        {this.state.eventHostID === this.state.eventCreatorID
                          ? '(Self)'
                          : null}{' '}
                      </Text>
                      <Text style={globalStyles.h5}>{eventCreatorChapter}</Text>
                      <Text style={globalStyles.bodyCopyForm}>
                        {eventCreatorMilitaryStatus}
                        {eventCreatorMilitaryBranch &&
                        eventCreatorMilitaryStatus.toLowerCase() !== 'civilian'
                          ? ` / ${eventCreatorMilitaryBranch}`
                          : null}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.separator} />
                <View>
                  <View style={{flexDirection: 'row'}}>
                    <AccountIcon style={styles.icon} />
                    <Text style={globalStyles.h3}>Host</Text>
                  </View>
                  {/* Bring up user search */}
                  <TouchableOpacity
                    onPress={() => this.setState({searchingUser: true})}>
                    <View style={styles.userContainer}>
                      <Image
                        style={[
                          globalStyles.mediumProfileImage,
                          {marginRight: 10},
                        ]}
                        source={
                          /* if the current user does not have a profile picture, it is a string of 'null'.
                        When looking up a user, if they do not have a picture it is a null value. 
                        Older accounts without a profile photo when selected might have an eventHostPic of false. */
                          eventHostPic !== 'null' && eventHostPic
                            ? {uri: eventHostPic}
                            : require('../../shared/images/DefaultProfileImg.png')
                        }
                      />
                      <View style={styles.userInfo}>
                        <Text style={globalStyles.h3}>
                          {eventHostName}{' '}
                          {this.state.eventHostID === this.state.eventCreatorID
                            ? '(Self)'
                            : null}{' '}
                        </Text>
                        <Text style={globalStyles.h5}>{eventHostChapter}</Text>
                        <Text style={globalStyles.bodyCopyForm}>
                          {eventHostMilitaryStatus}
                          {eventHostMilitaryBranch &&
                          eventHostMilitaryStatus.toLowerCase() !== 'civilian'
                            ? ` / ${eventHostMilitaryBranch}`
                            : null}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.separator} />
              </View>
            ) : null}

            {/* Virtual subtype */}
            {this.state.activeTab === 'virtual' && (
              <View style={styles.subtypeContainer}>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({virtualEventCategory: 'workouts'})
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Set virtual subtype to workouts"
                  style={[
                    styles.subtypeButton,
                    virtualEventCategory === 'workouts'
                      ? styles.activeSubtype
                      : styles.unactiveSubtype,
                  ]}>
                  <Text
                    style={[
                      styles.subtypeText,
                      {
                        color:
                          virtualEventCategory === 'workouts'
                            ? RWBColors.white
                            : RWBColors.grey80,
                      },
                    ]}>
                    Workout
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({virtualEventCategory: 'challenges'})
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Set virtual subtype to challenges"
                  style={[
                    styles.subtypeButton,
                    virtualEventCategory === 'challenges'
                      ? styles.activeSubtype
                      : styles.unactiveSubtype,
                  ]}>
                  <Text
                    style={[
                      styles.subtypeText,
                      {
                        color:
                          virtualEventCategory === 'challenges'
                            ? RWBColors.white
                            : RWBColors.grey80,
                      },
                    ]}>
                    Challenge
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Event Times */}
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity
                style={styles.createEventFields}
                onPress={() => this.selectDateTimePicker('date')}>
                <CalendarIcon style={styles.icon} />
                {eventDate ? (
                  <Text style={globalStyles.bodyCopyForm}>
                    {moment(eventDate, 'YYYY-MM-DD').format(
                      'ddd, MMM DD, YYYY',
                    )}
                  </Text>
                ) : (
                  <Text style={globalStyles.bodyCopyForm}>Pick a date</Text>
                )}
              </TouchableOpacity>
              {this.state.activeTab === 'virtual' && (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={[globalStyles.bodyCopyForm, {marginRight: 5}]}>
                    All Day Event
                  </Text>
                  <Switch
                    value={isAllDayEvent}
                    onValueChange={() => {
                      this.setState({isAllDayEvent: !isAllDayEvent});
                    }}
                  />
                </View>
              )}
            </View>
            <Text style={globalStyles.errorMessage}>{eventDateError}</Text>

            {pickerType ? (
              // NOTE: WHEN DEVELOPING ON IOS, HAVING THE DEBUGGER OPEN WILL USE COMPUTER TIME, NOT DEVICE TIME ON SELECTION
              <DateTimePicker
                pickerType={pickerType}
                setDateAndTime={this.setDateAndTime}
                hidePicker={() => this.setState({dateTimePickerVisible: false})}
                isVisible={this.state.dateTimePickerVisible}
                iOSTitle={
                  pickerType === 'start'
                    ? 'Pick a start time'
                    : pickerType === 'end'
                    ? 'Pick an end time'
                    : 'Pick a date'
                }
              />
            ) : null}
            <View style={styles.separator} />
            <View style={styles.timeContainer}>
              {/* Start time */}
              <View>
                <TouchableOpacity
                  disabled={this.isVirtualAndAllDay()}
                  style={[
                    styles.createEventFields,
                    {opacity: this.isVirtualAndAllDay() ? 0.5 : 1},
                  ]}
                  onPress={() => this.selectDateTimePicker('start')}>
                  <ClockIcon
                    tintColor={this.isVirtualAndAllDay() && RWBColors.grey80}
                    style={styles.icon}
                  />
                  {eventStartTime ? (
                    <Text style={globalStyles.bodyCopyForm}>
                      {moment(eventStartTime, 'hh:mm:ss').format('h:mm A')}
                    </Text>
                  ) : (
                    <Text style={globalStyles.bodyCopyForm}>Start</Text>
                  )}
                </TouchableOpacity>
                {this.state.activeTab !== 'virtual' && (
                  <Text
                    style={[
                      globalStyles.formLabel,
                      {color: RWBColors.grey40, marginLeft: 26},
                    ]}>
                    Uses the event location's timezone
                  </Text>
                )}
                <Text style={globalStyles.errorMessage}>{startTimeError}</Text>
              </View>
              {/* End time */}
              <View style={{flexDirection: 'column'}}>
                <TouchableOpacity
                  disabled={this.isVirtualAndAllDay()}
                  style={[
                    styles.createEventFields,
                    {
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      opacity: this.isVirtualAndAllDay() ? 0.5 : 1,
                    },
                  ]}
                  onPress={() => this.selectDateTimePicker('end')}>
                  {eventEndTime ? (
                    <Text style={globalStyles.bodyCopyForm}>
                      {moment(eventEndTime, 'hh:mm:ss').format('h:mm A')}
                    </Text>
                  ) : (
                    <Text style={globalStyles.bodyCopyForm}>End</Text>
                  )}
                  <ClockIcon
                    tintColor={this.isVirtualAndAllDay() && RWBColors.grey80}
                    style={{width: 16, height: 16, marginLeft: 10}}
                  />
                </TouchableOpacity>
                <Text style={globalStyles.errorMessage}>{endTimeError}</Text>
              </View>
            </View>
            {/* Event Activities */}
            <View style={styles.separator} />
            <CustomScrollablePickerList
              currentValue={
                <View style={styles.createEventFields}>
                  <ActivityIcon style={styles.icon} />
                  <Text style={globalStyles.bodyCopyForm}>
                    {activity_category
                      ? this.getDisplayableValue(
                          activity_category,
                          EVENT_OPTIONS,
                        )
                      : 'Enter Activity'}
                  </Text>
                </View>
              }
              onPress={() =>
                this.setState({activityVisible: !this.state.activityVisible})
              }>
              {generateCustomPickerItems(
                this.eventCategories,
                'activity_category',
                activity_category,
                this.locallySaveEventType,
              )}
            </CustomScrollablePickerList>
            <Text style={globalStyles.errorMessage}>
              {activityCategoryError}
            </Text>
            {this.state.activeTab !== 'virtual' && (
              /* Event Location */
              <View>
                <View style={styles.separator} />
                <TouchableOpacity
                  style={styles.createEventFields}
                  onPress={() => this.setState({locationVisible: true})}>
                  <LocationIcon style={styles.icon} />
                  <Text style={globalStyles.bodyCopyForm}>
                    {!eventFullAddress ? 'Enter Location' : eventFullAddress}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {this.state.activeTab !== 'virtual' && (
              <Text style={globalStyles.errorMessage}>{eventAddressError}</Text>
            )}
            <Modal
              visible={locationVisible}
              onRequestClose={() => this.setState({locationVisible: false})}>
              <View style={{backgroundColor: RWBColors.magenta, flex: 1}}>
                <SafeAreaView style={{flex: 1}}>
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'baseline',
                    }}>
                    <TouchableOpacity
                      style={[
                        styles.headerButton,
                        {
                          paddingHorizontal: '5%',
                          marginBottom: 20,
                          marginTop: 16,
                        },
                      ]}
                      onPress={() => this.setState({locationVisible: false})}>
                      <XIcon
                        tintColor={RWBColors.white}
                        style={globalStyles.headerIcon}
                      />
                    </TouchableOpacity>
                    <View style={{width: '90%'}}>
                      <SearchBar
                        searchSubmit={() => {}}
                        onClearSearchPressed={() =>
                          this.setState({locationSearchValue: ''})
                        }
                        search={this.state.locationSearchValue}
                        onSearchTextChange={this.onSearchTextChange}
                        // onFocus={() => this.focused()}
                        iconType="mapMarker"
                        propClearSearchShowing={
                          this.state.locationSearchValue !== undefined &&
                          this.state.locationSearchValue.length > 0
                        }
                        placeholder={
                          this.props.address || 'Enter event location'
                        }
                      />
                    </View>
                  </View>
                  <GoogleAutocompleteView
                    searchValue={this.state.locationSearchValue}
                    onGoogleFinish={this.handleGoogleResponse}
                    searchType={''}
                  />
                </SafeAreaView>
              </View>
            </Modal>
            {eventLat && eventLong && this.state.activeTab === 'local' ? (
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{
                  width: '100%',
                  height: 120,
                  marginTop: 10,
                  borderRadius: 5,
                }}
                region={{
                  latitude: parseFloat(eventLat),
                  longitude: parseFloat(eventLong),
                  latitudeDelta: 0.025,
                  longitudeDelta: 0.015,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}>
                <Marker
                  coordinate={{
                    latitude: parseFloat(eventLat),
                    longitude: parseFloat(eventLong),
                  }}
                  anchor={{x: 0.5, y: 1}}
                  centerOffset={{x: 0, y: -20}}>
                  <MapMarkerIcon style={{width: 40, height: 40}} />
                </Marker>
              </MapView>
            ) : null}
            {/* Links */}
            <View style={styles.separator} />
            <View>
              <TouchableOpacity
                style={styles.createEventFields}
                onPress={() =>
                  this.setState({linksVisible: !this.state.linksVisible})
                }>
                <LinksIcon style={styles.icon} />
                <Text style={globalStyles.bodyCopyForm}>Links</Text>
              </TouchableOpacity>
              {this.state.linksVisible ? (
                <View>
                  <RWBTextField
                    label="Link Text #1"
                    value={linkText1}
                    onChangeText={(text) => {
                      this.setState({linkText1: text});
                    }}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    characterRestriction={LINK_CHAR_LIMIT}
                    error={linkText1Error}
                  />
                  <RWBTextField
                    label="Link URL #1"
                    value={linkURL1}
                    onChangeText={(text) => {
                      this.setState({linkURL1: text});
                    }}
                    returnKeyType="done"
                    autoCapitalize="none"
                    blurOnSubmit={true}
                    error={linkURL1Error}
                  />
                  <RWBTextField
                    label="Link Text #2"
                    value={linkText2}
                    onChangeText={(text) => {
                      this.setState({linkText2: text});
                    }}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    characterRestriction={LINK_CHAR_LIMIT}
                    error={linkText2Error}
                  />
                  <RWBTextField
                    label="Link URL #2"
                    value={linkURL2}
                    onChangeText={(text) => {
                      this.setState({linkURL2: text});
                    }}
                    returnKeyType="done"
                    autoCapitalize="none"
                    blurOnSubmit={true}
                    error={linkURL2Error}
                  />
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.inputContainerDescription}>
            <TextInput
              placeholder="Describe your event"
              placeholderTextColor={RWBColors.grey40}
              onChangeText={(text) => this.setState({eventDescription: text})}
              value={eventDescription}
              multiline={true}
              scrollEnabled={false}
              returnKeyType="done"
              blurOnSubmit={true}
              style={globalStyles.formInput}
              maxLength={DESCRIPTION_CHAR_LIMIT}
            />
            <Text
              style={[
                globalStyles.formLabel,
                {marginTop: 5, textAlign: 'right'},
              ]}>
              {this.state.eventDescription.length}/{DESCRIPTION_CHAR_LIMIT}
            </Text>
            <Text style={globalStyles.errorMessage}>
              {eventDescriptionError}
            </Text>
          </View>
          {/* Event Image */}
          <View style={{width: '90%', alignSelf: 'center', paddingBottom: 10}}>
            {!eventImage ? null : (
              <View style={{width: '100%'}}>
                <TouchableOpacity
                  style={globalStyles.removeImage}
                  onPress={() => this.setState({eventImage: null})}>
                  <XIcon
                    tintColor={RWBColors.white}
                    style={globalStyles.removeImageX}
                  />
                </TouchableOpacity>
                <Image
                  style={{
                    width: '90%',
                    aspectRatio: 3 / 2,
                    borderRadius: 5,
                    alignSelf: 'center',
                  }}
                  source={{uri: eventImage.uri || eventImage}}
                  alt="Cover Image for Post"
                />
              </View>
            )}
          </View>
          {!this.state.eventID ? (
            <View>
              <TouchableOpacity
                style={styles.inputContainerDescription}
                onPress={() => this.setState({inviteUsersVisible: true})}
                accessible={true}
                accessibilityLabel={
                  'Open screen to add users to tag and notify about your event'
                }
                accessibilityRole={'button'}>
                {this.state.invitedUsers.length ? (
                  <Text style={{color: RWBColors.grey80}}>
                    {displayInvitedUsers(this.state.invitedUsers)}
                  </Text>
                ) : (
                  <Text style={[globalStyles.formInput]}>
                    Tag some people to notify them about your event
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.separator} />
          {/* Bottom Buttons (Create and Delete) */}
          <View style={styles.buttonContainer}>
            <RWBButton
              disabled={this.state.eventMade}
              buttonStyle="primary"
              text={this.state.eventID ? 'UPDATE EVENT' : 'CREATE EVENT'}
              onPress={this.createEvent}
            />
            {/* TODO check if already a craft to delete or check if fresh event and change text */}
            {/* <RWBButton buttonStyle='secondary' text='Delete Draft' /> */}
          </View>
        </KeyboardAwareScrollView>
        <View
          style={[
            globalStyles.aboveKeyboard,
            {
              bottom: this.keyboardHeight,
              position: this.state.keyboardIsShowing ? 'absolute' : 'relative',
            },
          ]}>
          <PhotoController
            type={'gallery'}
            handlePhoto={(photo) => this.setState({eventImage: photo})}
          />
          <Text style={globalStyles.titleSubheader}>ADD TO YOUR POST</Text>
          <PhotoController
            type={'camera'}
            handlePhoto={(photo) => this.setState({eventImage: photo})}
          />
        </View>

        {/* Search user/search people modal */}
        <Modal
          visible={this.state.searchingUser}
          onRequestClose={() => this.setState({searchingUser: false})}>
          <SafeAreaView style={styles.container}>
            <StatusBar
              barStyle="light-content"
              animated={true}
              translucent={false}
              backgroundColor={RWBColors.magenta}
            />
            <PeopleSearchBar
              searching={true}
              focused={true}
              handleSelect={this.handleSelectedUser}
              onDone={() => this.setState({searchingUser: false})}
              placeholder="Search for People"
              type="people"
            />
          </SafeAreaView>
        </Modal>

        {/* Search user/search people modal */}
        <Modal
          visible={this.state.inviteUsersVisible}
          onRequestClose={() => this.setState({inviteUsersVisible: false})}>
          <InviteUsersView
            close={() => this.setState({inviteUsersVisible: false})}
            returnInvitedUsers={this.handleInvitedUsers}
            invitedUsers={this.state.invitedUsers}
          />
        </Modal>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: RWBColors.magenta,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: RWBColors.magenta,
    paddingVertical: 10,
    paddingHorizontal: '5%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontFamily: 'ChangaOne-Italic',
    color: 'black',
    fontSize: 20,
    fontWeight: 'normal',
    flex: 2,
    top: 2,
  },
  centerContainer: {
    width: '90%',
    alignSelf: 'center',
  },
  userContainer: {
    marginTop: 8,
    flexDirection: 'row',
  },
  userInfo: {
    flexDirection: 'column',
  },
  inputContainerDescription: {
    paddingVertical: 20,
    paddingHorizontal: '5%',
    borderTopWidth: 1,
    borderTopColor: RWBColors.grey8,
  },
  inputContainerTitle: {
    paddingVertical: 20,
    paddingHorizontal: '5%',
    borderBottomWidth: 1,
    borderBottomColor: RWBColors.grey40,
    color: RWBColors.navy,
    marginBottom: 20,
  },
  headerButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: RWBColors.magenta,
  },
  separator: {
    marginVertical: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  buttonContainer: {
    flex: 1,
    width: '90%',
    alignSelf: 'center',
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  createEventFields: {
    flexDirection: 'row',
  },
  subtypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center',
    borderColor: RWBColors.grey80,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  subtypeButton: {
    padding: 10,
    flex: 1,
  },
  activeSubtype: {
    backgroundColor: RWBColors.magenta,
    color: RWBColors.white,
  },
  unactiveSubtype: {
    backgroundColor: RWBColors.white,
    color: RWBColors.grey80,
  },
  subtypeText: {
    textAlign: 'center',
    fontFamily: 'Opensans',
    fontWeight: 'bold',
  },
});
