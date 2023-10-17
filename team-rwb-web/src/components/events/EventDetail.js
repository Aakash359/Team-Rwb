import React, {useState, useEffect} from 'react';
import {useParams, Link, useHistory, useLocation} from 'react-router-dom';
import moment from 'moment';
import {IoIosCalendar as CalendarIcon} from 'react-icons/io';
import {TiCancel as CancelIcon} from 'react-icons/ti';
import {GoPencil as UpdateIcon} from 'react-icons/go';
import CheckIcon from '../svgs/CheckIcon';
import PostOptionIcon from '../svgs/PostOptionIcon';
import InterestedIcon from '../svgs/InterestedIcon';
import Loading from '../Loading';
import styles from './EventDetail.module.css';
import {
  MdLocationOn as LocationIcon,
  MdKeyboardArrowRight as AttendeesCountIcon,
} from 'react-icons/md';

import {
  logAttendees,
  logCancelEvent,
  logShare,
  logAddress,
  EXECUTION_STATUS,
  logEventStatus,
} from '../../../../shared/models/Analytics';
import {
  displayFullAddress,
  defaultEventPhoto,
  defaultUserPhoto,
  localizeDate,
  localizeTime,
} from '../../../../shared/utils/Helpers';

import CreatePostButton from '../feed/CreatePostButton';

import {rwbApi} from '../../../../shared/apis/api';

import {mergeAttendees} from '../../../../shared/utils/Helpers';

import {userProfile} from '../../../../shared/models/UserProfile';
import FeedList from '../feed/FeedList';
import {ATTENDANCE_SLUGS} from '../../../../shared/constants/AttendanceSlugs';
import CreateEvent from './CreateEvent';
import VirtualEventIcon from '../svgs/VirtualEventIcon';
import AttendingIcon from '../svgs/AttendingIcon';
import GoogleMapView from '../GoogleMapView';
import {hasReachedBottom} from '../../BrowserUtil';
import {REPORT_ERROR} from '../../../../shared/constants/ErrorMessages';
import AvatarList from '../AvatarList';
import {isEventOver} from '../../../../shared/utils/EventHelpers';
import DetailHeader from '../DetailHeader';
import WorkoutCard from './WorkoutCard';
import RankingRow from '../challenges/RankingRow';
import ChevronRightIcon from '../svgs/ChevronRightIcon';
import CreatePost from '../feed/CreatePost';
import {getChallengeStatusText} from '../../../../shared/utils/ChallengeHelpers';
import {CHALLENGE_TYPES} from '../../../../shared/constants/ChallengeTypes';
import ChallengeProgressBar from '../challenges/ChallengeProgressBar';
import {hoursMinutesSecondsFromMinutes} from '../../../../shared/utils/ChallengeHelpers';
import {WORKOUT_DELETE_WARNING} from '../../../../shared/constants/OtherMessages';
import EVENT_STATUS from '../../../../shared/constants/EventStatus';

const EventDetail = ({refreshEvents}) => {
  const {eventId} = useParams();
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [totalAttendees, setTotalAttendees] = useState([]);
  const [total_count, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [retrievedLastPost, setRetrievedLastPost] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [eventData, setEventData] = useState({
    name: '',
    host: '',
    chapter_hosted: '',
    chapter_name: '',
    location: '',
    start: '',
    end: '',
    category: '',
    links: [],
    status: null,
    challenge_id: 0,
  });
  const [isUpdate, setIsUpdate] = useState(false);
  const [eventFeed, setEventFeed] = useState([]);
  const [userDataAttendance, setUserDataAttendance] = useState(null); // the data from the user returned by getAllAttendees will be kept here, so we don't have to call that function every time the status change
  const [mapShown, setMapShown] = useState(false);
  const [isRemoved, setIsRemoved] = useState(null);
  const [optionsOverlayVisible, setOptionsOverlayVisible] = useState(false);
  const [workoutState, setWorkoutState] = useState({
    workoutRecorded: false,
    miles: 0,
    steps: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [requiredUnit, setRequiredUnit] = useState('');
  const [challengeEndDate, setChallengeEndDate] = useState('');
  const [challengeStartDate, setChallengeStartDate] = useState('');
  const [challengeName, setChallengeName] = useState('');
  const [rank, setRank] = useState('');
  const [progress, setProgress] = useState('');
  const [goal, setGoal] = useState('');
  const [joined, setJoined] = useState(false);

  const user = userProfile.getUserProfile();
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    loadEventDetails();
    getAttendanceStatus();
    getFeed(eventId);
    const getAttendees = (attempt) => {
      if (attempt >= 3) {
        alert(
          'There was a problem with the server. Some event attendees will not be displayed.',
        );
        return;
      }

      getAllAttendees();
    };

    getAttendees(attempt);
  }, [eventId, isUpdate]);

  let attempt = 0;

  const loadMorePosts = () => {
    // only try to retrieve more from the feed if it is not already retrieving
    if (!isLoadingMore) {
      const posts = eventFeed;
      const lastPost = posts[posts.length - 1];
      setIsLoadingMore(true);
      if (!retrievedLastPost) {
        if (!eventData.id || !lastPost?.id) return;
        rwbApi.getEventFeed(eventData.id, lastPost.id).then((result) => {
          if (result.data.results.length > 0) {
            setEventFeed([...eventFeed, ...result.data.results]);
            setIsLoadingMore(false);
          } else {
            setIsLoadingMore(false);
            setRetrievedLastPost(true);
          }
        });
      } else setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', trackScrolling);
    return () => {
      window.removeEventListener('scroll', trackScrolling);
    };
  }, [loadMorePosts]);

  useEffect(() => {
    if (eventData?.challenge_id !== 0) {
      loadWorkout(eventId);
      loadChallengeAndRank(eventData?.challenge_id);
    }
  }, [eventData]);

  useEffect(() => {
    if (location.state?.refreshEvents === true) {
      refreshEvents();
    }
  }, []);

  const loadWorkout = (id) => {
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
          setWorkoutState({
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
        console.error('Team RWB', 'Error Loading Workout');
      });
  };

  const loadChallengeAndRank = (id) => {
    const loadChallenge = rwbApi.getChallenge(id);
    const loadRank = rwbApi.getLeaderboardRank(id);
    const userJoinedChallenge = rwbApi.hasJoinedChallenge(id);
    Promise.all([loadChallenge, loadRank, userJoinedChallenge])
      .then(([challenge, rank, joined]) => {
        setRequiredUnit(challenge.required_unit);
        setGoal(challenge.goal);
        setChallengeEndDate(challenge.end_date);
        setChallengeStartDate(challenge.start_date);
        setChallengeName(challenge.name);
        setRank(rank.rank);
        setProgress(parseFloat(rank.score));
        setJoined(joined);
        setLoading(false);
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  const trackScrolling = (event) => {
    event.preventDefault();
    const wrappedElement = document.getElementById('root');
    if (hasReachedBottom(wrappedElement)) {
      loadMorePosts();
    }
  };

  const getAllAttendees = () =>
    rwbApi
      .getAllMobileAttendees(eventId)
      .then((data) => {
        if (data) {
          const {mergedAttendees, totalCount} = mergeAttendees(data);
          if (!userDataAttendance) {
            const userData = mergedAttendees.find((el) => el.id === user.id);
            if (userData) setUserDataAttendance(userData);
          }
          setTotalAttendees(mergedAttendees);
          setTotalCount(totalCount);
          // setLoading(false);
        }
      })
      .catch((error) => {
        if (attempt < 3) {
          console.warn('error', error);
        }
        setLoading(false);
      });

  const getAttendanceStatus = () => {
    rwbApi.getMobileAttendanceStatus(eventId).then((status) => {
      if (!status) return;
      setAttendanceStatus(status);
    });
  };

  const loadEventDetails = () => {
    rwbApi.getMobileEvent(eventId).then((response) => {
      setEventData(response);
      setIsRemoved(response.is_removed);
      if (response.is_removed) {
        window.alert(
          'Team RWB: This event you are looking for has been canceled and removed.',
        );
        history.push('/events');
        refreshEvents();
      }
      if (!response.challenge_id || response.challenge_id === '')
        setLoading(false);
    });
  };

  const getFeed = (eventID) => {
    // prepending the most recent result mixes up reactions
    // to avoid that, clear out everything and reload everything
    const currentFeed = eventFeed;
    setEventFeed([]);
    return rwbApi
      .getEventFeed(eventID)
      .then((result) => {
        // if a feed is null, store an empty array to ensure no issues trying to load more
        setEventFeed(result.data.results || []);
      })
      .catch((error) => {
        console.warn('error getting feed: ', error);
        setEventFeed(currentFeed);
        alert('There was an error retrieving the event feed.');
      });
  };

  const mergeNewPost = (newPost) => {
    // Not returning user data and breaks the app
    // setEventFeed((oldPosts) => [...oldPosts, newPost]);
    getFeed(eventId);
  };

  const deleteAttendanceStatus = async () => {
    const prevAttendance = attendanceStatus;
    setAttendanceStatus('none');
    let analyticsObj = {
      activity_sub_type: eventData.category,
      event_record_type: eventData.is_virtual ? 'virtual' : 'event',
      event_id: `${eventData.id}`,
      challenge_id: eventData.challenge_id !== 0 ? `${eventData.challenge_id}` : null,
      group_id: eventData.chapter_hosted ? `${eventData.chapter_id}` : null,
      click_text: `Not ${prevAttendance}`,
    };
    decrementCheckIns();
    if (userDataAttendance) {
      const filteredAttendees = totalAttendees.filter(
        (attendee) => attendee.id !== userDataAttendance.id,
      );
      setTotalAttendees(filteredAttendees);
    }
    const result = await rwbApi.updateMobileAttendanceStatus(eventId, 'none');
    if (!result) {
      setAttendanceStatus(prevAttendance);
      incrementCheckIns();
      analyticsObj.execution_status = EXECUTION_STATUS.success;
      logEventStatus(analyticsObj);
    }
    else {
      setTotalCount(total_count - 1);
      analyticsObj.execution_status = EXECUTION_STATUS.failure;
      logEventStatus(analyticsObj);
    }
    if (!userDataAttendance) {
      getAllAttendees();
    }
  };

  const updateAttendanceStatus = async (id, status) => {
    setAttendanceStatus(status);
    let analyticsObj = {
      activity_sub_type: eventData.category,
      event_record_type: eventData.is_virtual ? 'virtual' : 'event',
      event_id: `${eventData.id}`,
      challenge_id: eventData.challenge_id !== 0 ? `${eventData.challenge_id}` : null,
      group_id: eventData.chapter_hosted ? `${eventData.chapter_id}` : null,
      click_text: status,
    };
    if (status === ATTENDANCE_SLUGS.checkedin) {
      incrementCheckIns();
    }

    // The code for instant adding user to attendees list, before an API call because the old way was slow
    if (userDataAttendance) {
      if (attendanceStatus !== status) {
        const filteredAttendees = totalAttendees.filter(
          (attendee) => attendee.id !== userDataAttendance.id,
        );
        setTotalAttendees([...filteredAttendees, userDataAttendance]);
      } else {
        setTotalAttendees([...totalAttendees, userDataAttendance]);
      }
      if (attendanceStatus === 'none') setTotalCount(total_count + 1);
    }
    const result = await rwbApi.updateMobileAttendanceStatus(id, status);
    if (!result) {
      setAttendanceStatus('none');
      decrementCheckIns();
      analyticsObj.execution_status = EXECUTION_STATUS.failure;
      logEventStatus(analyticsObj);
    } else {
      analyticsObj.execution_status = EXECUTION_STATUS.success;
      logEventStatus(analyticsObj);
    }

    if (!userDataAttendance) getAllAttendees();
  };

  const setInitialAttendanceStatus = async (status) => {
    setAttendanceStatus(status);
    if (status === ATTENDANCE_SLUGS.checkedin) {
      incrementCheckIns();
    }
    const result = await rwbApi.setInitialMobileAttendanceStatus(
      eventId,
      status,
    );
    let analyticsObj = {
      activity_sub_type: eventData.category,
      event_record_type: eventData.is_virtual ? 'virtual' : 'event',
      event_id: `${eventData.id}`,
      challenge_id: eventData.challenge_id !== 0 ? `${eventData.challenge_id}` : null,
      group_id: eventData.chapter_hosted ? `${eventData.chapter_id}` : null,
      click_text: 'none',
    };
    if (!result) {
      if (status === ATTENDANCE_SLUGS.checkedin) {
        decrementCheckIns();
      }
      analyticsObj.execution_status = EXECUTION_STATUS.failure;
      logEventStatus(analyticsObj);
      return setAttendanceStatus('none');
    } else {
      analyticsObj.execution_status = EXECUTION_STATUS.success;
      logEventStatus(analyticsObj);
    }
    getAllAttendees();
  };

  const eventStatusHandler = (e, status) => {
    if (!attendanceStatus) return setInitialAttendanceStatus(status);

    if (status === ATTENDANCE_SLUGS.going) {
      if (attendanceStatus === ATTENDANCE_SLUGS.going)
        return deleteAttendanceStatus();
      updateAttendanceStatus(eventId, status);
    } else if (status === ATTENDANCE_SLUGS.interested) {
      if (attendanceStatus === ATTENDANCE_SLUGS.interested) {
        return deleteAttendanceStatus();
      }
      updateAttendanceStatus(eventId, status);
    } else if (e.target.id === 'checkInButton') {
      if (attendanceStatus === ATTENDANCE_SLUGS.checkedin)
        return deleteAttendanceStatus();
      updateAttendanceStatus(eventId, status);
    }
  };

  const decrementCheckIns = () => {
    if (
      joined &&
      requiredUnit === CHALLENGE_TYPES.checkins &&
      progress &&
      progress != 0
    )
      setProgress(progress - 1);
  };

  const incrementCheckIns = () => {
    if (joined && requiredUnit === CHALLENGE_TYPES.checkins)
      setProgress(progress + 1);
  };

  const copyEventURL = () => {
    logShare();
    navigator.clipboard.writeText(
      `https://members.teamrwb.org/events/${eventId}`,
    );
    setCopyMessage('Copied!');
    setTimeout(() => {
      setCopyMessage('');
    }, 3000);
  };

  const getAddress = () =>
    displayFullAddress(
      eventData.location.address,
      eventData.location.city,
      eventData.location.state,
      eventData.location.zip,
      eventData.location.country,
    );

  const cancelEventHandler = () => {
    if (window.confirm('Are you sure you want to cancel this event?')) {
      const payload = {
        status: 'Canceled',
      };
      setLoading(true);
      let analyticsObj = {
        activity_sub_type: eventData.category,
        event_record_type: eventData.is_virtual ? 'virtual' : 'event',
        event_id: `${eventData.id}`,
        challenge_id: eventData.challenge_id !== 0 ? `${eventData.challenge_id}` : null,
        group_id: eventData.chapter_hosted ? `${eventData.chapter_id}` : null,
      };
      rwbApi
        .patchEvent(eventId, JSON.stringify(payload))
        .then(() => {
          analyticsObj.execution_status = EXECUTION_STATUS.success;
          logCancelEvent(analyticsObj);
          // updating a field in the object does not force a rerender, so save nothing and then the updated object
          let updatedEventData = eventData;
          updatedEventData.status = 'Canceled';
          setEventData(updatedEventData);
          setLoading(false);
        })
        .catch((error) => {
          analyticsObj.execution_status = EXECUTION_STATUS.failure;
          logCancelEvent(analyticsObj);
          setLoading(false);
          console.warn('Error canceling the event: ', error);
        });
    }
  };

  const removeEventHandler = () => {
    if (
      window.confirm(
        'Are you sure you want to remove event from the event list?',
      )
    ) {
      rwbApi
        .removeEvent(eventId)
        .then(() => {
          history.push('/events');
          refreshEvents();
        })
        .catch((error) => {
          console.warn('Error removing the event: ', error);
        });
    }
  };

  const isEventTodayOrBefore = () => {
    const today = moment();
    const eventDate = localizeDate(
      eventData.is_virtual,
      eventData.time_zone_id,
      eventData.start,
    );
    const localOffset = today.utcOffset();
    let compareDate;
    // Even after localizing the start time, the moment object has it saved as a UTC time
    // this means that when we do a comparison with it, additional time will be added/subtracted.
    // That could modify the date which affects checking in and allow early check in.
    // To compensate for how moment works, we add (subtract the negative) minute offset for local time
    if (eventData.is_all_day && localOffset < 0)
      compareDate = moment(eventDate).subtract(localOffset, 'minutes');
    else compareDate = eventDate;
    // enable check in for all events is the user's local device has the same date or is later than the localized start time
    return today.isSameOrAfter(compareDate, 'date');
  };

  const updateEventHandler = () => setIsUpdate(true);

  const addressClickHandler = () => {
    logAddress();
    setMapShown((prevState) => !prevState);
  };

  const reportEvent = () => {
    if (window.confirm('Team RWB: Would you like to report this event?')) {
      const reporterUserID = JSON.stringify({reporter: user.id});
      rwbApi
        .reportEvent(eventId, reporterUserID)
        .then(() => {
          window.alert('Team RWB: Your report has been sent');
        })
        .catch((err) => {
          window.alert(`Team RWB: ${REPORT_ERROR}`);
          console.warn(err);
        });
    }
  };

  const [createPostModal, setCreatePostModal] = useState(false);

  const openCloseModalHandler = () =>
    setCreatePostModal((prevState) => !prevState);

  const onWorkoutDelete = () => {
    if (window.confirm(WORKOUT_DELETE_WARNING)) {
      setLoading(true);
      rwbApi
        .deleteWorkout(eventId)
        .then(() => {
          rwbApi.getLeaderboardRank(eventData.challenge_id).then((rank) => {
            setRank(rank.rank);
            setProgress(parseFloat(rank.score));
          });
          setWorkoutState({
            workoutRecorded: false,
          });
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
        });
    } else {
      setOptionsOverlayVisible();
    }
  };

  const handleGoBack = () => {
    return location.state?.from === 'record-workout'
      ? history.push(location.state.eventFrom)
      : history.goBack();
  };

  return (
    <>
      {loading ? (
        <Loading size={100} color={'var(--white)'} loading={true} right />
      ) : (
        <>
          <DetailHeader
            imgAlt="Event Banner"
            primaryImg={eventData.photo_url}
            backupImg={defaultEventPhoto(
              eventData.category === 'virtual' ? 'virtual' : eventData.category,
            )}
            goBack={handleGoBack}
            copyClick={copyEventURL}
            copyMessage={copyMessage}
          />
          <div className={styles.contentContainer}>
            <div className={styles.eventNameAndReportContainer}>
              <div className={styles.eventNameAndChapterContainer}>
                <h1>{eventData.name}</h1>
                <h5 className={styles.chapterName}>{eventData.chapter_name}</h5>
              </div>
              {eventData.host.id !== userProfile.id ? (
                <div
                  className={styles.optionsContainer}
                  onClick={() => reportEvent()}>
                  <PostOptionIcon height="24" width="24" />
                </div>
              ) : null}
            </div>
            <div className={styles.calendarContainer}>
              <CalendarIcon />
              <div>
                <p>
                  {localizeTime(
                    eventData.is_virtual,
                    eventData.time_zone_id,
                    eventData.start,
                  ).format('ddd, MMM DD, YYYY')}
                </p>
                <p>
                  {!eventData.is_all_day
                    ? `${localizeTime(
                        eventData.is_virtual,
                        eventData.time_zone_id,
                        eventData.start,
                      ).format('h:mm A')}
                  -
                  ${localizeTime(
                    eventData.is_virtual,
                    eventData.time_zone_id,
                    eventData.end,
                  ).format('h:mm A')}`
                    : 'All Day Event'}
                </p>
              </div>
            </div>
            <div
              className={styles.eventHostContainer}
              onClick={() => history.push(`/profile/${eventData.host.id}`)}>
              <img
                className={styles.hostProfileImg}
                alt="Host Profile"
                src={eventData.host.photo_url || defaultUserPhoto}
                // onClick={() => history.push(`/profile/${eventData.host.id}`)}
              />
              <div className={styles.hostDetails}>
                <h5 className={styles.hostTitle}>
                  {eventData.host.is_eagle_leader
                    ? 'Eagle Leader'
                    : 'Event Host'}
                </h5>
                <div className="namesAndObjects">
                  {`${eventData.host.first_name} ${eventData.host.last_name}`}
                  {/* wait for server to inform if the event is a sponsor type and hosted by a sponsor admin */}
                  {/* <EagleLeaderIcon /> */}
                </div>
              </div>
            </div>
            <div className={styles.locationContainer}>
              {eventData.location.address ? (
                <>
                  <LocationIcon />
                  <p
                    className={`bodyCopy ${styles.clickable}`}
                    onClick={addressClickHandler}>
                    {getAddress()}
                  </p>
                </>
              ) : (
                <>
                  <VirtualEventIcon className={styles.virtualIcon} />
                  <p className={`bodyCopyForm ${styles.virtualEventCategory}`}>
                    Virtual{' '}
                    {eventData.virtual_event_category?.slice(0, -1) || 'Event'}
                    {/* virtual_event_category is in the plural, slice is used to cut the last letter */}
                  </p>
                </>
              )}
            </div>
            {mapShown && (
              <div className={styles.mapContainer}>
                <GoogleMapView
                  location={{
                    lat: eventData.location.latitude,
                    lng: eventData.location.longitude,
                  }}
                />
              </div>
            )}
            {eventData?.challenge_id && eventData?.challenge_id !== '0' ? (
              <Link to={`/challenges/${eventData.challenge_id}`}>
                <div className={styles.challengeInfoContainer}>
                  <div style={{display: 'flex', flexDirection: 'row'}}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                      }}>
                      <h2 style={{fontStyle: 'italic'}}>{challengeName}</h2>
                      <h5>
                        {getChallengeStatusText(
                          challengeStartDate,
                          challengeEndDate,
                        )}
                      </h5>
                    </div>
                    <ChevronRightIcon />
                  </div>
                  {rank &&
                  rank !== '' &&
                  progress &&
                  progress !== '' &&
                  requiredUnit !== CHALLENGE_TYPES.checkins ? (
                    <RankingRow
                      place={rank}
                      progress={progress}
                      ignoreEmphasis={true}
                      metric={requiredUnit}
                      user={user}
                    />
                  ) : progress &&
                    progress !== '' &&
                    requiredUnit === CHALLENGE_TYPES.checkins ? (
                    <ChallengeProgressBar
                      progress={progress}
                      goal={goal}
                      metric={requiredUnit}
                    />
                  ) : null}
                </div>
              </Link>
            ) : null}
            {eventData.status === EVENT_STATUS.canceled ? (
              <div>
                <div className={styles.canceledEventContainer}>
                  <h4>This Event Has Been Canceled</h4>
                </div>
                {!isRemoved && eventData.host.id === userProfile.id ? (
                  <div
                    id="removeButton"
                    className={styles.removedEventContainer}
                    onClick={removeEventHandler}>
                    <h4>Remove Event from Event List</h4>
                  </div>
                ) : null}
              </div>
            ) : eventData.host.id === userProfile.id ? (
              // prevent modifying event after it is over
              isEventOver(eventData) ? null : (
                <div className={styles.eventStatus}>
                  <div
                    id="cancelButton"
                    className={`${styles.statusButton} ${styles.cancelButton}`}
                    onClick={cancelEventHandler}>
                    <CancelIcon />
                    <h4>Cancel</h4>
                  </div>
                  <div
                    id="updateButton"
                    className={`${styles.statusButton} ${styles.updateButton}`}
                    onClick={updateEventHandler}>
                    <UpdateIcon />
                    <h4>Update</h4>
                  </div>
                </div>
              )
            ) : (
              <div className={styles.eventStatus}>
                {isEventTodayOrBefore() ? (
                  <div className={styles.buttonsContainerCheckedIn}>
                    <div
                      id="checkInButton"
                      className={`${styles.statusButton} ${
                        attendanceStatus === ATTENDANCE_SLUGS.checkedin &&
                        styles.statusButtonClicked
                      }`}
                      onClick={(e) =>
                        eventStatusHandler(e, ATTENDANCE_SLUGS.checkedin)
                      }>
                      <CheckIcon
                        tintColor={
                          attendanceStatus === ATTENDANCE_SLUGS.checkedin
                            ? 'var(--magenta)'
                            : 'var(--grey)'
                        }
                      />
                      <h4>
                        {attendanceStatus === ATTENDANCE_SLUGS.checkedin
                          ? 'Checked In'
                          : 'Check In'}
                      </h4>
                    </div>
                  </div>
                ) : (
                  <div className={styles.buttonsContainer}>
                    <div
                      id="goingButton"
                      className={`${styles.statusButton} ${
                        styles.goingButton
                      } ${
                        attendanceStatus === ATTENDANCE_SLUGS.going &&
                        styles.statusButtonClicked
                      }`}
                      onClick={(e) =>
                        eventStatusHandler(e, ATTENDANCE_SLUGS.going)
                      }>
                      {attendanceStatus === ATTENDANCE_SLUGS.going ? (
                        <CheckIcon tintColor={'var(--magenta)'} />
                      ) : (
                        <AttendingIcon tintColor={'var(--grey)'} />
                      )}

                      <h4>Going</h4>
                    </div>
                    <div
                      id="interestedButton"
                      className={`${styles.statusButton} ${
                        attendanceStatus === ATTENDANCE_SLUGS.interested &&
                        styles.statusButtonClicked
                      }`}
                      onClick={(e) =>
                        eventStatusHandler(e, ATTENDANCE_SLUGS.interested)
                      }>
                      {attendanceStatus === ATTENDANCE_SLUGS.interested ? (
                        <CheckIcon tintColor={'var(--magenta)'} />
                      ) : (
                        <InterestedIcon tintColor={'var(--grey)'} />
                      )}
                      <h4>Interested</h4>
                    </div>
                  </div>
                )}
              </div>
            )}
            {eventData?.challenge_id !== 0 &&
              eventData.status !== EVENT_STATUS.canceled &&
              isEventTodayOrBefore() &&
              (eventData.host.id === userProfile.id ||
                attendanceStatus === ATTENDANCE_SLUGS.checkedin) && (
                <div className={styles.recordWorkoutButtonContainer}>
                  {!workoutState.workoutRecorded ? (
                    <Link
                      className={styles.recordWorkoutButtonLink}
                      to={{
                        pathname: `/events/${eventData.id}/record-workout`,
                        state: {
                          id: eventId,
                          pathName: `/events/${eventData.id}`,
                          eventName: eventData.name,
                          eventChapterName: eventData.chapter_name,
                          eventStartTime: localizeTime(
                            eventData.is_virtual,
                            eventData.time_zone_id,
                            eventData.start,
                          ).format('ddd, MMM DD, YYYY'),
                          requiredUnit,
                          from: location.state?.from,
                        },
                      }}>
                      <div
                        id="recordWorkoutButton"
                        className={`${styles.statusButton} ${styles.recordWorkoutButton}`}>
                        <h4>Record workout</h4>
                      </div>
                    </Link>
                  ) : workoutState.workoutRecorded ? (
                    <div className={styles.recordWorkoutWrapper}>
                      <WorkoutCard
                        optionsOverlayVisible={optionsOverlayVisible}
                        setOptionsOverlayVisible={setOptionsOverlayVisible}
                        miles={workoutState.miles}
                        steps={workoutState.steps}
                        hours={workoutState.hours}
                        minutes={workoutState.minutes}
                        seconds={workoutState.seconds}
                        onShare={() => setCreatePostModal(true)}
                        onDelete={onWorkoutDelete}
                      />
                    </div>
                  ) : null}
                </div>
              )}

            <Link
              onClick={logAttendees}
              to={{
                pathname: `/events/${eventData.id}/attendees`,
                state: {
                  host: eventData.host,
                  date: eventData.start,
                  isVirtual: eventData.is_virtual,
                  timeZone: eventData.time_zone_id,
                },
              }}>
              <AvatarList avatars={totalAttendees} total_count={total_count} />
            </Link>
            <div className={styles.description}>{eventData.description}</div>
            {eventData.links !== null &&
              eventData.links.length > 0 &&
              eventData.links.map((links, i) => (
                <div className={styles.eventLinks} key={'linkContainer' + i}>
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href={links.url}
                    className="link"
                    key={'link' + i}>
                    {links.text}
                  </a>
                </div>
              ))}
          </div>
          {eventFeed.length > 0 && (
            <>
              <FeedList
                userFeed={eventFeed}
                eventID={eventId}
                type={'post'}
                mergeNewPost={(newPost) => mergeNewPost(newPost)}
              />
            </>
          )}
          {!user.anonymous_profile && (
            <CreatePostButton
              type={'event'}
              eventID={eventId}
              mergeNewPost={(newPost) => mergeNewPost(newPost)}
            />
          )}
          {isUpdate && (
            <CreateEvent
              isChapterEvent={eventData.chapter_hosted}
              eventData={eventData}
              closeModalHandlers={() => setIsUpdate(false)}
              refreshEvents={refreshEvents}
              groupId={eventData.chapter_id}
              challengeId={eventData.challenge_id}
              isVirtual={eventData.is_virtual}
            />
          )}
        </>
      )}

      {createPostModal && (
        <CreatePost
          type={'user'}
          eventID={eventId}
          groupID={eventData.chapter_id}
          challengeID={eventData.challenge_id}
          closeModalHandler={openCloseModalHandler}
          mergeNewPost={mergeNewPost}
          eventName={eventData.name}
          chapterName={eventData.chapter_name}
          eventStartTime={eventData.start}
          miles={workoutState.miles}
          steps={workoutState.steps}
          hours={workoutState.hours}
          minutes={workoutState.minutes}
          seconds={workoutState.seconds}
        />
      )}
    </>
  );
};

export default EventDetail;
