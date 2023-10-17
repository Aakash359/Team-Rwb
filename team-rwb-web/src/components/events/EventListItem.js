import React, { Component } from 'react';
import styles from './EventListItem.module.css';
import CanceledEventIcon from '../svgs/CanceledEventIcon';
import {
  displayFullAddress,
  localizeTime,
} from '../../../../shared/utils/Helpers';
import AttendeesAndFollowedUsers from '../AttendeesAndFollowedUsers';
import { Link } from 'react-router-dom';
import WorkoutCard from './WorkoutCard';
import { ATTENDANCE_SLUGS } from '../../../../shared/constants/AttendanceSlugs';
import { hoursMinutesSecondsFromMinutes } from '../../../../shared/utils/ChallengeHelpers';
import { formatDateAndTimes } from '../../../../shared/utils/EventHelpers';
import { rwbApi } from '../../../../shared/apis/api';
import CheckIcon from '../svgs/CheckIcon';

export default class EventListItem extends Component {
  constructor(props) {
    super(props);
    const eventDateAndTimes = formatDateAndTimes(props.event);
    const time = hoursMinutesSecondsFromMinutes(
      props.event?.workout_metrics?.minutes,
    );
    this.state = {
      eventAttendees: [],
      recordWorkoutVisible: false,
      going: [],
      interested: [],
      checkedIn: [],
      attendeesLoading: true,
      hours: time.hours || 0,
      minutes: time.minutes || 0,
      seconds: time.seconds || 0,
      miles: props.event?.workout_metrics?.miles || 0,
      steps: props.event?.workout_metrics?.steps || 0,
      attendanceStatus: props.event.attendance_status,
      eventToday: eventDateAndTimes.todayTime.isSameOrAfter(
        eventDateAndTimes.compareDate,
        'date',
      ),
      attendanceStatusChanging: false,
    };
  }

  componentDidMount() {
    if (
      this.props.type === 'MyActivities' ||
      this.props.type === 'AllActivities'
    ) {
      this.props.loadAttendees(this.props.event.id).then((res) => {
        let data = [];
        res.going.attendees.map((attendee, i) => data.push(attendee));
        res.interested.attendees.map((attendee, i) => data.push(attendee));
        res.checked_in.attendees.map((attendee, i) => data.push(attendee));
        this.setState({ eventAttendees: data });
      });
    }
  }

  emptyWorkout = () => {
    return (
      this.state.miles === 0 &&
      this.state.steps === 0 &&
      this.state.hours === 0 &&
      this.state.minutes === 0 &&
      this.state.seconds === 0
    );
  };

  toggleCheckIn = () => {
    const attendanceStatus = this.state.attendanceStatus;
    if (this.state.attendanceStatusChanging) return;
    const event = this.props.event;
    this.setState({ attendanceStatusChanging: true });
    // set initial check in
    // while attendance status is stored as null, it is not returned if null, so the default status is undefined as it is not returned
    if (attendanceStatus === undefined) {
      // this promise does not return an error
      rwbApi
        .setInitialMobileAttendanceStatus(event.id, ATTENDANCE_SLUGS.checkedin)
        .then((result) => {
          this.setState({
            attendanceStatus:
              result.status === 200 || result.status === 201
                ? ATTENDANCE_SLUGS.checkedin
                : null,
            attendanceStatusChanging: false,
          });
        }).catch(() => window.alert("Failed to update attendance status."));
    } else {
      const newStatus =
        attendanceStatus === ATTENDANCE_SLUGS.checkedin
          ? 'none'
          : ATTENDANCE_SLUGS.checkedin;
      // this promise does not return an error
      rwbApi
        .updateMobileAttendanceStatus(event.id, newStatus)
        .then((result) => {
          this.setState({
            attendanceStatus:
              result.status === 200 || result.status === 201
                ? newStatus
                : attendanceStatus,
            attendanceStatusChanging: false,
          });
        }).catch(() => window.alert("Failed to update attendance status."));
    }
  };

  render() {
    const {
      start,
      end,
      name,
      chapter_name,
      location,
      followingAttendees,
      attendees_count,
      status,
      time_zone_id,
      is_virtual,
      attendance_status,
    } = this.props.event;
    const { event } = this.props;
    const {
      eventAttendees,
      miles,
      steps,
      hours,
      minutes,
      seconds,
      attendanceStatus,
      attendanceStatusChanging,
    } = this.state;

    return (
      <div className={styles.container}>
        <div className={styles.dateContainer}>
          <p className="date">
            {localizeTime(is_virtual, time_zone_id, start).format('DD')}
          </p>
          <p className="formLabel">
            {localizeTime(is_virtual, time_zone_id, start).format('ddd')} •{' '}
            {localizeTime(is_virtual, time_zone_id, start).format('MMM')}
          </p>
        </div>
        <div className={styles.infoContainer}>
          <div className={styles.titleContainer}>
            <h1>{name}</h1>
            <h5>{chapter_name || ''}</h5>
          </div>
          {status === 'Canceled' && (
            <div className={styles.canceledEventWrapper}>
              <h3 className={styles.canceledEvent}>Canceled</h3>
              <CanceledEventIcon />
            </div>
          )}
          <p className="bodyCopyForm">
            {!this.props.event.is_all_day
              ? `${localizeTime(is_virtual, time_zone_id, start).format(
                'h:mm A',
              )}–${localizeTime(is_virtual, time_zone_id, end).format(
                'h:mm A',
              )}`
              : 'All Day Event'}
          </p>
          {location.address && (
            <p className="bodyCopyForm">
              {displayFullAddress(
                location.address,
                location.city,
                location.state,
                location.zip,
                location.country,
              )}
            </p>
          )}
          {event.required_unit
            ?
            this.state.eventToday &&
              attendanceStatus !== ATTENDANCE_SLUGS.checkedin ? (
              <div
                style={{
                  opacity: attendanceStatusChanging ? 0.5 : 1,
                  width: '200px',
                  marginTop: '12px',
                }}>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    this.toggleCheckIn();
                  }}
                  style={{
                  display:"flex",
                  flexDirection:"row"
                }}
                  className={`${styles.statusButton} ${styles.recordWorkoutButton}`}>
                  <CheckIcon tintColor={'var(--grey)'} />
                  <h4 style={{ color: 'var(--grey)', marginLeft:"4px" }}>CHECK IN</h4>
                </div>
              </div>
            ) : attendanceStatus === ATTENDANCE_SLUGS.checkedin &&
              this.emptyWorkout() ? (
              <div className={`${styles.checkedContainer}`} style={{
                opacity: attendanceStatusChanging ? 0.5 : 1,
              }}>
                <div
                  className={`${styles.checkedIcon}`}
                  onClick={(e) => {
                    e.preventDefault();
                    this.toggleCheckIn();
                  }}>
                  <CheckIcon tintColor={'var(--white)'} />
                </div>
                <Link
                  to={{
                    pathname: `/events/${event.id}/record-workout`,
                    state: {
                      id: event.id,
                      pathName: `/events/${event.id}`,
                      eventName: event.name,
                      eventChapterName: event.chapter_name,
                      eventStartTime: localizeTime(
                        event.is_virtual,
                        event.time_zone_id,
                        event.start,
                      ).format('ddd, MMM DD, YYYY'),
                      goBack: true,
                      from: location.state?.from,
                    },
                  }}>
                  <div
                    id="recordWorkoutButton"
                    className={`${styles.statusButton} ${styles.recordWorkoutButton}`}>
                    <h4 style={{ color: 'var(--grey)' }}>Record workout</h4>
                  </div>
                </Link>
              </div>
            ) : attendanceStatus === ATTENDANCE_SLUGS.checkedin &&
              !this.emptyWorkout() ? (
              <WorkoutCard
                miles={miles}
                steps={steps}
                hours={hours}
                minutes={minutes}
                seconds={seconds}
                shareAndDeleteModal={() => null}
                deleting={false}
                displayOnly={true}
                noBorderStyle={true}
              />
              // show attendees when on the challenge event list but the event is not today
            ) : (<AttendeesAndFollowedUsers
              attendees={eventAttendees}
              followingAttendees={followingAttendees}
              attendeesCount={attendees_count}
            />)
            // make sure attendees are shown when not on the challenge event list
            : <AttendeesAndFollowedUsers
              attendees={eventAttendees}
              followingAttendees={followingAttendees}
              attendeesCount={attendees_count}
            />
          }
        </div>
      </div>
    );
  }
}
