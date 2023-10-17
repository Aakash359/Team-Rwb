/*  

Handles configuration of local, scheduled local, and push notifications.
Include this component as <PushController /> -- no props -- in the first screen where notification
permissions should be collected. This will set notification configuration for the entire app on-mount.

This can likely configure certain API calls depending on what the user presses on the notification.

*/
import {Platform} from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import NavigationService from './models/NavigationService';
import IOSNotificationActions from './native_modules/IOSNotificationActions';

import {GCM_SENDER_ID as senderID} from '../shared/constants/APIKeys-obfuscated';

import {reScheduleOnAction} from './Notifications';
import {rwbApi} from '../shared/apis/api';
import {ATTENDANCE_SLUGS} from '../shared/constants/AttendanceSlugs';
import {
  logGoingNotification,
  logCheckInNotification,
} from '../shared/models/Analytics';
import {userProfile} from '../shared/models/UserProfile';
import iOSDeviceID from './native_modules/iOSDeviceID';
import androidDeviceID from './native_modules/androidDeviceID';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/messaging';

class NotificationController {
  constructor() {
    this.onNotification = this.onNotification.bind(this);
    this.onRegister = this.onRegister.bind(this);
    this.navigateToEvent = this.navigateToEvent.bind(this);
    this.navigateToPost = this.navigateToPost.bind(this);
    this.token = '';
    this.fcmToken = '';
    this.deviceUUID = '';
  }

  navigateToEvent(eventID) {
    // In V1 of the app the events tab was the initial one. This is not the case in V2, so we navigate to the events tab then the event
    const currentScreen = NavigationService.getCurrentScreenName();
    // If the user is currently on an event, the component will not remount and load the new event
    // in order to ensure the proper event is loaded, we go back and load the event again.
    if (currentScreen === 'EventView') {
      NavigationService.back();
      // in case the event was viewed from a feed, resend them to events to have the same flow as other local notifications
      NavigationService.navigate('Events');
      NavigationService.navigate('EventView', {eventTitle: eventID});
    } else {
      NavigationService.navigate('Events');
      NavigationService.navigate('EventView', {eventTitle: eventID});
    }
  }

  navigateToPost(postID, poster) {
    NavigationService.navigate('Feed');
    const currentScreen = NavigationService.getCurrentScreenName();
    // if the user is currently on one post view, go back to ensure the next navigation works properly.
    if (currentScreen === 'PostView') NavigationService.back();
    // potential TODO: some issues when navigating from a group push.
    NavigationService.navigate('PostView', {streamID: postID, poster});
  }

  onNotification(notification) {
    const {action} = notification;
    let noteID; // used for salesforce pushes
    let fcmEventID;
    let fcmPostID;

    // iOS from action (View, Going, Check-In) and all Android notifications
    if (notification.notificationId) {
      noteID = notification.notificationId.toString();
    }

    //iOS from actionless press ( simply tapping on notification )
    else if (notification.data) {
      noteID = notification.data.id;
      if (!noteID) {
        fcmEventID = notification.data.event_id;
      }
      if (notification.data.post_id) fcmPostID = notification.data.post_id;
    } else {
      // TODO, handle other data as more types of notifications come in
    }

    // android
    if (!noteID && !fcmEventID && notification.event_id) {
      fcmEventID = notification.event_id;
    }
    if (notification.post_id) fcmPostID = notification.post_id;
    // on android device onNotification happens as soon as a foregrounded notification happens, even if not interacted with, prevent that interaction
    if (
      Platform.OS === 'android' &&
      notification.foreground &&
      !notification.userInteraction
    )
      return;
    if (noteID || fcmEventID) {
      const eventID = noteID ? noteID.slice(0, noteID.length - 1) : fcmEventID;
      if (action !== 'Going' && action !== 'Check-In') {
        this.navigateToEvent(eventID);
      }
      // timeout to ensure reScheduleOnAction works, iOS only
      // NOTE: when testing with the debug simulate going, "action" was never received
      setTimeout(() => {
        if (action === 'Going') {
          logGoingNotification();
          reScheduleOnAction(eventID, ATTENDANCE_SLUGS.going);
        } else if (action === 'Check-In') {
          logCheckInNotification();
          reScheduleOnAction(eventID, ATTENDANCE_SLUGS.checkedin);
        }
      }, 1500);
    }
    if (fcmPostID) {
      userProfile.init().then((userdata) => {
        const reactionType =
          notification?.data?.reaction || notification?.reaction;
        let posterObj;
        // when interacting with a like, the current user is always the poster
        if (reactionType === 'like' || reactionType === 'comment') {
          posterObj = userProfile.getUserProfile();
        } else if (
          notification?.data?.reaction_kind === 'comment' ||
          notification?.reaction_kind === 'comment'
        ) {
          posterObj = {
            id:
              notification?.data?.activity_author_id ||
              notification?.activity_author_id,
          };
        } else {
          posterObj = {
            id: notification?.data?.user_id || notification?.user_id,
          };
        }
        // potential TODO. Viewing a post on a group or event hides the bottom tab and is a different experience than pushes
        // navigate to the appropriate tab and group/event (might remove)
        // const eventID = notification?.data?.event_id || notification?.event_id;
        // const groupID = notification?.data?.group_id || notification?.group_id;

        // if (eventID) {
        //   this.navigateToEvent(eventID)
        // } else if (groupID) {
        //   NavigationService.navigate('Groups');
        // } else {
        //   NavigationService.navigate('Feed');
        // }
        this.navigateToPost(fcmPostID, posterObj);
      });
    }
  }

  onNotificationIOS(results) {
    userProfile.init().then((userdata) => {
      let notification = {
        action: results.identifier,
        notificationId: parseInt(results.userInfo.id),
      };
      this.onNotification(notification);
    });
  }

  onRegister(token) {
    if (this.token) {
      PushNotificationIOS.removeEventListener('register', this.onRegister);
    }
    this.token = token.token;
    firebase
      .messaging()
      .getToken()
      .then((fcmToken) => {
        this.fcmToken = fcmToken;
      });
  }

  setDeviceUUIDs() {
    Platform.OS === 'ios'
      ? iOSDeviceID.getDeviceIDString((error, deviceUUID) => {
          this.deviceUUID = deviceUUID;
        })
      : androidDeviceID.getDeviceIDString(
          (error) => {},
          (deviceUUID) => {
            this.deviceUUID = deviceUUID;
          },
        );
  }

  putToken() {
    const {token, deviceUUID} = this;
    if (token) {
      rwbApi.putPushToken(token, deviceUUID).catch((error) => {});
    }
  }

  putFCMToken() {
    const {fcmToken, deviceUUID} = this;
    rwbApi.putFCMToken(fcmToken, deviceUUID);
  }

  setCategoriesIOS() {
    const viewButton = new IOSNotificationActions.IOSAction(
      {
        activationMode: 'foreground',
        title: 'View',
        identifier: 'View',
      },
      (results, done) => {
        this.onNotificationIOS(results);
        done();
      },
    );

    const goingButton = new IOSNotificationActions.IOSAction(
      {
        activationMode: 'background',
        title: 'Going',
        identifier: 'Going',
      },
      (results, done) => {
        this.onNotificationIOS(results);
        done();
      },
    );

    const checkinButton = new IOSNotificationActions.IOSAction(
      {
        activationMode: 'background',
        title: 'Check-In',
        identifier: 'Check-In',
      },
      (results, done) => {
        this.onNotificationIOS(results);
        done();
      },
    );

    const IOSViewCategory = new IOSNotificationActions.IOSCategory({
      identifier: 'view',
      actions: [viewButton],
      forContext: 'minimal',
    });

    const IOSGoingCategory = new IOSNotificationActions.IOSCategory({
      identifier: 'going',
      actions: [goingButton],
      forContext: 'minimal',
    });

    const IOSCheckinCategory = new IOSNotificationActions.IOSCategory({
      identifier: 'checkin',
      actions: [checkinButton],
      forContext: 'minimal',
    });

    IOSNotificationActions.updateCategories([
      IOSViewCategory,
      IOSGoingCategory,
      IOSCheckinCategory,
    ]);
  }

  init() {
    this.setDeviceUUIDs();
    if (Platform.OS === 'ios') {
      this.setCategoriesIOS();
    }

    PushNotification.configure({
      onNotification: (notification) => {
        this.onNotification(notification);
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      onRegister: this.onRegister,
      senderID: senderID,
      popInitialNotification: true,
    });
  }
}

export let notificationController = new NotificationController();