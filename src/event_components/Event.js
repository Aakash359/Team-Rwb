import React, {PureComponent} from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  StyleSheet,
} from 'react-native';
import moment from 'moment';
import '../../shared/constants/moment-timezone-with-data-10-year-range';
import 'moment-timezone';
import {displayFullAddress, getOffsetTime} from '../../shared/utils/Helpers';
import ThumbnailLoading from './ThumbnailLoading';
import EVENT_STATUS from '../../shared/constants/EventStatus';
import globalStyles, {RWBColors} from '../styles';

// SVGs
import VirtualEventIcon from '../../svgs/VirtualEventIcon';
import RecurringEventIcon from '../../svgs/RecurringEventIcon';
import CanceledEventIcon from '../../svgs/CanceledEventIcon';
import AttendeesAndFollowedUsers from '../design_components/AttendeesAndFollowedUsers';
import RWBButton from '../design_components/RWBButton';
import RecordWorkoutView from '../challenge_components/RecordWorkoutView';
import WorkoutCard from '../challenge_components/WorkoutCard';
import {hoursMinutesSecondsFromMinutes} from '../../shared/utils/ChallengeHelpers';
import {ATTENDANCE_SLUGS} from '../../shared/constants/AttendanceSlugs';
import {rwbApi} from '../../shared/apis/api';
import CheckIcon from '../../svgs/CheckIcon';
import {formatDateAndTimes} from '../../shared/utils/EventHelpers';

export default class Event extends PureComponent {
  constructor(props) {
    super(props);
    this.mounted = true;
    const eventDateAndTimes = formatDateAndTimes(props.event);
    this.state = {
      going: [],
      interested: [],
      checkedIn: [],
      attendeesLoading: true,
      recordWorkoutVisible: false,
      miles: props.event?.workout_metrics?.miles || 0,
      steps: props.event?.workout_metrics?.steps || 0,
      hours: props.event?.workout_metrics?.hours || 0,
      minutes: props.event?.workout_metrics?.minutes || 0,
      seconds: props.event?.workout_metrics?.seconds || 0,
      attendanceStatus: props.event.attendance_status,
      eventToday: eventDateAndTimes.todayTime.isSameOrAfter(
        eventDateAndTimes.compareDate,
        'date',
      ),
      attendanceStatusChanging: false,
    };
  }

  componentDidMount = () => {
    if (this.state.attendanceStatus !== ATTENDANCE_SLUGS.checkedin)
      this.getAttendees(0);
  };

  componentWillUnmount = () => {
    this.mounted = false;
  };

  hideAttendees = () => {
    const emptyWorkout =
      this.state.miles === 0 &&
      this.state.steps === 0 &&
      this.state.hours === 0 &&
      this.state.minutes === 0 &&
      this.state.seconds === 0;
    return emptyWorkout;
  };

  onUpdateAttendees = () => {
    this.getAttendees(0);
  };
  getAttendees = (attempt) => {
    const {event, loadAttendees} = this.props;
    if (attempt >= 3) {
      Alert.alert(
        'Team RWB Server Error',
        'There was a problem with the server. Some event attendees will not be displayed.',
      );
      return;
    }
    const attendeesPromise = loadAttendees(event.id)
      .then(this.updateAttendees)
      .catch((error) => {
        this.getAttendees(attempt + 1);
      });
    this.attendeesPromise = attendeesPromise.then();
  };

  updateAttendees = (response) => {
    let going;
    let checked_in;
    let interested;
    const numberOfUsers = response.total_count;
    if (response.going) going = response.going.attendees;
    if (response.checked_in) checked_in = response.checked_in.attendees;
    if (response.interested) interested = response.interested.attendees;

    if (!this.mounted) return;
    this.setState({
      going,
      checkedIn: checked_in,
      interested,
      attendeesLoading: false,
      numberOfUsers,
    });
    return response;
  };

  handleUploadedWorkout = (data) => {
    data = JSON.parse(data);
    const time = hoursMinutesSecondsFromMinutes(data.minutes);
    this.setState({
      miles: data?.miles,
      steps: data?.steps,
      hours: time?.hours,
      minutes: time?.minutes,
      seconds: time.seconds,
    });
  };

  toggleCheckIn = () => {
    const attendanceStatus = this.state.attendanceStatus;
    if (this.state.attendanceStatusChanging) return;
    const event = this.props.event;
    this.setState({attendanceStatusChanging: true});
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
        });
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
        });
    }
  };

  challengeWorkoutOptions = () => {
    const {
      eventToday,
      miles,
      steps,
      hours,
      minutes,
      seconds,
      attendanceStatus,
      attendanceStatusChanging,
    } = this.state;

    return eventToday && attendanceStatus !== ATTENDANCE_SLUGS.checkedin ? (
      <TouchableOpacity
        disabled={attendanceStatusChanging}
        style={{opacity: attendanceStatusChanging ? 0.5 : 1}}>
        <RWBButton
          text="CHECK IN"
          buttonStyle="primaryDisabled"
          disabled={false}
          onPress={this.toggleCheckIn}
          customStyles={{padding: 10, width: '60%'}}>
          <CheckIcon color={RWBColors.grey} height="16" width="16" />
        </RWBButton>
      </TouchableOpacity>
    ) : attendanceStatus === ATTENDANCE_SLUGS.checkedin &&
      this.hideAttendees() ? (
      <View style={{flex: 1, flexDirection: 'row'}}>
        <TouchableOpacity
          disabled={attendanceStatusChanging}
          style={[
            styles.checkedInTouchable,
            {opacity: attendanceStatusChanging ? 0.5 : 1},
          ]}
          onPress={this.toggleCheckIn}>
          <CheckIcon color={RWBColors.white} height="16" width="16" />
        </TouchableOpacity>
        <RWBButton
          text="RECORD WORKOUT"
          buttonStyle="primaryDisabled"
          disabled={attendanceStatusChanging}
          onPress={() => this.setState({recordWorkoutVisible: true})}
          customStyles={{padding: 10, width: '60%'}}
        />
      </View>
    ) : attendanceStatus === ATTENDANCE_SLUGS.checkedin &&
      !this.hideAttendees() ? (
      <WorkoutCard
        miles={miles}
        steps={steps}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
        shareAndDeleteModal={() => null}
        deleting={false}
        displayOnly={true}
      />
    ) : null;
  };

  render() {
    const {event, onEventPressed, disableOlderEvents} = this.props;
    const {
      going,
      interested,
      checkedIn,
      attendeesLoading,
      numberOfUsers,
    } = this.state;
    let startDateTime;
    let endDateTime;
    if (event.is_virtual || event.time_zone_id) {
      startDateTime = moment.utc(event.start);
      endDateTime = moment.utc(event.end);
      let tz = event.time_zone_id || 'America/New_York'; // use the event's time zone or new york for virtual events
      startDateTime = getOffsetTime(startDateTime, tz);
      endDateTime = getOffsetTime(endDateTime, tz);
    } else {
      startDateTime = moment(event.start);
      endDateTime = moment(event.end);
    }

    let disable =
      disableOlderEvents &&
      startDateTime.isBefore(moment().subtract(30, 'days'));

    return (
      <TouchableOpacity
        style={[{padding: '5%'}, disable ? {opacity: 0.4} : {}]}
        onPress={() =>
          onEventPressed(event, this.attendeesPromise, this.onUpdateAttendees)
        }
        disabled={disable}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              justifyContent: 'flex-start',
              alignItems: 'center',
              width: '12%',
            }}>
            <Text style={globalStyles.bodyCopyForm}>
              {startDateTime.format('ddd')}
            </Text>
            <Text style={globalStyles.date}>{startDateTime.format('DD')}</Text>
            <Text style={globalStyles.bodyCopyForm}>
              {startDateTime.format('MMM')}
            </Text>
          </View>
          <View style={{width: '83%'}}>
            <Text style={[globalStyles.eventListTitle, {marginBottom: 5}]}>
              {event.name ? event.name.toUpperCase() : ''}
            </Text>

            {/* there is an event from production on staging that is virtual with a chapter name, but not chapter hosted
                this should not happen, but on the offchance staff members make this mistake, we want to show the chapter name
            */}
            {event.chapter_name ? (
              <Text style={[globalStyles.h5, {marginBottom: 5}]}>
                {event.chapter_name}
              </Text>
            ) : null}

            {event.status === EVENT_STATUS.canceled ? (
              <View style={{flexDirection: 'row'}}>
                <Text style={[globalStyles.h3, {color: RWBColors.magenta}]}>
                  {'Canceled'.toUpperCase()}
                </Text>
                <CanceledEventIcon
                  style={{width: 16, height: 16, marginLeft: 5}}
                />
              </View>
            ) : null}
            <View style={{flexDirection: 'row'}}>
              <Text style={globalStyles.bodyCopyForm}>
                {!event.is_all_day
                  ? `${startDateTime.format('h:mm A')}–${endDateTime.format(
                      'h:mm A',
                    )}`
                  : 'All Day Event'}
              </Text>
              {event.is_recurring && (
                <RecurringEventIcon
                  style={{width: 16, height: 16, marginLeft: 5}}
                />
              )}
            </View>
            {/* prevent displaying this when on the virtual tab list */}
            {this.props.activeTab !== 'virtual' ? (
              <View style={{flexDirection: 'row'}}>
                <Text style={globalStyles.bodyCopyForm}>
                  {event.is_virtual || event.location.address === null
                    ? 'Virtual Event'
                    : displayFullAddress(
                        event.location.address,
                        event.location.city,
                        event.location.state,
                        event.location.zip,
                        event.location.country,
                      )}
                </Text>
                {event.is_virtual && (
                  <VirtualEventIcon
                    style={{width: 16, height: 16, marginLeft: 5}}
                  />
                )}
              </View>
            ) : null}
            {/* Record workout view */}
            <Modal visible={this.state.recordWorkoutVisible}>
              <RecordWorkoutView
                id={event.id}
                onClose={() => this.setState({recordWorkoutVisible: false})}
                refreshEvent={this.handleUploadedWorkout}
                requiredUnit={event?.required_unit}
                eventName={event.name}
                chapterName={event.chapter_name}
                eventStartTime={event.start}
              />
            </Modal>
            <View style={{marginTop: 10}} />
            {/* required_unit is only returned if we send the challenge id, which is only done on the challenge tab */}
            {event.required_unit ? (
              // check-in button + record workout or workout or attendees icon
              this.challengeWorkoutOptions()
            ) : attendeesLoading ? (
              <View>
                <ThumbnailLoading />
              </View>
            ) : (
              <AttendeesAndFollowedUsers
                attendees={[...going, ...interested, ...checkedIn]}
                followingAttendees={event.followingAttendees}
                totalCount={numberOfUsers}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  checkedInTouchable: {
    height: 36,
    padding: 10,
    backgroundColor: RWBColors.navy,
    borderRadius: 5,
    marginRight: 15,
    justifyContent: 'center',
  },
});
