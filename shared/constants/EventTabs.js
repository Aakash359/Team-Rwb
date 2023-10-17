const EVENT_TAB_TYPES = {
  local: 'local',
  virtual: 'virtual',
  my: 'my',
};

const GROUP_EVENT_TAB_TYPES = {
  local: 'local',
  virtual: 'virtual',
  past: 'past',
};

const CHALLENGE_EVENT_TAB_TYPES = {
  upcoming: 'upcoming',
  past: 'past',
};

const EVENT_NAV_ELEMENTS = [
  {
    name: 'Local Events',
    key: 'local',
  },
  {
    name: 'Virtual Events',
    key: 'virtual',
  },
  {
    name: 'My Events',
    key: 'my',
  },
];

const MY_EVENT_TYPES = {
  hosting: 'hosting',
  upcoming: 'upcoming',
  past: 'past',
};

const GROUP_EVENT_NAV_ELEMENTS = [
  {
    name: 'Local',
    key: 'local',
  },
  {
    name: 'Virtual',
    key: 'virtual',
  },
  {
    name: 'Past',
    key: 'past',
  },
];

const CHALLENGE_EVENT_NAV_ELEMENTS = [
  {
    name: 'Upcoming',
    key: 'upcoming',
  },
  {
    name: 'Past',
    key: 'past',
  },
];

const PAST_EVENT_TYPES = {
  local: 'local',
  virtual: 'virtual',
};

const CREATE_EVENT_NAV_ELEMENTS = [
  {
    name: 'Local',
    key: 'local',
  },
  {
    name: 'Virtual',
    key: 'virtual',
  },
];

const FILTER_NAV_TABS = [
  {
    name: 'All Events',
    key: 'all',
  },
  {
    name: 'Group Events',
    key: 'group',
  },
  {
    name: 'Member Events',
    key: 'member',
  },
];

export {
  EVENT_TAB_TYPES,
  GROUP_EVENT_TAB_TYPES,
  CHALLENGE_EVENT_TAB_TYPES,
  EVENT_NAV_ELEMENTS,
  MY_EVENT_TYPES,
  GROUP_EVENT_NAV_ELEMENTS,
  PAST_EVENT_TYPES,
  CREATE_EVENT_NAV_ELEMENTS,
  CHALLENGE_EVENT_NAV_ELEMENTS,
  FILTER_NAV_TABS,
};
