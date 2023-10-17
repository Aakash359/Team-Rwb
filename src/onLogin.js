/*
  In previous versions of the app, specific code to happen on login was left in the evnets list.
  To ensure that everything  that needs to happen on login is easily moveable to the appropriate
  updated tab, we store those functions in here.
*/
import {Alert} from 'react-native';
import MCReactModule from 'react-native-marketingcloudsdk';
import {rwbApi} from '../shared/apis/api';
import {authentication} from '../shared/models/Authentication';
import {notificationController} from './NotificationController';
import {pushSettings} from './models/UserPushSettings';

export function updateUserTokens() {
  notificationController.putToken();
  notificationController.putFCMToken();

  //send contact key to salesforce
  authentication
    .getAccessToken()
    .then((accessToken) => {
      if (accessToken) return accessToken;
      return Promise.reject('Missing Credentials');
    })
    .then(rwbApi.getAuthenticatedUser)
    .then((json) => {
      if (json['salesforce_contact_id']) {
        MCReactModule.setContactKey(json['salesforce_contact_id']);
      } else if (json['email']) {
        MCReactModule.setContactKey(json['email']);
      } else {
        Alert.alert(
          'Team RWB',
          'No salesforce contact key. Please contact Team RWB.',
        );
      }
      pushSettings.init().then(() => {
        rwbApi.getNotificationSettings().then((response) => {
          pushSettings.savePushSettings(response);
        });
      });
    });
}
