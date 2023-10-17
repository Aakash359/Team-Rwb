// Versions are the initial versions of the public release
const FEED_VERSION = "2.0.18";
const GROUP_VERSION = "2.1.1"

// Updated versions are one minor version higher of the public relased version
// this is to keep updating past a version before a different onboarding process happens, to a screen that might not be visited
// ex. Feed tab and group onboarding are on different screens. Updating the version after going through the feed onboarding,
// but the user does not access the group tab could prevent viewing that onboarding information
const UPDATED_FEED_VERSION = "2.0.19";

export {FEED_VERSION, UPDATED_FEED_VERSION, GROUP_VERSION}
