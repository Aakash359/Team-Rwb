// Shared text used between web and mobile not specific to errors

const GROUP_SEARCH_INSTRUCTIONS =
  'Search for groups by name or activity or enter zip or "city, state" to search for groups by location.';

const FEED_INSTRUCTIONS =
  'Nothing on your feed. Make a post, go to an event, or follow a user!';

const NO_NOTIFICATIONS = 'No Notifications';

const NO_ACTIVE_CHALLENGES = 'No Active Challenges';

const NO_PAST_CHALLENGES = 'No Past Challenges';

const NO_BLOCKED_USERS = 'No Blocked Users';

const WORKOUT_WARNINGS = {
  milesLength: 'TOO LARGE OF AN INPUT, NO MORE THAN 1000 MILES MAY BE USED',
  milesDigit: 'TOO LARGE OF A NUMBER, NO MORE THAN SIX DIGITS MAY BE USED',
  stepsLength: 'TOO LARGE OF AN INPUT, NO MORE THAN 100000 STEPS MAY BE USED',
  timeRequired: 'A TIME IS REQUIRED',
  timeLength: 'TOO LARGE OF AN INPUT, TIME ENTERED MUST BE NO MORE THAN A DAY',
  milesDecimals:
    'TOO MANY DECIMAL PLACES, NO MORE THAN TWO DECIMAL PLACES MAY BE USED',
  emptyWorkout: 'Empty workout not allowed. Please enter at least one field.',
};

const WORKOUT_DELETE_WARNING = 'Are you sure you want to delete this workout?';

const POST_DELETE_WARNING = 'Are you sure you want to delete your post?';

const POST_BLOCK_WARNING = 'Are you sure you want to block this post?';

export {
  GROUP_SEARCH_INSTRUCTIONS,
  FEED_INSTRUCTIONS,
  NO_NOTIFICATIONS,
  NO_ACTIVE_CHALLENGES,
  NO_PAST_CHALLENGES,
  WORKOUT_WARNINGS,
  WORKOUT_DELETE_WARNING,
  POST_DELETE_WARNING,
  POST_BLOCK_WARNING,
  NO_BLOCKED_USERS,
};
