import PushNotification from 'react-native-push-notification';
import AsyncStorage from '../../shared/models/StorageHandler';
import {isObject} from '../../shared/utils/Helpers';

class PushSettings {
  event_notifications = true;
  activity_notifications = true;
  constructor() {
    this.dataLoaded = false;
    this.savePushSettings = this.savePushSettings.bind(this);
    this._loadPushSettings = this._loadPushSettings.bind(this);
    this.init = this.init.bind(this);
  }
  _setPushSettings(data) {
    const {event_notifications, activity_notifications} = data;
    this.event_notifications = event_notifications;
    this.activity_notifications = activity_notifications;
    return this.getPushSettings();
  }
  init() {
    if (!this.dataLoaded) {
      this.dataLoaded = true;
      return this._loadPushSettings();
    } else {
      return Promise.resolve(this.getPushSettings());
    }
  }
  savePushSettings(value) {
    if (!value || !isObject(value))
      throw new TypeError('input must be of type Object');
    this._setPushSettings(value);
    return new Promise((resolve) => {
      // all local notifications are event related
      if (value.event_notifications === false)
        PushNotification.cancelAllLocalNotifications();
      AsyncStorage.setItem('push_settings', JSON.stringify(value)).then(
        resolve,
      );
    });
  }
  _loadPushSettings() {
    return AsyncStorage.getItem('push_settings').then((data) => {
      if (data) {
        return this._setPushSettings(JSON.parse(data));
      } else {
        throw new Error();
      }
    });
  }
  getPushSettings() {
    const {event_notifications, activity_notifications} = this;
    return {
      event_notifications,
      activity_notifications,
    };
  }

  deletePushSettings() {
    return AsyncStorage.removeItem('push_settings');
  }
}

export let pushSettings = new PushSettings();
