import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Platform,
  Share,
  Alert,
  ActivityIndicator,
  BackHandler,
  Image,
  Modal,
  FlatList,
  ActionSheetIOS,
} from 'react-native';
import moment from 'moment';
import '../../shared/constants/moment-timezone-with-data-10-year-range';
import 'moment-timezone';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import * as AddCalendarEvent from 'react-native-add-calendar-event';

import RWBhtmlView from '../design_components/RWBhtmlView';

import {rwbApi} from '../../shared/apis/api';
import {userProfile} from '../../shared/models/UserProfile';
import {
  scheduleEventNotifications,
  clearEventNotifications,
} from '../Notifications';

import {
  getIndexFromID,
  displayFullAddress,
  defaultEventPhoto,
  getOffsetTime,
  capitalizeFirstLetter,
  localizeTime,
} from '../../shared/utils/Helpers';

import {ATTENDANCE_SLUGS} from '../../shared/constants/AttendanceSlugs';
import EVENT_STATUS from '../../shared/constants/EventStatus';

import {
  logCalendar,
  logMap,
  logAddress,
  logShare,
  logAttendees,
  logCancelEvent,
  EXECUTION_STATUS,
  logEventStatus,
} from '../../shared/models/Analytics';

import CreateEventView from './CreateEventView';
import CreatePost from '../post_components/CreatePostView';
import RecordWorkoutView from '../challenge_components/RecordWorkoutView';

// SVGs
import LocationIcon from '../../svgs/LocationIcon';
import MapMarkerIcon from '../../svgs/MapMarkerIcon';
import CalenderIcon from '../../svgs/CalenderIcon';
import VirtualEventIcon from '../../svgs/VirtualEventIcon';
import RecurringEventIcon from '../../svgs/RecurringEventIcon';
import EagleLeaderIcon from '../../svgs/EagleLeaderIcon';
import InterestedIcon from '../../svgs/InterestedIcon';
import AttendingIcon from '../../svgs/AttendingIcon';
import TicketIcon from '../../svgs/TicketIcon';
import CheckIcon from '../../svgs/CheckIcon';
import ChevronBack from '../../svgs/ChevronBack';
import ShareIcon from '../../svgs/ShareIcon';
import EditIcon from '../../svgs/EditIcon';
import CanceledEventIcon from '../../svgs/CanceledEventIcon';
import AddIcon from '../../svgs/AddIcon';

import requestReview from '../design_components/RateMyApp';
import NavigationService from '../models/NavigationService';

import globalStyles, {RWBColors} from '../styles';
import FeedCard from '../post_components/FeedCard';
import {isDev} from '../../shared/utils/IsDev';
import PostOptionIcon from '../../svgs/PostOptionIcon';
import {REPORT_ERROR} from '../../shared/constants/ErrorMessages';
import FullscreenSpinner from '../design_components/FullscreenSpinner';
import UserBadgesContainer from './UserBadgesContainer';
import {
  formatDateAndTimes,
  isEventOver,
  isEventTodayOrBefore,
} from '../../shared/utils/EventHelpers';
import AndroidAction from '../design_components/AndroidActionSheet';
import RWBSheetButton from '../design_components/RWBSheetButton';
import WorkoutCard from '../challenge_components/WorkoutCard';
import EventChallengeCard from '../challenge_components/EventChallengeCard';
import {CHALLENGE_TYPES} from '../../shared/constants/ChallengeTypes';
import {hoursMinutesSecondsFromMinutes} from '../../shared/utils/ChallengeHelpers';
import MobileLinkHandler from '../design_components/MobileLinkHandler';
import {WORKOUT_DELETE_WARNING} from '../../shared/constants/OtherMessages';

export default class EventView extends React.Component {
  constructor(props) {
    super(props);
    this.alertLimitUsersDisplayedShowed = false;
    this.state = {
      name: '',
      eventID: null,
      eventDate: null,
      eventStartTime: null,
      eventEndTime: null,
      eventLocation: {},
      eventIsVirtual: null,
      eventToday: null,
      going: [],
      interested: [],
      checked_in: [],
      eventDescription: '',
      attendanceStatus: null,
      attendanceStatusLoading: true,
      numberOfLines: 4,
      numberOfUsers: 0,
      latitude: 0,
      longitude: 0,
      links: [],
      isLoading: true,
      attendeesLoading: true,
      refreshing: false,
      mapVisible: false,
      updateEventVisible: false,
      eventFeed: [],
      createPostVisible: false,
      isLoadingMore: false,
      isRemoved: false,
      recordWorkoutVisible: false,
      workoutRecorded: false,
      deletingWorkout: false,
      miles: 0,
      steps: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      challenge_id: 0,
      workoutActionsheetVisible: false,
      requiredUnit: '',
      goal: '',
      challengeEndTime: '',
      challengeName: '',
      challengeStartDate: '',
      place: 0,
      progress: 0,
      loadingChallenge: false,
      shareWorkout: false,
      joined: false,
    };
    this.user = userProfile.getUserProfile();
    this.initializeAttendees = this.initializeAttendees.bind(this);
    this.loadAttendees = this.loadAttendees.bind(this);
    this.handleURL = this.handleURL.bind(this);
    this.linkToMap = this.linkToMap.bind(this);
    this.linkToCalendar = this.linkToCalendar.bind(this);
    this.getAndInitializeAttendanceStatus = this.getAndInitializeAttendanceStatus.bind(
      this,
    );
    this.addToAttendees = this.addToAttendees.bind(this);
    this.removeFromAttendees = this.removeFromAttendees.bind(this);
    this.setStatus = this.setStatus.bind(this);
    this.deleteStatus = this.deleteStatus.bind(this);
    this.onMapPress = this.onMapPress.bind(this);
    this.onAddressPress = this.onAddressPress.bind(this);
    this.onAttendeesPress = this.onAttendeesPress.bind(this);
    this.alertLimitUsersDisplayed = this.alertLimitUsersDisplayed.bind(this);
  }

  componentDidMount() {
    Linking.addEventListener('url', this.handleURL);
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      NavigationService.popStack();
      return true;
    });
    const {
      navigation: {getParam},
    } = this.props;
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      const prevAnonStatus = this.user.anonymous_profile;
      this.user = userProfile.getUserProfile();
      // in order to properly display/hide the add icon for an event post, we check if the user updated their profile and force update
      if (this.user.anonymous_profile !== prevAnonStatus) this.forceUpdate();
      const eventTitle = this.props.navigation.getParam('eventTitle', null);
      if (eventTitle && eventTitle != this.state.eventID)
        this.loadFromEventTitle(eventTitle);
    });
    const value = getParam('value', null);
    const url = getParam('url', null);
    const updateEvent = getParam('updateEvent', null);
    const eventTitle = getParam('eventTitle', null);
    const eventID = getParam('id', null);
    if (
      value === null &&
      url === null &&
      eventTitle === null &&
      eventID === null
    )
      throw new Error(
        'EventView must have a value, an eventTitle, or an eventID',
      );

    // updateEvent is used to change an element of the list of events in EventsListView and MyActivitesView
    // when the user changes their attendance status.
    // It requires the parent screen to be mounted. If EventView is navigated to without either as a parent,
    // for example by deep linking, we want to set it to a no-op. This is fine, since there's no event list to
    // modify anyways, and the correctly updated list will be loaded when the user first visits either page.
    if (updateEvent === null) {
      this.updateEvent = () => {
        return;
      };
    } else {
      this.updateEvent = updateEvent;
    }

    /* value contains the full event in `event`
     * and all of the attendees in a promise `attendeesPromise`.
     * We're ignoring both and loading the event from its `link`
     * in order to solve some caching discrepancies. Know that
     * both tools are available.
     */
    this.setState({
      isLoading: true,
    });
    if (value && value.event?.link) {
      const url = value.event.link;
      this.handleURL({url});
    } else if (url) {
      this.handleURL(url);
    } else if (eventTitle) {
      this.loadFromEventTitle(eventTitle);
    } else if (eventID) {
      this.loadFromEventID(eventID, false);
    } else {
      this.loadFromEventID(value.event?.id, false);
    }
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleURL);
    this.backHandler.remove();
  }

  refreshEvent = () => {
    this.setState({
      refreshing: true,
      eventFeed: [],
    });
    const url = this.state.eventLink;
    const id = this.state.eventID;
    if (id) this.loadFromEventID(id, true);
    else if (url) this.handleURL({url});
  };

  handleURL(linkingEvent) {
    const EVENT_PATH_COMPONENT = `event/`;
    const {url} = linkingEvent;
    const index = url.indexOf(EVENT_PATH_COMPONENT);
    const eventTitle = url.slice(index + EVENT_PATH_COMPONENT.length).trim(`/`);
    if (eventTitle !== this.state.eventID) {
      this.loadFromEventTitle(eventTitle);
    }
  }

  loadFromEventTitle(eventTitle) {
    if (/^\d+$/.test(eventTitle)) {
      // returns true if eventTitle is purely numeric. (i.e., when routed from 'teamrwb://event/12345')
      this.loadFromEventID(eventTitle, false);
    } else {
      // extra check when loading a deeplinked event with an event already up
      if (eventTitle.includes('events/')) {
        const eventID = eventTitle.split('events/')[1];
        this.loadFromEventID(eventID, false);
      } else {
        // TODO: Confirm we can remove this check and/or see why this is being called when it shouldn't
        this.loadEventAndFeed(rwbApi.getPermalinkEvent(eventTitle));
      }
    }
  }

  loadFromEventID = (id, forceRefresh) => {
    this.loadEventAndFeed(rwbApi.getMobileEvent(id, forceRefresh), id);
  };

  deleteWorkout = (id) => {
    this.setState({workoutActionsheetVisible: false});
    const serverDelete = () => {
      this.setState({deletingWorkout: true});
      rwbApi
        .deleteWorkout(id)
        .then(() => {
          // no ranks for check-ins challenges, and progress increment/decrememnt is handled when changing event status
          if (this.state.requiredUnit !== CHALLENGE_TYPES.checkins) {
            this.getRank(this.state.challenge_id).then((rank) => {
              this.setState({
                place: rank.rank || 0,
                progress: parseFloat(rank.score) || 0,
              });
            });
          }
          this.setState({
            deletingWorkout: false,
            workoutRecorded: false,
          });
        })
        .catch((err) => {
          this.setState({deletingWorkout: false});
          Alert.alert('Team RWB', 'Error Deleting Workout');
        });
    };

    Alert.alert('Delete Workout', WORKOUT_DELETE_WARNING, [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => null,
      },
      {
        text: 'Yes',
        onPress: () => serverDelete(),
      },
    ]);
  };

  loadWorkout = (id) => {
    rwbApi
      .getWorkout(id)
      .then((result) => {
        if (result.data?.event_id != 0) {
          const hours = hoursMinutesSecondsFromMinutes(result.data.minutes)
            .hours;
          const minutes = hoursMinutesSecondsFromMinutes(result.data.minutes)
            .minutes;
          const seconds = hoursMinutesSecondsFromMinutes(result.data.minutes)
            .seconds;
          this.setState({
            workoutRecorded: true,
            miles: result.data.miles,
            steps: result.data.steps,
            hours,
            minutes,
            seconds,
          });
        }
      })
      .catch((err) => {
        Alert.alert('Team RWB', 'Error Loading Workout');
      });
  };

  getRank = (id) => {
    return rwbApi.getLeaderboardRank(id).then((rank) => {
      return rank;
    });
  };

  userJoinedChallenge = (id) => {
    return rwbApi.hasJoinedChallenge(id).then((response) => {
      return response;
    });
  };

  loadChallengeAndRank = (id) => {
    this.setState({loadingChallenge: true});
    Promise.all([
      rwbApi.getChallenge(id),
      this.getRank(id),
      this.userJoinedChallenge(id),
    ])
      .then(([challenge, rank, joined]) => {
        this.setState({
          requiredUnit: challenge.required_unit,
          goal: challenge?.goal,
          challengeEndTime: challenge.end_date,
          challengeName: challenge.name,
          challengeStartDate: challenge.start_date,
          place: rank.rank || 0,
          progress: parseFloat(rank.score) || 0,
          joined,
        });
      })
      .catch((err) => {
        Alert.alert('Team RWB', 'Error Loading Challenge');
      })
      .finally(() => {
        this.setState({loadingChallenge: false});
      });
  };

  loadEventAndFeed = (eventPromise, eventID) => {
    if (!this.state.isLoading) this.setState({isLoading: true});
    Promise.all([
      eventPromise,
      this.getFeed(eventID),
      this.loadAttendees(eventID),
    ]).then(([event, feed, attendees]) => {
      this.initializeScreen(event, feed);
      this.initializeAttendees(attendees);
      if (event.is_removed) {
        Alert.alert(
          'Team RWB',
          'This event you are looking for has been canceled and removed.',
          [
            {
              text: 'Ok',
              onPress: () => {
                NavigationService.back();
                if (
                  NavigationService.getCurrentScreenName() == 'EventsScreen'
                ) {
                  const refreshEvents = this.props.navigation.getParam(
                    'refreshEvents',
                    () => {},
                  );
                  refreshEvents();
                }
              },
            },
          ],
          {cancelable: false},
        );
      }
    });
  };

  alertLimitUsersDisplayed() {
    if (!this.alertLimitUsersDisplayedShowed) {
      this.alertLimitUsersDisplayedShowed = true;
      Alert.alert('Team RWB', `Could not display interested and going users`);
    }
  }

  loadAttendees(eventID) {
    return rwbApi.getAllMobileAttendees(eventID).catch((error) => {
      Alert.alert('Team RWB', 'There was an error loading event attendees.');
    });
  }

  initializeAttendees(attendees) {
    let going;
    let checked_in;
    let interested;
    const numberOfUsers = attendees.total_count;
    if (attendees.going) going = attendees.going.attendees;
    if (attendees.checked_in) checked_in = attendees.checked_in.attendees;
    if (attendees.interested) interested = attendees.interested.attendees;
    this.setState({
      going,
      checked_in,
      interested,
      numberOfUsers,
      attendeesLoading: false,
    });
  }

  // Fetch the attendance_status
  getAndInitializeAttendanceStatus(eventid) {
    rwbApi
      .getMobileAttendanceStatus(eventid)
      .then((json) => {
        if (
          !['checked_in', 'interested', 'going', 'none', null].includes(json)
        ) {
          throw new TypeError('Received unsupported status type.');
        }
        this.setState({
          attendanceStatus: json,
          attendanceStatusLoading: false,
        });
      })
      .catch((error) => {
        console.warn(error);
        Alert.alert(
          'Team RWB Server Error',
          "Sorry, we couldn't fetch your attendance status for this event. You are still able to check-in or mark yourself as going or interested in this event.",
        );
        this.setState({
          attendanceStatusLoading: false,
        });
      });
  }

  initializeScreen = (event, feed) => {
    const {
      id,
      description,
      location,
      is_all_day,
      is_virtual,
      is_recurring,
      start,
      end,
      name,
      link,
      status,
      category,
      host, // host object with id, first name, last name, title (if available), military info, profile picture, chapter, and if an eagle leader
      creator, // creator object with id, first name, last name, title (if available), military info, profile picture, chapter, and if an eagle leader
      photo_url,
      links,
      chapter_id,
      chapter_name,
      chapter_hosted,
      time_zone_id,
      virtual_event_category,
      is_removed,
      challenge_id,
    } = event;
    const dateAndTimes = formatDateAndTimes(event);

    // enable check in for all events is the user's local device has the same date or is later than the localized start time
    let eventToday = dateAndTimes.todayTime.isSameOrAfter(
      dateAndTimes.compareDate,
      'date',
    );

    const eventStartTime = dateAndTimes.startTime.format('YYYY-MM-DD HH:mm:ss');
    const eventEndTime = dateAndTimes.endTime.format('YYYY-MM-DD HH:mm:ss');

    if (challenge_id) {
      this.loadWorkout(id);
      this.loadChallengeAndRank(challenge_id);
    }
    this.setState({
      name,
      eventID: id,
      eventDate: dateAndTimes.date,
      startTimeUnformatted: dateAndTimes.startTimeUnformatted,
      endTimeUnformatted: dateAndTimes.endTimeUnformatted,
      eventStartTime,
      eventEndTime,
      eventLocation: location,
      eventToday,
      eventLink:
        link || isDev()
          ? `https://members-staging.teamrwb.org/events/${id}`
          : `https://members.teamrwb.org/events/${id}`, //no links returned from server in V2, so determine which server the events are on
      eventDescription: description,
      eventIsVirtual: is_virtual,
      eventIsRecurring: is_recurring,
      latitude: location.latitude,
      longitude: location.longitude,
      city: location.city,
      state: location.state,
      zip: location.zip,
      country: location.country,
      isLoading: false,
      refreshing: false,
      eventStatus: status,
      category,
      host,
      creator,
      photo_url,
      links,
      chapter_id,
      chapter_name,
      chapterHosted: chapter_hosted,
      eventFeed: feed,
      time_zone_id,
      virtual_event_category,
      is_all_day,
      isRemoved: is_removed,
      challenge_id,
    });

    // true when screen loaded via universal-link
    if (event.going) {
      this.initializeAttendees(event);
    }
    this.getAndInitializeAttendanceStatus(id);
  };

  linkToMap() {
    if (
      this.state.eventLocation.latitude === undefined ||
      this.state.eventLocation.longitude === undefined
    ) {
      return;
    }
    if (Platform.OS === 'android') {
      // 'geo:LAT,LONG?q=ADDRESS'
      const geoString = `geo:${this.state.eventLocation.latitude},${
        this.state.eventLocation.longitude
      }?q=${encodeURIComponent(this.state.eventLocation.address)}`;
      Linking.openURL(geoString);
    }
    if (Platform.OS === 'ios') {
      // 'http://maps.apple.com/?ll=LAT,LONG&q=ADDRESS'
      const geoString = `http://maps.apple.com/?ll=${
        this.state.eventLocation.latitude
      },${this.state.eventLocation.longitude}&q=${encodeURIComponent(
        this.state.eventLocation.address,
      )}`;
      Linking.openURL(geoString);
    }
  }

  onMapPress() {
    logMap();
    this.linkToMap();
  }

  onAddressPress() {
    logAddress();
    this.linkToMap();
  }
  onAttendeesPress() {
    const {
      host,
      eventToday,
      checked_in,
      interested,
      going,
      eventID,
    } = this.state;
    logAttendees();
    this.props.navigation.navigate('EventAttendees', {
      value: {
        host,
        today: eventToday,
        checked_in: checked_in,
        interested: interested,
        going: going,
        eventID,
      },
    });
  }

  linkToCalendar() {
    const {name, eventLocation, eventLink, eventDescription} = this.state;
    let start = moment(this.state.eventStartTime).utc();
    let end = moment(this.state.eventEndTime).utc();
    const eventConfig = {
      title: name,
      startDate: start.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      endDate: end.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      location: eventLocation.address
        ? displayFullAddress(
            eventLocation.address,
            eventLocation.city,
            eventLocation.state,
            eventLocation.zip,
            eventLocation.country,
          )
        : '',
      notes:
        Platform.OS === 'android'
          ? eventLink + '\n' + '\n' + eventDescription
          : eventDescription,
      url: Platform.OS === 'ios' ? eventLink : null,
    };
    let analyticsObj = {
      activity_sub_type: this.state.category,
      event_record_type: this.state.is_virtual ? 'virtual' : 'event',
      event_id: `${this.state.eventID}`,
      challenge_id: this.state.challenge_id !== 0 ? `${this.state.challenge_id}` : null,
      group_id: this.state.chapter_hosted ? `${this.state.chapter_id}` : null,
    };
    AddCalendarEvent.presentEventCreatingDialog(eventConfig)
      .then(
        (result) => {
          analyticsObj.execution_status = result.action === 'CANCELED' ? result.action.toLowerCase() : EXECUTION_STATUS.success;
          logCalendar(analyticsObj);
        },
      )
      .catch((error) => {
        analyticsObj.execution_status = EXECUTION_STATUS.failure;
        logCalendar(analyticsObj);
      });
  }

  addToAttendees(status) {
    let newUser = userProfile.getUserProfile();
    newUser.id = newUser.id;
    let listInfo = this.state[status];
    if (!listInfo.users) {
      listInfo.users = [];
    }
    listInfo.users = [newUser, ...listInfo];
    this.setState({
      [status]: listInfo.users,
    });
  }

  removeFromAttendees(status) {
    let newUser = userProfile.getUserProfile();
    newUser.id = newUser.id;
    let listInfo = this.state[status];
    if (!listInfo) return;
    if (!listInfo.user) listInfo.users = [];
    listInfo.users = [...listInfo];
    const index = getIndexFromID(newUser.id, listInfo.users);
    let list = listInfo.users;
    list.splice(index, 1);
    listInfo.users = list;
    this.setState({
      [status]: listInfo.users,
    });
  }

  setStatus(status) {
    requestReview();
    const prior_status = this.state.attendanceStatus;
    if (status === ATTENDANCE_SLUGS.checkedin) {
      if (this.state.requiredUnit === CHALLENGE_TYPES.checkins) {
        this.incrementChallengeProgress();
      }
    }
    this.setState({
      attendanceStatus: status,
      attendeesLoading: true,
    });
    const analyticsObj = {
      activity_sub_type: this.state.category,
      event_record_type: this.state.is_virtual ? 'virtual' : 'event',
      event_id: `${this.state.eventID}`,
      challenge_id: this.state.challenge_id !== 0 ? `${this.state.challenge_id}` : null,
      group_id: this.state.chapter_hosted ? `${this.state.chapter_id}` : null,
      click_text: status,
    }
    // initial status from the server is `null`
    if (prior_status === null) {
      this.setInitialStatus(status, prior_status, analyticsObj);
    } else {
      this.updateStatus(status, prior_status, analyticsObj);
    }
  }

  setInitialStatus = (status, prior_status, analyticsObj) => {
    rwbApi
      .setInitialMobileAttendanceStatus(this.state.eventID, status)
      .then((response) => {
        analyticsObj.execution_status = EXECUTION_STATUS.success;
        logEventStatus(analyticsObj);
        // Check to prevent stale data for devices who think they have a null attendance status
        if (response.status === 400) throw new Error('Already set status');
        this.updateEvent(this.state.eventID);
        this.addToAttendees(status);
        scheduleEventNotifications(
          {
            id: this.state.eventID,
            start: this.state.eventStartTime,
            name: this.state.name,
            location: this.state.eventLocation,
          },
          status,
          false,
        ); // set to true to receive notifications very quickly
        this.setState({
          numberOfUsers: parseInt(this.state.numberOfUsers) + 1,
        });
      })
      .catch((error) => {
        analyticsObj.execution_status = EXECUTION_STATUS.failure;
        logEventStatus(analyticsObj);
        if (status === ATTENDANCE_SLUGS.checkedin) {
          if (this.state.requiredUnit === CHALLENGE_TYPES.checkins) {
            this.decrementChallengeProgress();
          }
        }
        console.warn(error);
        this.setState({
          attendanceStatus: prior_status,
        });
        Alert.alert(
          'Issue with Team RWB Server',
          "Sorry, we're experiencing server difficulties. Please try again later, or contact Team RWB.",
        );
      })
      .finally(() => {
        this.setState({
          attendeesLoading: false,
        });
      });
  };

  updateStatus = (status, prior_status, analyticsObj) => {
    rwbApi
      .updateMobileAttendanceStatus(this.state.eventID, status)
      .then(() => {
        analyticsObj.execution_status = EXECUTION_STATUS.success;
        logEventStatus(analyticsObj);
        this.updateEvent(this.state.eventID);
        this.removeFromAttendees(prior_status);
        this.addToAttendees(status);
        scheduleEventNotifications(
          {
            id: this.state.eventID,
            start: this.state.eventStartTime,
            name: this.state.name,
            location: this.state.eventLocation,
          },
          status,
          false,
        ); // set to true to receive notifications very quickly
        // since 'none' is now a status (when removing status), the count needs to be approprately updated when updating
        if (prior_status === 'none') {
          this.setState({
            numberOfUsers: parseInt(this.state.numberOfUsers) + 1,
          });
        }
        return;
      })
      .catch((error) => {
        analyticsObj.execution_status = EXECUTION_STATUS.failure;
        logEventStatus(analyticsObj);
        if (status === ATTENDANCE_SLUGS.checkedin) {
          if (this.state.requiredUnit === CHALLENGE_TYPES.checkins) {
            this.decrementChallengeProgress();
          }
        }
        this.setState({
          attendanceStatus: prior_status,
        });
        Alert.alert(
          'Issue with Team RWB Server',
          "Sorry, we're experiencing server difficulties. Please try again later, or contact Team RWB.",
        );
      })
      .finally(() => {
        this.setState({
          attendeesLoading: false,
        });
      });
  };

  incrementChallengeProgress() {
    if (this.state.joined) {
      this.setState({progress: this.state.progress + 1});
    }
  }

  decrementChallengeProgress() {
    if (
      this.state.joined &&
      this.state.progress &&
      this.state.progress !== 0 &&
      this.state.requiredUnit === CHALLENGE_TYPES.checkins
    ) {
      this.setState({progress: this.state.progress - 1});
    }
  }

  deleteStatus() {
    const prior_status = this.state.attendanceStatus;
    let analyticsObj = {
      activity_sub_type: this.state.category,
      event_record_type: this.state.is_virtual ? 'virtual' : 'event',
      event_id: `${this.state.eventID}`,
      challenge_id: this.state.challenge_id !== 0 ? `${this.state.challenge_id}` : null,
      group_id: this.state.chapter_hosted ? `${this.state.chapter_id}` : null,
      click_text: `not ${prior_status}`
    };
    this.setState({
      attendanceStatus: 'none',
      attendeesLoading: true,
    });
    if (prior_status === ATTENDANCE_SLUGS.checkedin) {
      this.decrementChallengeProgress();
    }
    rwbApi
      .updateMobileAttendanceStatus(this.state.eventID, 'none')
      .then((response) => {
        analyticsObj.execution_status = EXECUTION_STATUS.success;
        logEventStatus(analyticsObj);
        this.updateEvent(this.state.eventID);
        this.removeFromAttendees(prior_status);
        clearEventNotifications({
          id: this.state.eventID,
        });
        this.setState({
          numberOfUsers: this.state.numberOfUsers - 1,
        });
        return;
      })
      .catch((error) => {
        analyticsObj.execution_status = EXECUTION_STATUS.failure;
        logEventStatus(analyticsObj);
        if (prior_status === ATTENDANCE_SLUGS.checkedin) {
          this.decrementChallengeProgress();
        }
        this.setState({
          attendanceStatus: prior_status,
        });
        Alert.alert(
          'Issue with Team RWB Server',
          "Sorry, we're experiencing server difficulties. Please try again later, or contact Team RWB.",
        );
      })
      .finally(() => {
        this.setState({
          attendeesLoading: false,
        });
      });
  }

  handleUpdate = (updated) => {
    this.setState({updateEventVisible: false});
    // only refresh data if there was an update
    if (updated) this.refreshEvent();
  };

  shareButton() {
    return (
      <TouchableOpacity
        style={globalStyles.coverShareButton}
        onPress={() => {
          const {eventLink, name} = this.state;
          logShare();
          Share.share(
            {
              message: Platform.OS === 'android' ? eventLink : name,
              title: 'Share This Event',
              url: eventLink,
            },
            {
              dialogTitle: 'Share This Event',
            },
          );
        }}
        accessibilityRole={'button'}
        accessible={true}
        accessibilityLabel={'Share this event.'}>
        <ShareIcon tintColor={RWBColors.magenta} style={styles.iconView} />
      </TouchableOpacity>
    );
  }

  cancelEventDialogue = () => {
    Alert.alert(
      'Cancel Event',
      'Are you sure you want to cancel this event?',
      [
        {text: 'Yes', onPress: () => this.cancelEvent()},
        {text: 'No', onPress: () => {}},
      ],
      {cancelable: true},
    );
  };

  cancelEvent = () => {
    const payload = {
      status: EVENT_STATUS.canceled,
    };
    let analyticsObj = {
      activity_sub_type: this.state.category,
      event_record_type: this.state.is_virtual ? 'virtual' : 'event',
      event_id: `${this.state.eventID}`,
      challenge_id: this.state.challenge_id !== 0 ? `${this.state.challenge_id}` : null,
      group_id: this.state.chapter_hosted ? `${this.state.chapter_id}` : null,
    };
    rwbApi
      .patchEvent(this.state.eventID, JSON.stringify(payload))
      .then(() => {
        analyticsObj.execution_status = EXECUTION_STATUS.success;
        logCancelEvent(analyticsObj);
        this.setState({eventStatus: EVENT_STATUS.canceled});
      })
      .catch((error) => {
        analyticsObj.execution_status = EXECUTION_STATUS.failure;
        logCancelEvent(analyticsObj);
        console.warn('Error canceling the event: ', error);
      });
  };

  removeEventDialogue = () => {
    Alert.alert(
      'Team RWB',
      'Are you sure you want to remove event from the Event List?',
      [
        {text: 'Yes', onPress: () => this.removeEvent()},
        {text: 'No', onPress: () => {}},
      ],
      {cancelable: true},
    );
  };

  removeEvent = () => {
    rwbApi
      .removeEvent(this.state.eventID)
      .then(() => {
        NavigationService.back();
        const refreshEvents = this.props.navigation.getParam(
          'refreshEvents',
          () => {},
        );
        refreshEvents();
      })
      .catch((error) => {
        console.warn('Error removing the event: ', error);
        Alert.alert('Team RWB', 'There was an error removing the event.');
      });
  };

  updateEventDetails = () => {
    this.setState({updateEventVisible: true});
  };

  getFeed = (eventID) => {
    return rwbApi
      .getEventFeed(eventID)
      .then((result) => {
        return result.data.results;
      })
      .catch((error) => {
        console.warn('error getting feed: ', error);
        Alert.alert(
          'Team RWB',
          'There was an error retrieving the event feed.',
        );
      });
  };

  reportEvent = () => {
    Alert.alert('Team RWB', 'Would you like to report this event?', [
      {
        text: 'No',
        style: 'destructive',
      },
      {
        text: 'Yes',
        onPress: () => {
          const reporterUserID = JSON.stringify({reporter: this.user.id});
          rwbApi
            .reportEvent(this.state.eventID, reporterUserID)
            .then(() => {
              Alert.alert('Team RWB', 'Your report has been sent', [
                {
                  text: 'Ok',
                },
              ]);
            })
            .catch((err) => {
              Alert.alert('Team RWB', REPORT_ERROR);
              console.warn(err);
            });
        },
      },
    ]);
  };

  handleLoadMore = () => {
    // only try to retrieve more from the feed if it is not already retrieving
    if (!this.state.isLoadingMore) {
      const posts = this.state.eventFeed;
      const lastPost = posts[posts.length - 1];
      this.setState({isLoadingMore: true});
      if (!this.state.retrievedLastPost) {
        rwbApi.getEventFeed(this.state.eventID, lastPost.id).then((result) => {
          if (result.data.results.length > 0)
            this.setState({
              eventFeed: [...this.state.eventFeed, ...result.data.results],
              isLoadingMore: false,
            });
          else this.setState({isLoadingMore: false, retrievedLastPost: true});
        });
      } else this.setState({isLoadingMore: false});
    }
  };

  closePostView = (updated) => {
    this.setState({createPostVisible: false, shareWorkout: false});
    if (updated) this.refreshEvent();
  };

  closeRecordWorkoutView = (updated) => {
    this.setState({recordWorkoutVisible: false});
    if (updated) {
      // after submitting a workout, get relevant leaderboard information if not a check-ins challenge
      if (this.state.requiredUnit !== CHALLENGE_TYPES.checkins) {
        this.setState({loadingChallenge: true}); //
        this.getRank(this.state.challenge_id).then((rank) => {
          this.setState({
            place: rank.rank || 0,
            progress: parseFloat(rank.score) || 0,
          });
        });
      }
    }
  };

  shareAndDeleteModal = () => {
    const id = this.state.eventID;
    Platform.OS === 'ios'
      ? ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', `Share Workout`, `Delete Workout`],
            cancelButtonIndex: 0,
            destructiveButtonIndex: 2,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) {
              this.setState({createPostVisible: true, shareWorkout: true});
            } else if (buttonIndex === 2) {
              this.deleteWorkout(id);
            }
          },
        )
      : this.setState({workoutActionsheetVisible: true});
  };

  render() {
    const {
      attendanceStatus,
      attendanceStatusLoading,
      name,
      eventStartTime,
      eventEndTime,
      eventLocation,
      eventIsVirtual,
      eventToday,
      eventDescription,
      eventIsRecurring,
      latitude,
      longitude,
      isLoading,
      attendeesLoading,
      going,
      interested,
      checked_in,
      numberOfUsers,
      refreshing,
      eventStatus,
      mapVisible,
      host,
      links,
      chapter_name,
      time_zone_id,
      virtual_event_category,
      is_all_day,
      isRemoved,
      challenge_id,
      workoutRecorded,
      miles,
      steps,
      hours,
      minutes,
      seconds,
      requiredUnit,
      goal,
      challengeEndTime,
      challengeName,
      challengeStartDate,
      place,
      progress,
      loadingChallenge,
      deletingWorkout,
      shareWorkout,
    } = this.state;
    const startDateTime = moment(eventStartTime);
    const endDateTime = moment(eventEndTime);
    return (
      <View style={{flex: 1, backgroundColor: RWBColors.white}}>
        <FlatList
          onRefresh={this.refreshEvent}
          refreshing={refreshing}
          ListHeaderComponent={
            <View
              style={{
                borderBottomColor: RWBColors.grey20,
                borderBottomWidth: 1,
              }}
              showsVerticalScrollIndicator={false}
              alwaysBounceVertical={false}>
              {(isLoading && !refreshing) || !host ? (
                <FullscreenSpinner />
              ) : (
                <View style={{paddingBottom: '5%'}}>
                  {/* Cover Image */}
                  <View>
                    <TouchableOpacity
                      style={globalStyles.coverBackButton}
                      accessibilityRole={'button'}
                      accessible={true}
                      accessibilityLabel={'Go back to events list.'}
                      onPress={NavigationService.back}>
                      <ChevronBack
                        tintColor={RWBColors.magenta}
                        style={globalStyles.chevronBackImage}
                      />
                    </TouchableOpacity>
                    {this.shareButton()}
                    <Image
                      style={{
                        width: '100%',
                        height: (Dimensions.get('window').width * 2) / 3,
                      }}
                      source={
                        this.state.photo_url
                          ? {uri: this.state.photo_url}
                          : defaultEventPhoto(this.state.category)
                      }
                    />
                  </View>
                  {/* Under Image */}
                  <View style={{margin: '5%'}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <View style={{flex: 1}}>
                        <Text style={globalStyles.h1}>
                          {name ? name.toUpperCase() : ''}
                        </Text>
                      </View>
                      {this.user.id !== host.id ? (
                        <TouchableOpacity
                          accessible={true}
                          accessibilityLabel={'Report Event'}
                          accessibilityRole={'button'}
                          onPress={this.reportEvent}>
                          <PostOptionIcon height="24" width="24" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    <Text style={[globalStyles.h5]}>
                      {this.state.chapter_name}
                    </Text>
                    {__DEV__ ? (
                      <Text
                        style={[
                          globalStyles.h1,
                          styles.detailBlock,
                        ]}>{`Event ID: ${this.state.eventID}`}</Text>
                    ) : null}
                    {/* Open to calender */}
                    <TouchableOpacity
                      style={[styles.detailBlock, {flexDirection: 'row'}]}
                      onPress={
                        eventStatus === EVENT_STATUS.canceled
                          ? null
                          : () => this.linkToCalendar()
                      }
                      accessibilityRole={'button'}
                      accessible={true}
                      accessibilityLabel={'Add event to calendar'}>
                      <CalenderIcon
                        style={[styles.iconView, {marginRight: 5}]}
                      />
                      <View>
                        <Text style={globalStyles.bodyCopyForm}>
                          {startDateTime.format('ddd, MMM DD, YYYY')}
                        </Text>
                        <View style={{flexDirection: 'row'}}>
                          <Text style={globalStyles.bodyCopyForm}>
                            {!is_all_day
                              ? `${startDateTime.format(
                                  'h:mm A',
                                )} – ${endDateTime.format('h:mm A')}`
                              : 'All Day Event'}
                          </Text>
                          {eventIsRecurring && (
                            <RecurringEventIcon
                              style={[styles.iconView, {marginLeft: 5}]}
                            />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      accessibilityRole={'button'}
                      accessible={true}
                      accessibilityLabel={'View host'}
                      onPress={() =>
                        NavigationService.navigateIntoInfiniteStack(
                          'EventsProfileAndEventDetailsStack',
                          'profile',
                          {id: host.id},
                        )
                      }>
                      <View
                        style={[styles.detailBlock, {flexDirection: 'row'}]}>
                        <Image
                          style={[globalStyles.mediumProfileImage]}
                          source={
                            host.photo_url
                              ? {uri: host.photo_url}
                              : require('../../shared/images/DefaultProfileImg.png')
                          }
                        />
                        <View style={{alignSelf: 'center'}}>
                          <View style={{flexDirection: 'row'}}>
                            {host.is_eagle_leader ? (
                              <EagleLeaderIcon
                                style={[styles.iconView, {marginRight: 2}]}
                              />
                            ) : null}
                            <Text
                              style={[
                                globalStyles.h5,
                                {
                                  marginBottom: 5,
                                  marginLeft: !host.is_eagle_leader ? 5 : null,
                                },
                              ]}>
                              {host.is_eagle_leader
                                ? 'Eagle Leader'
                                : 'Event Host'}
                            </Text>
                          </View>
                          <View style={{flexDirection: 'row'}}>
                            <Text
                              style={[
                                globalStyles.h3,
                                {marginLeft: 5},
                              ]}>{`${host.first_name} ${host.last_name}`}</Text>
                            {/* wait for backend check if this is an admin. Confirm how it should look. */}
                            {/* <EagleLeaderIcon
                                  style={[styles.iconView, {marginRight: 2}]}
                              /> */}
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.detailBlock}>
                      <TouchableOpacity
                        style={{flexDirection: 'row'}}
                        onPress={() => this.onAddressPress()}
                        accessibilityRole={'button'}
                        accessible={true}
                        accessibilityLabel={'View location location on map'}>
                        <LocationIcon
                          style={[styles.iconView, {marginRight: 5}]}
                        />
                        <Text style={globalStyles.bodyCopyForm}>
                          {eventIsVirtual || eventLocation.address === null
                            ? `Virtual ${
                                virtual_event_category
                                  ? capitalizeFirstLetter(
                                      virtual_event_category,
                                    ).slice(0, -1)
                                  : 'Event'
                              }` // types come in as "challenges" and "workouts", so capitlize the first letter and remove the "s" at the end
                            : displayFullAddress(
                                eventLocation.address,
                                eventLocation.city,
                                eventLocation.state,
                                eventLocation.zip,
                                eventLocation.country,
                              )}
                        </Text>
                        {eventIsVirtual && (
                          <VirtualEventIcon
                            style={[styles.iconView, {marginLeft: 5}]}
                          />
                        )}
                      </TouchableOpacity>
                      {!eventIsVirtual &&
                      !(latitude === 0 && longitude === 0) ? (
                        <TouchableOpacity
                          onPress={() =>
                            this.setState({mapVisible: !this.state.mapVisible})
                          }>
                          <Text style={[globalStyles.link, {marginLeft: 21}]}>
                            {mapVisible ? 'Hide Map' : 'View Map'}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    {mapVisible ? (
                      <View
                        style={{
                          height: Dimensions.get('window').width * 0.75,
                          paddingBottom: 25,
                        }}>
                        <MapView
                          provider={PROVIDER_GOOGLE}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 5,
                          }}
                          initialRegion={{
                            latitude: parseFloat(latitude),
                            longitude: parseFloat(longitude),
                            latitudeDelta: 0.025,
                            longitudeDelta: 0.015,
                          }}
                          scrollEnabled={false}
                          zoomEnabled={false}
                          pitchEnabled={false}
                          onPress={this.onMapPress}>
                          <Marker
                            coordinate={{
                              latitude: parseFloat(latitude),
                              longitude: parseFloat(longitude),
                            }}
                            anchor={{x: 0.5, y: 1}}
                            centerOffset={{x: 0, y: -20}}
                            onPress={this.onMapPress}>
                            <MapMarkerIcon style={styles.mapIconView} />
                          </Marker>
                        </MapView>
                      </View>
                    ) : null}
                    {challenge_id !== 0 ? (
                      <View style={styles.detailBlock}>
                        <EventChallengeCard
                          challengeId={challenge_id}
                          loading={loadingChallenge}
                          metric={requiredUnit}
                          end_date={challengeEndTime}
                          name={challengeName}
                          start_date={challengeStartDate}
                          place={place}
                          progress={progress}
                          goal={goal}
                        />
                      </View>
                    ) : null}
                    {eventStatus === EVENT_STATUS.canceled ? (
                      <View>
                        <View
                          style={[
                            styles.canceledAndRemovedContainer,
                            {backgroundColor: RWBColors.white},
                            styles.detailBlock,
                          ]}>
                          <Text
                            style={[
                              globalStyles.h4,
                              {color: RWBColors.magenta, top: 2},
                            ]}>
                            {'This Event Has Been Canceled'.toUpperCase()}
                          </Text>
                        </View>
                        {!isRemoved && this.user.id === host.id ? (
                          <TouchableOpacity
                            style={[
                              styles.canceledAndRemovedContainer,
                              {backgroundColor: RWBColors.magenta},
                              styles.detailBlock,
                            ]}
                            onPress={() => this.removeEventDialogue()}>
                            <Text
                              style={[
                                globalStyles.h4,
                                {color: RWBColors.white, top: 2},
                              ]}>
                              {'Remove Event from Event List'.toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    ) : this.user.id === host.id ? (
                      // prevent modifying event after it is over
                      isEventOver({
                        is_virtual: eventIsVirtual,
                        time_zone_id,
                        end: endDateTime,
                      }) ? null : (
                        <View
                          style={[
                            styles.detailBlock,
                            {
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                            },
                          ]}>
                          <TouchableOpacity
                            style={[
                              styles.toggle,
                              {
                                backgroundColor: RWBColors.magenta,
                                opacity: attendanceStatusLoading ? 0.5 : 1,
                              },
                            ]}
                            onPress={() => this.cancelEventDialogue()}
                            disabled={attendanceStatusLoading}
                            accessibilityRole={'button'}
                            accessible={true}
                            accessibilityLabel={'Cancel this event.'}>
                            <CanceledEventIcon
                              style={[styles.iconView, {marginBottom: 5}]}
                              tintColor={RWBColors.white}
                            />
                            <Text
                              style={[
                                globalStyles.h4,
                                {color: RWBColors.white},
                              ]}>
                              {'Cancel'.toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.toggle,
                              {
                                backgroundColor: RWBColors.navy,
                                opacity: attendanceStatusLoading ? 0.5 : 1,
                              },
                            ]}
                            onPress={() => this.updateEventDetails()}
                            disabled={attendanceStatusLoading}
                            accessibilityRole={'button'}
                            accessible={true}
                            accessibilityLabel={'Update this event.'}>
                            <EditIcon
                              style={[styles.iconView, {marginBottom: 5}]}
                              tintColor={RWBColors.white}
                            />
                            <Text
                              style={[
                                globalStyles.h4,
                                {color: RWBColors.white},
                              ]}>
                              {'Update'.toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )
                    ) : eventToday ? (
                      <TouchableOpacity
                        style={[
                          styles.toggleLong,
                          styles.detailBlock,
                          attendanceStatus === ATTENDANCE_SLUGS.checkedin
                            ? styles.toggleSelected
                            : styles.toggleDefault,
                          {opacity: attendanceStatusLoading ? 0.5 : 1},
                        ]}
                        onPress={() => {
                          attendanceStatus === ATTENDANCE_SLUGS.checkedin
                            ? this.deleteStatus()
                            : this.setStatus('checked_in');
                        }}
                        disabled={attendanceStatusLoading}>
                        {attendanceStatus === ATTENDANCE_SLUGS.checkedin ? (
                          <CheckIcon
                            style={[styles.iconView, {marginBottom: 5}]}
                            tintColor={RWBColors.white}
                          />
                        ) : (
                          <TicketIcon
                            style={[styles.iconView, {marginBottom: 5}]}
                            tintColor={RWBColors.grey}
                          />
                        )}
                        <Text
                          style={[
                            globalStyles.h4,
                            attendanceStatus === ATTENDANCE_SLUGS.checkedin
                              ? styles.toggleTextSelected
                              : styles.toggleTextDefault,
                          ]}>
                          {attendanceStatus === ATTENDANCE_SLUGS.checkedin
                            ? 'Checked In'.toUpperCase()
                            : 'Check In'.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View
                        style={[
                          styles.detailBlock,
                          {
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          },
                        ]}>
                        <TouchableOpacity
                          style={[
                            styles.toggle,
                            attendanceStatus === ATTENDANCE_SLUGS.going
                              ? styles.toggleSelected
                              : styles.toggleDefault,
                            {opacity: attendanceStatusLoading ? 0.5 : 1},
                          ]}
                          onPress={() => {
                            attendanceStatus === ATTENDANCE_SLUGS.going
                              ? this.deleteStatus()
                              : this.setStatus(ATTENDANCE_SLUGS.going);
                          }}
                          disabled={attendanceStatusLoading}>
                          {attendanceStatus === ATTENDANCE_SLUGS.going ? (
                            <CheckIcon
                              style={[styles.iconView, {marginBottom: 5}]}
                              tintColor={RWBColors.white}
                            />
                          ) : (
                            <AttendingIcon
                              style={[styles.iconView, {marginBottom: 5}]}
                              tintColor={RWBColors.grey}
                            />
                          )}
                          <Text
                            style={[
                              globalStyles.h4,
                              attendanceStatus === ATTENDANCE_SLUGS.going
                                ? styles.toggleTextSelected
                                : styles.toggleTextDefault,
                            ]}>
                            {'Going'.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.toggle,
                            attendanceStatus === ATTENDANCE_SLUGS.interested
                              ? styles.toggleSelected
                              : styles.toggleDefault,
                            {opacity: attendanceStatusLoading ? 0.5 : 1},
                          ]}
                          onPress={() => {
                            attendanceStatus === ATTENDANCE_SLUGS.interested
                              ? this.deleteStatus()
                              : this.setStatus(ATTENDANCE_SLUGS.interested);
                          }}
                          disabled={attendanceStatusLoading}>
                          {attendanceStatus === ATTENDANCE_SLUGS.interested ? (
                            <CheckIcon
                              style={[styles.iconView, {marginBottom: 5}]}
                              tintColor={RWBColors.white}
                            />
                          ) : (
                            <InterestedIcon
                              style={[styles.iconView, {marginBottom: 5}]}
                              tintColor={RWBColors.grey}
                            />
                          )}
                          <Text
                            style={[
                              globalStyles.h4,
                              attendanceStatus === ATTENDANCE_SLUGS.interested
                                ? styles.toggleTextSelected
                                : styles.toggleTextDefault,
                            ]}>
                            {'Interested'.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {challenge_id !== 0 &&
                      eventStatus !== EVENT_STATUS.canceled &&
                      eventToday &&
                      (this.user.id === host.id ||
                        attendanceStatus === ATTENDANCE_SLUGS.checkedin) && (
                        <View style={styles.detailBlock}>
                          {!workoutRecorded ? (
                            <TouchableOpacity
                              style={[styles.toggleLong, styles.toggleDefault]}
                              onPress={() =>
                                this.setState({recordWorkoutVisible: true})
                              }>
                              <Text
                                style={[
                                  globalStyles.h4,
                                  styles.toggleTextDefault,
                                ]}>
                                {'Record Workout'.toUpperCase()}
                              </Text>
                            </TouchableOpacity>
                          ) : workoutRecorded ? (
                            <WorkoutCard
                              miles={miles}
                              steps={steps}
                              hours={hours}
                              minutes={minutes}
                              seconds={seconds}
                              shareAndDeleteModal={() =>
                                this.shareAndDeleteModal()
                              }
                              deleting={deletingWorkout}
                            />
                          ) : null}
                        </View>
                      )}
                    {__DEV__ ? (
                      <View>
                        <TouchableOpacity
                          style={[
                            styles.toggle,
                            styles.toggleDefault,
                            {marginBottom: 8},
                          ]}
                          onPress={() => {
                            scheduleEventNotifications(
                              {
                                id: this.state.eventID,
                                start: this.state.eventStartTime,
                                name: this.state.name,
                                location: this.state.eventLocation,
                              },
                              ATTENDANCE_SLUGS.going,
                              true,
                            );
                            return;
                          }}>
                          <Text>DEBUG simulated going</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                    <UserBadgesContainer
                      usersLoading={attendeesLoading}
                      onPress={this.onAttendeesPress}
                      numberOfUsers={numberOfUsers}
                      userList={[...going, ...interested, ...checked_in]}
                    />

                    <View>
                      <RWBhtmlView htmlContent={eventDescription} />
                    </View>

                    {links && links.length ? (
                      <View style={{marginTop: 10}}>
                        <Text style={globalStyles.h3}>Event Links:</Text>
                        <MobileLinkHandler links={links} />
                      </View>
                    ) : null}
                  </View>

                  {/* Comment View when out of MVP cycle */}
                </View>
              )}
            </View>
          }
          data={this.state.eventFeed}
          onEndReached={this.handleLoadMore}
          renderItem={({item}) => (
            <FeedCard
              type="post"
              navigation={this.props.navigation}
              data={item}
              eventID={this.state.eventID}
              refreshFeed={this.refreshEvent}
            />
          )}
          ListFooterComponent={
            this.state.isLoadingMore ? (
              <View>
                <ActivityIndicator size="large" />
              </View>
            ) : null
          }
        />

        <View>
          {!this.state.createPostVisible && !this.user.anonymous_profile ? (
            <View style={globalStyles.addButtonContainer}>
              <View>
                <TouchableOpacity
                  onPress={() => this.setState({createPostVisible: true})}
                  style={globalStyles.addButton}>
                  <AddIcon style={{height: 24, width: 24}} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          {this.state.workoutActionsheetVisible ? (
            <AndroidAction
              cancelable={true}
              hide={() => this.setState({workoutActionsheetVisible: false})}>
              {
                <>
                  <RWBSheetButton
                    text={`Share Workout`}
                    onPress={() =>
                      this.setState({
                        createPostVisible: true,
                        shareWorkout: true,
                        workoutActionsheetVisible: false,
                      })
                    }
                  />
                  <RWBSheetButton
                    text={`Delete Workout`}
                    onPress={() => this.deleteWorkout(this.state.eventID)}
                  />
                </>
              }
            </AndroidAction>
          ) : null}

          {/* Adding a post to an event */}
          <Modal
            visible={this.state.createPostVisible}
            onRequestClose={() =>
              this.setState({createPostVisible: false, shareWorkout: false})
            }>
            {challenge_id && workoutRecorded && shareWorkout ? (
              <CreatePost
                type="user"
                id={challenge_id}
                onClose={this.closePostView}
                refreshFeed={this.refreshEvent}
                challengeId={challenge_id}
                eventID={this.state.eventID}
                eventName={name}
                chapterName={chapter_name}
                eventStartTime={eventStartTime}
                miles={miles}
                steps={steps}
                hours={hours}
                minutes={minutes}
                seconds={seconds}
              />
            ) : (
              <CreatePost
                type="event"
                id={this.state.eventID}
                onClose={this.closePostView}
                refreshFeed={this.refreshEvent}
              />
            )}
          </Modal>
          {/* Updating an event */}
          <Modal
            visible={this.state.updateEventVisible}
            onRequestClose={() => this.setState({updateEventVisible: false})}>
            <CreateEventView
              title={name}
              eventID={this.state.eventID}
              eventDate={
                this.state.eventDate ||
                moment(eventStartTime).format('YYYY-MM-DD')
              } // use start time for all_day_events (TODO: Look into eventDate in general, might just use startTime)
              eventStartTime={
                this.state.startTimeUnformatted ||
                moment(eventStartTime).format('HH:mm:ss')
              }
              eventEndTime={
                this.state.endTimeUnformatted ||
                moment(eventEndTime).format('HH:mm:ss')
              }
              eventLocation={this.state.eventLocation.address}
              eventDescription={eventDescription}
              eventImage={this.state.photo_url}
              latitude={latitude}
              longitude={longitude}
              thoroughfare={this.state.thoroughfare}
              city={this.state.city}
              zip={this.state.zip}
              state={this.state.state}
              country={this.state.country}
              activityCategory={this.state.category}
              updating={true}
              links={links}
              chapterHosted={this.state.chapterHosted}
              close={this.handleUpdate}
              eventHost={this.state.host}
              eventCreator={this.state.creator}
              isVirtual={eventIsVirtual}
              isAllDayEvent={is_all_day}
              groupId={this.state.chapter_id}
              challenge_id={this.state.challenge_id}
              groupName={this.state.chapter_name}
              virtualEventCategory={virtual_event_category}
              refreshEvents={this.props.navigation.getParam(
                'refreshEvents',
                () => {},
              )}
            />
          </Modal>
          {/* Recording a workout */}
          <Modal
            visible={this.state.recordWorkoutVisible}
            onRequestClose={() => this.setState({recordWorkoutVisible: false})}>
            <RecordWorkoutView
              id={this.state.eventID}
              onClose={this.closeRecordWorkoutView}
              refreshEvent={this.refreshEvent}
              requiredUnit={this.state.requiredUnit}
              eventName={this.state.name}
              chapterName={this.state.chapter_name}
              eventStartTime={this.state.eventStartTime}
            />
          </Modal>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  toggle: {
    borderRadius: 2,
    width: '48.75%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleLong: {
    borderRadius: 2,
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleSelected: {
    backgroundColor: RWBColors.navy,
  },
  toggleTextSelected: {
    color: RWBColors.white,
  },
  toggleDefault: {
    backgroundColor: RWBColors.grey20,
  },
  toggleTextDefault: {
    color: RWBColors.grey,
  },
  detailBlock: {
    marginBottom: 15,
  },
  iconView: {
    width: 16,
    height: 16,
  },
  mapIconView: {
    width: 40,
    height: 40,
  },
  seperator: {
    left: '-5%',
    height: 0,
    width: Dimensions.get('window').width,
    borderBottomWidth: 2,
    borderBottomColor: RWBColors.grey8,
    marginVertical: 10,
  },
  canceledAndRemovedContainer: {
    borderRadius: 2,
    borderWidth: 2,
    borderColor: RWBColors.magenta,
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
