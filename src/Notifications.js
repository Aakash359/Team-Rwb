// On android, notifications must be given an integer ID, which is used to track them.
// We'll be using the event's ID as a root, and for each type of notification,
// a suffix number. So the notifications for event with id = 777 will be
// [`7770`, `7771`, `7772`].

'use strict';

import {Platform, Alert} from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';

import moment from 'moment';

import {ATTENDANCE_SLUGS} from '../shared/constants/AttendanceSlugs';
import {rwbApi} from '../shared/apis/api';
import {pushSettings} from './models/UserPushSettings';

const ANDROID_ACTIONS = {
  view: "['View']",
  going: "['Going']",
  check_in: "['Check-In']",
};

const IOS_ACTIONS = {
  view: 'view',
  going: 'going',
  check_in: 'checkin',
};

const NOTE_CONFIG = {
  // android settings
  channelId: 'rwb-local-push',
  largeIcon: 'ic_launcher_round',
  smallIcon: 'ic_notification',
  priority: 'default',

  //cross platform setting

  title: 'Event Reminder',
};

function beforeEventNotification(rwb_event, status, debug) {
  // has ID = 'event_id' + '0'
  let date;
  if (debug) {
    date = moment().add(10, 's');
  } else {
    date = moment(rwb_event.start).subtract(24, 'h');
  }
  if (date.isBefore(moment())) return;

  let message;
  if (status === ATTENDANCE_SLUGS.interested) {
    message = `You expressed interest in ${rwb_event.name} coming up tomorrow.`;
  } else if (status === ATTENDANCE_SLUGS.going) {
    message = `We are looking forward to seeing you tomorrow at ${rwb_event.name}.`;
  } else if (status === ATTENDANCE_SLUGS.checkedin) {
    return;
  } else throw new Error('Invalid status slug provided.');

  const id = rwb_event.id.toString() + '0';
  PushNotification.localNotificationSchedule(
    Object.assign({}, NOTE_CONFIG, {
      id,
      userInfo: {
        id,
      },
      message,
      category:
        status === ATTENDANCE_SLUGS.interested
          ? IOS_ACTIONS.going
          : IOS_ACTIONS.view,
      date: date.toDate(),
      actions:
        status === ATTENDANCE_SLUGS.interested
          ? ANDROID_ACTIONS.going
          : ANDROID_ACTIONS.view,
    }),
  );
  return;
}

function dayOfEventNotification(rwb_event, status, debug) {
  // has ID = 'event_id' + '1'
  let date;
  if (debug) {
    date = moment().add(20, 's');
  } else {
    date =
      status === ATTENDANCE_SLUGS.interested
        ? moment(rwb_event.start).subtract(3, 'hours')
        : moment(rwb_event.start).subtract(10, 'minutes');
  }
  if (date.isBefore(moment())) return;

  let message;
  if (status === ATTENDANCE_SLUGS.interested) {
    message = `We hope to see you at the ${rwb_event.name} event at ${moment(
      rwb_event.start,
    ).format('h:mm A')} at ${rwb_event.location.address} today.`;
  } else if (status === ATTENDANCE_SLUGS.going) {
    message = `${rwb_event.name} is starting soon. Remember to check-in.`;
  } else if (status === ATTENDANCE_SLUGS.checkedin) {
    return;
  }
  const id = rwb_event.id.toString() + '1';

  PushNotification.localNotificationSchedule(
    Object.assign({}, NOTE_CONFIG, {
      id,
      userInfo: {
        id,
      },
      message,
      category:
        status === ATTENDANCE_SLUGS.interested
          ? IOS_ACTIONS.going
          : IOS_ACTIONS.check_in,
      date: date.toDate(),
      actions:
        status === ATTENDANCE_SLUGS.interested
          ? ANDROID_ACTIONS.going
          : ANDROID_ACTIONS.check_in,
    }),
  );
  return;
}

function dayAfterEventNotification(rwb_event, status, debug) {
  // has ID = 'event_id' + '2'

  let date;
  if (debug) {
    date = moment().add(30, 's');
  } else {
    date = moment(rwb_event.start).add(24, 'hours');
  }
  if (date.isBefore(moment())) return;

  let message;
  if (status === ATTENDANCE_SLUGS.interested) {
    message = `Did you get a chance to participate in the ${rwb_event.name} event? Don't forget to check-in.`;
  } else if (status === ATTENDANCE_SLUGS.going) {
    message = `You mentioned you were going to the ${rwb_event.name} event yesterday. Did you get a chance to attend? If so, don't forget to check-in.`;
  } else if (status === ATTENDANCE_SLUGS.checkedin) {
    return;
  }
  const id = rwb_event.id.toString() + '2';

  PushNotification.localNotificationSchedule(
    Object.assign({}, NOTE_CONFIG, {
      id,
      userInfo: {
        id,
      },
      message,
      category: IOS_ACTIONS.check_in,
      date: date.toDate(),
      actions: ANDROID_ACTIONS.check_in,
    }),
  );
  return;
}

export function reScheduleOnAction(event_id, status) {
  rwbApi
    .putAttendanceStatus(event_id, status)
    .then((attendance_response) => {
      if (attendance_response.ok) {
        rwbApi
          .getEvent(event_id)
          .then((response) => {
            return response.json();
          })
          .then((body) => {
            scheduleEventNotifications(body, status);
            if (__DEV__) {
              PushNotification.localNotification(
                Object.assign({}, NOTE_CONFIG, {
                  message: `DEBUG Attendance status successfully updated.`,
                }),
              );
            }
          });
      } else {
        throw new Error();
      }
    })
    .catch((error) => {
      if (error.toString() === `NO USER LOGGED IN`) {
        PushNotification.localNotification(
          Object.assign({}, NOTE_CONFIG, {
            message: `We were unable to update your attendance status. Please log in and try again.`,
          }),
        );
      } else {
        PushNotification.localNotification(
          Object.assign({}, NOTE_CONFIG, {
            message: `There was an error updating your attendance status.`,
          }),
        );
      }
    });
}

export function scheduleEventNotifications(rwb_event, status, debug) {
  clearEventNotifications(rwb_event);
  if (pushSettings.getPushSettings().event_notifications === true) {
    beforeEventNotification(rwb_event, status, debug);
    dayOfEventNotification(rwb_event, status, debug);
    dayAfterEventNotification(rwb_event, status, debug);
  }
  return;
}

export function clearEventNotifications(rwb_event) {
  if (Platform.OS === 'android') {
    for (let suffix = 0; suffix <= 2; suffix++) {
      //remember, suffixes are being used as identifiers.

      //This clears all local notes associated with an event.

      //clearing a non-existant event is a safe no-op.
      PushNotification.cancelLocalNotifications({
        id: rwb_event.id.toString() + suffix.toString(),
      });
    }
  } else if (Platform.OS === 'ios') {
    for (let suffix = 0; suffix <= 2; suffix++) {
      PushNotificationIOS.cancelLocalNotifications({
        id: rwb_event.id.toString() + suffix.toString(),
      });
    }
  }
}
