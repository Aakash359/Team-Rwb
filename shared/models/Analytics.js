/**
 * See https://docs.google.com/spreadsheets/d/1c9bjilCXWcjyC-nTee8jJOB01BzMn_idSMRxv1V3c94/edit#gid=1787567816
 * for latest business requirements.
 *
 * Last revised: 2020-08-18
 */

import firebase from '../utils/firebase';
import {
  eventsConstants,
  labelConstants,
  categoryConstants,
  parameterConstants,
} from '../constants/analyticsConstants';
import {userProfile} from './UserProfile';
import {
  SIGNING_UP as SI,
  NAVIGATING_THE_APP as NA,
  MANAGING_PROFILE_AND_SETTINGS as M,
  SEARCHING_FOR_AND_PARTICIPATING_IN_EVENTS as SE,
  CREATING_AND_MANAGING_EVENTS as C,
  NOTIFICATIONS as NO,
  FEED as F,
  CHALLENGES as CH,
  ACTION_CATEGORIES,
} from '../constants/newAnalytics';
import {version as currentVersion} from '../../package.json';

const formatParameters = (section_name, parameters) => {
  parameters.section_name = section_name;
  return parameters;
}

const oldLogEvent = (event, category, label, parameter = null) => {
  const Analytics = firebase.analytics();
  const userProf = userProfile.getUserProfile();
  if (userProf.id) {
    Analytics.setUserId(userProf.id.toString());
  }
  Analytics.logEvent(
    event,
    Object.assign(
      {
        category,
        label,
      },
      parameter ? {parameter} : {},
    ),
  );
};

function logEvent(category, event, parameter = {}) {
  const Analytics = firebase.analytics();
  const userProf = userProfile.getUserProfile();
  if (userProf.id) {
    Analytics.setUserId(userProf.id.toString());
  }
  parameter.app_version = currentVersion;
  const meta = Object.assign(
    {
      category: category,
      label: event[1],
    },
    parameter,
  );
  // check all parameters are there
  // console.log(event, meta);
  Analytics.logEvent(event[0], meta);
}

// signing up

export const logCreateAccount = (params) => {
  const analyticsParams = {

  };
  logEvent(SI.category, SI.events.CREATE_ACCOUNT);
};

export const logVerifyEmail = (params) => {
  const analyticsParams = {
    'current_view': 'Verify Your Email',
    'action_category': 'registration',
    'action_component': 'cta',
    'click_text': 'NEXT',
    'step_for_completion': '2'
  };
  logEvent(SI.category, SI.events.VERIFY_EMAIL);
};

export const logPersonalInfo = (params) => {
  const analyticsParams = {
    'current_view': 'Personal Information',
    'action_category': 'registration',
    'action_component': 'cta',
    'click_text': 'NEXT',
    'step_for_completion': '3'
  }
  logEvent(SI.category, SI.events.PERSONAL_INFO);
};

export const logSocialProfile = (params) => {
  const analyticsParams = {
    'current_view': 'Social Information',
    'action_category': 'registration',
    'action_component': 'cta',
    'click_text': 'NEXT',
    'step_for_completion': '4'
  }
  logEvent(SI.category, SI.events.SOCIAL_PROFILE);
};

export const logMilitaryService = (params) => {
  const analyticsParams = {
    'current_view': 'Military Service',
    'action_category': 'registration',
    'action_component': 'cta',
    'click_text': 'NEXT',
    'step_for_completion': '5'
  }
  logEvent(SI.category, SI.events.MILTARY_SERVICE);
};

// privacy waiver
export const logCompleteRegistration = (params) => {
  const analyticsParams = {
    'current_view': 'Privacy/Waiver',
    'action_category': 'registration',
    'action_component': 'cta',
    'click_text': 'COMPLETE REGISTRATION',
    'step_for_completion': '6'
  }
  logEvent(SI.category, SI.events.COMPLETE_REGISTRATION);
};

export const logGetRedShirt = (params) => {
  const analyticsParams = {
    'current_view': 'Welcome to the Team!',
    'action_category': 'registration',
    'action_component': 'cta',
    'click_text': 'GET MY RED SHIRT',
    'step_for_completion': '7'
  }
  logEvent(SI.category, SI.events.GET_RED_SHIRT);
};

export const logPayForShirt = (params) => {
  const analyticsParams = {
    'current_view': 'Get your red shirt!',
    'action_category': 'registration',
    'action_component': 'cta',
    'click_text': 'PAY $5.00',
    'step_for_completion': '8'
  }
  logEvent(SI.category, SI.events.PAY_FOR_SHIRT);
};

export const logOrderConfirmation = (params) => {
  const analyticsParams = {
    'current_view': 'Order Confirmation',
    'action_category': 'registration',
    'action_component': 'cta',
    'click_text': 'CONTINUE',
    'step_for_completion': '9'
  }
  logEvent(SI.category, SI.events.ORDER_CONFIRMATION);
};

// Navigation the app

export const logAccessFeed = () => {
  logEvent(NA.category, NA.events.ACCESS_FEED);
};

export const logAccessEvents = () => {
  logEvent(NA.category, NA.events.ACCESS_EVENTS);
};

export const logAccessNotifications = () => {
  logEvent(NA.category, NA.events.ACCESS_NOTIFICATIONS);
};

// uncomment after challenges are added to analytics :

// export const logAccessChallenges = () => {
//   logEvent(
//     NA.category,
//     NA.events.ACCESS_CHALLENGES,
//   );
// };

export const logAccessMyProfile = () => {
  logEvent(NA.category, NA.events.ACCESS_MY_PROFILE);
};

// Managing Profile & Settings

// TODO: the params.has_image comes in as `1` on mobile and `true` on web. Determine if the boolean bigquery field treats them the same
export const logProfileCoverPhoto = (params) => {
  const analyticsParams = {
    'action_category': 'social',
    'action_component': 'icon',
  }
  logEvent(M.category, M.events.UPDATE_COVER_PHOTO);
};

export const logProfilePhoto = () => {
  logEvent(M.category, M.events.UPDATE_PROFILE_PHOTO);
};

export const logEditButton = () => {
  logEvent(M.category, M.events.EDIT_BUTTON);
};

export const logAccessFollowers = () => {
  logEvent(M.category, M.events.ACCESS_FOLLOWERS);
};

export const logAccessFollowing = (params) => {
  logEvent(M.category, M.events.ACCESS_FOLLOWING);
};

export const logUpdateProfile = (params) => {
  logEvent(M.category, M.events.UPDATE_PROFILE);
};

export const logUpdateMilitaryService = (params) => {
  const analyticsParams = {
    'current_view': 'Military Service',
    'action_category': 'registration',
    'action_component': 'cta',
    'click_text': 'NEXT',
    'step_for_completion': '5'
  }
  logEvent(M.category, M.events.UPDATE_MILITARY_SERVICE);
};

export const logAccessAppSettings = (params) => {
  logEvent(M.category, M.events.ACCESS_APP_SETTINGS);
};

export const logUpdatePersonalInformation = (params) => {
  const analyticsParams = {
    'current_view': 'Personal Information',
    'action_category': 'registration',
    'action_component': 'cta',
    'click_text': 'NEXT',
    'step_for_completion': '3'
  }
  logEvent(M.category, M.events.UPDATE_PERSONAL_INFORMATION);
};

export const logUpdatePassword = (params) => {
  logEvent(M.category, M.events.UPDATE_PASSWORD);
};

export const logForgotPassword = (params) => {
  logEvent(M.category, M.events.FORGOT_PASSWORD);
};

export const logUpdatePrivacySettings = (params) => {
  logEvent(M.category, M.events.UPDATE_PRIVACY_SETTINGS);
};

export const logLogin = (params) => {
  logEvent(M.category, M.events.LOGIN);
};

export const logLogout = (params) => {
  logEvent(M.category, M.events.LOGOUT);
};

// Search For & Participate in Events

// search for events
export const logSearch = () => {
  logEvent(SE.category, SE.events.EVENT_SEARCH);
};

// upcoming activites?
export const logAccessMyEvents = () => {
  logEvent(SE.category, SE.events.ACCESS_MY_EVENTS);
};

export const logAccessFilters = () => {
  logEvent(SE.category, SE.events.ACCESS_FILTERS);
};

export const logToggleHideVirtual = () => {
  logEvent(SE.category, SE.events.TOGGLE_HIDE_VIRTUAL);
};

export const logAccessEventDetails = () => {
  logEvent(SE.category, SE.events.ACCESS_EVENT_DETAILS);
};

export const logEventStatus = (params) => {
  const analytics_params = {
    action_category: 'event',
    action_component: 'cta',
  };
  logEvent(SE.category, SE.events.EVENT_STATUS);
}

export const logCalendar = (params) => {
  const analytics_params = {
    action_category: 'event',
  }
  logEvent(SE.category, SE.events.CALENDAR);
};

export const logMap = () => {
  logEvent(SE.category, SE.events.MAP);
};

export const logAddress = () => {
  logEvent(SE.category, SE.events.ADDRESS);
};

export const logShare = () => {
  logEvent(SE.category, SE.events.SHARE);
};

export const logAttendees = () => {
  logEvent(SE.category, SE.events.ATTENDEES);
};

export const logEventCreatePost = () => {
  logEvent(SE.category, SE.events.CREATE_POST);
};

// might change to like when comment is added
// commenting is a react, unless we plan on doing the same call for comment
export const logEventReactPost = () => {
  logEvent(SE.category, SE.events.REACT_POST);
};

export const logToggleLozenge = (params) => {
  const analytics_params = {
    action_category: 'event',
  }
  logEvent(SE.category, SE.events.TOGGLE_LOZENGE);
}

// Creating and Managing Events

export const logStartEventCreation = () => {
  logEvent(C.category, C.events.START_EVENT_CREATION);
};

export const logChooseChapterEvent = () => {
  logEvent(C.category, C.events.CHOOSE_CHAPTER_EVENT);
};

export const logChooseMemberEvent = () => {
  logEvent(C.category, C.events.CHOOSE_MEMBER_EVENT);
};

export const logCreateEvent = (params) => {
  const analyticsParams = {
    'action_category': 'social',
    'action_component': 'create'
  }
  logEvent(C.category, C.events.CREATE_EVENT);
};

export const logCancelEvent = (params) => {
  const analyticsParams = {
    'action_category': 'social',
    'action_component': 'create',
  }
  logEvent(C.category, C.events.CANCEL_EVENT);
};

export const logUpdateEvent = (params) => {
  const analyticsParams = {
    'action_category': 'social',
    'action_component': 'create',
  }
  logEvent(C.category, C.events.UPDATE_EVENT);
};

export const logEventCoverPhoto = (params) => {
  const analyticsParams = {
    'action_category': ACTION_CATEGORIES.administrative,
    'action_component': 'icon',
  }
  logEvent(C.category, C.events.CHANGE_COVER_PHOTO);
};

// Notifications

export const logAccessNotification = () => {
  logEvent(NO.category, NO.events.ACCESS_NOTIFICATION);
};

export const logNotificationsLike = () => {
  logEvent(NO.category, NO.events.NOTIFICATIONS_LIKE);
};

// Feed

export const logFeedCreatePost = () => {
  logEvent(F.category, F.events.CREATE_POST);
};

// might change to like when comment is added
// commenting is a react, unless we plan on doing the same call for comment
export const logFeedReactPost = () => {
  logEvent(F.category, F.events.REACT_POST);
};

export const logSearchForPeople = () => {
  logEvent(F.category, F.events.SEARCH_FOR_PEOPLE);
};

export const logFollow = () => {
  logEvent(F.category, F.events.FOLLOW);
};

export const logUnfollow = () => {
  logEvent(F.category, F.events.UNFOLLOW);
};

export const logJoinChallenge = (params) => {
  // current view will come from the passed params and can be feed or hub
  const analyticsParams = {
    'action_category': 'social',
    'action_component': 'cta',
    'click_text': 'Join Challenge',
  }
  logEvent(CH.category, CH.events.JOIN_CHALLENGE);
};

export const logLeaveChallenge = (params) => {
  const analyticsParams = {
    'current_view': 'feed',
    'action_category': 'social',
    'action_component': 'cta',
    'click_text': 'Leave Challenge',
  }
  logEvent(CH.category, CH.events.LEAVE_CHALLENGE);
};

export const logViewChallengeEvents = (params) => {
  const analyticsParams = {
    'current_view': 'feed',
    'action_category': 'social',
    'action_component': 'cta',
  }
  logEvent(CH.category, CH.events.VIEW_EVENTS);
};

export const EXECUTION_STATUS = {
  success: 'success',
  failure: 'failure'
}

// Older analytics

export const logDistanceFilter = () => {
  logEvent(SE.category, SE.events.DISTANCE);
};

export const logActivityFilter = () => {
  oldLogEvent(
    eventsConstants.ACTIVITY_FILTER,
    categoryConstants.EVENT_LIST,
    labelConstants.ACTIVITY_FILTER,
  );
};

export const logDateFilter = () => {
  logEvent(SE.category, SE.events.DATE);
};

export const logChapterToggle = () => {
  // currently unused
  oldLogEvent(
    eventsConstants.CHAPTER_TOGGLE,
    categoryConstants.EVENT_LIST,
    labelConstants.CHAPTER_TOGGLE,
  );
};

export const logHostFilter = () => {
  logEvent(SE.category, SE.events.HOST);
};

export const logDetailedEventFilters = (params) => {
  const analyticsParams = {
    'current_view': 'event filters',
    'previous_view': 'events hub',
    'action_category': 'event',
    'action_component': 'cta',
    'click_text': 'apply',
  }
  logEvent(SE.category, SE.events.DETAILED_EVENT_FILTERS);

}

export const logSortFilter = () => {
  logEvent(SE.category, SE.events.SORT_BY);
};

export const logVirtualToggle = () => {
  oldLogEvent(
    eventsConstants.VIRTUAL_TOGGLE,
    categoryConstants.EVENT_LIST,
    labelConstants.VIRTUAL_TOGGLE,
  );
};

export const logInterestedNotification = () => {
  oldLogEvent(
    eventsConstants.INTERESTED_NOTIFICATION,
    categoryConstants.NOTIFICATION,
    labelConstants.INTERESTED_NOTIFICATION,
    parameterConstants.EVENT_STATUS,
  );
};

export const logGoingNotification = () => {
  oldLogEvent(
    eventsConstants.GOING_NOTIFICATION,
    categoryConstants.NOTIFICATION,
    labelConstants.GOING_NOTIFICATION,
    parameterConstants.EVENT_STATUS,
  );
};

export const logCheckInNotification = () => {
  oldLogEvent(
    eventsConstants.CHECK_IN_NOTIFICATION,
    categoryConstants.NOTIFICATION,
    labelConstants.CHECK_IN_NOTIFICATION,
    parameterConstants.EVENT_STATUS,
  );
};
