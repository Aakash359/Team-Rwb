// This file's purpose is to hold all expected error messages that we want to have specific behavior for

const STREAM_ERRORS = {
  ALREADY_REACTED: 'You have already reacted to this post.',
  REACTION_NOT_FOUND: 'The reaction was not found.',
};

const REPORT_ERROR =
  'There was an error sending your report. Please try again later.';

const GET_VERSION_ERROR = 'Unable to retrieve version number.';

const LOCATION_PERMISSION_ERROR =
  'You have not given Team RWB permission to access your location.\nPlease enter your settings and allow us to access your location.';

const NO_LOCATION_ERROR =
  "Team RWB couldn't find your location. Please make sure location services are enabled on this device.";

const GENERAL_LOCATION_ERROR =
  'An error occurred trying to find your location. Please try again later.';

const NO_USERS_FOUND = 'No Users Found';

const NO_GROUPS_FOUND = 'No groups matching search term.';

const NO_GROUPS_TIP =
  'If searching for groups by location, please use zip or "city, state" format in the searchbar.';

const USER_SEARCH_ERROR =
  'An error occurred trying to search users. Please try again later.';

const GROUP_SEARCH_ERROR =
  'An error occurred trying to search groups. Please try again later.';

const GROUP_FEED_ERROR =
  'An error occurred trying to retrieve the group feed. Please try again later.';

const INVALID_LOGIN_ERROR = 'Invalid username or password.';

const INVALID_PASSWORD_ERROR = 'Invalid password.';

const INTERNATIONAL_ADDRESS_ERROR =
  'RWB shirts are only available for shipping to US locations. If you have a domestic address, please update it for shipping to receive your red shirt.';

const ADDRESS_VERIFICATION_ERROR =
  'Could not verify address. Please submit your address via manual entry.';

const JOIN_CHALLENGE_ERROR =
  'Unable to join this challenge. Please try again later.';

const LOAD_CHALLENGE_ERROR =
  'Unable to load this challenge. Please try again later.';

const POST_BLOCK_ERROR = 'Error blocking the post. Please try again later.';

const POST_DELETE_ERROR = 'Error deleting the post. Please try again later.';

export {
  STREAM_ERRORS,
  REPORT_ERROR,
  GET_VERSION_ERROR,
  LOCATION_PERMISSION_ERROR,
  NO_LOCATION_ERROR,
  GENERAL_LOCATION_ERROR,
  NO_USERS_FOUND,
  NO_GROUPS_FOUND,
  USER_SEARCH_ERROR,
  GROUP_SEARCH_ERROR,
  GROUP_FEED_ERROR,
  INVALID_LOGIN_ERROR,
  INVALID_PASSWORD_ERROR,
  NO_GROUPS_TIP,
  INTERNATIONAL_ADDRESS_ERROR,
  ADDRESS_VERIFICATION_ERROR,
  JOIN_CHALLENGE_ERROR,
  LOAD_CHALLENGE_ERROR,
  POST_BLOCK_ERROR,
  POST_DELETE_ERROR,
};
