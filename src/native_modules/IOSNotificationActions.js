'use strict';

import {NativeModules, NativeAppEventEmitter} from 'react-native';
const {IOSNotificationAction} = NativeModules;

let actions = {};

function handleActionCompleted() {
  IOSNotificationAction.callCompletionHandler();
}

export class IOSAction {
  constructor(options, onComplete) {
    this.options = options;
    this.onComplete = onComplete;
    actions[options.identifier] = this;
    NativeAppEventEmitter.addListener('notificationActionReceived', (body) => {
      if (body.identifier === options.identifier) {
        onComplete(body, handleActionCompleted);
      }
    });
  }
}

export class IOSCategory {
  constructor(options) {
    if (typeof options.identifier !== 'string')
      throw new Error('identifier must be a string.');
    if (typeof options.actions !== 'object' && !Array.isArray(option.actions))
      throw new Error('actions must be an array of IOSAction.');
    if (typeof options.forContext !== 'string')
      throw new Error('forContext must be a string.');

    this.options = options;
  }
}

export const updateCategories = (categories) => {
  let mappedCategories = categories.map((category) => {
    return Object.assign({}, category.options, {
      actions: category.options.actions.map((action) => action.options),
    });
  });
  IOSNotificationAction.updateCategories(mappedCategories);
  NativeAppEventEmitter.addListener('remoteNotificationsRegistered', () => {
    IOSNotificationAction.updateCategories(mappedCategories);
  });
};

export default {
  IOSAction,
  IOSCategory,
  updateCategories,
};
