'use strict';

export const EVENT_OPTIONS = {
  'all-activities': {
    display: 'All Activities',
    slug: null
  },
  'cycle-mtb': {
    display: 'Cycle/MTB',
    slug: 'cycle-mtb'
  },
  'functional-fitness': {
    display: 'Functional Fitness',
    slug: 'functional-fitness'
  },
  'hike-ruck': {
    display: 'Hike/Ruck',
    slug: 'hike-ruck'
  },
  'meeting': {
    display: 'Meeting',
    slug: 'meeting'
  },
  'ocr': {
    display: 'OCR',
    slug: 'ocr'
  },
  'other-physical': {
    display: 'Other – Physical',
    slug: 'other-physical'
  },
  'rock-climbing': {
    display: 'Rock Climbing',
    slug: 'rock-climbing'
  },
  'run-walk': {
    display: 'Run/Walk',
    slug: 'run-walk'
  },
  'service': {
    display: 'Service',
    slug: 'service'
  },
  'social': {
    display: 'Social',
    slug: 'social'
  },
  'swim': {
    display: 'Swim',
    slug: 'swim'
  },
  'team-sports': {
    display: 'Team Sports',
    slug: 'team-sports'
  },
  'training': {
    display: 'Training',
    slug: 'training'
  },
  'triathlon': {
    display: 'Triathlon',
    slug: 'triathlon'
  },
  'water-sports': {
    display: 'Water Sports',
    slug: 'water-sports'
  },
  'winter-sports': {
    display: 'Winter Sports',
    slug: 'winter-sports'
  },
  'yoga': {
    display: 'Yoga',
    slug: 'yoga'
  },
};

export const DISTANCE_OPTIONS = {
  '25-miles': {
    display: '25 Miles',
    label: '25 MI',
    slug: 25
  },
  '50-miles': {
    display: '50 Miles',
    label: '50 MI',
    slug: 50
  },
  '100-miles': {
    display: '100 Miles',
    label: '100 MI',
    slug: 100
  },
  '250-miles': {
    display: '250 Miles',
    label: '250 MI',
    slug: 250
  }
};

export const DATE_OPTIONS = {
  'today': {
    display: 'Today',
    slug: 'today'
  },
  'all': {
    display: 'All Upcoming',
    slug: 'all'
  },
  'next-7': {
    display: 'Next 7 Days',
    slug: 'next-7'
  },
  'next-30': {
    display: 'Next 30 days',
    slug: 'next-30'
  },
  'past-30': {
    display: 'Past 30 days',
    slug: 'past-30'
  }
};

export const HOST_OPTIONS = {
  'all': {
    display: 'All',
    slug: 'all'
  },
  'member': {
    display: 'Member',
    slug: 'member'
  },
  'group': {
    display: 'Group',
    slug: 'group'
  }
};

export const MY_EVENT_OPTIONS = {
  'hosting': {
    display: 'Hosting',
    slug: 'hosting'
  },
  'upcoming': {
    display: 'Upcoming',
    slug: 'upcoming'
  },
  'past': {
    display: 'Past',
    slug: 'past'
  }
}

export const GROUP_OPTIONS = {
  'my-groups': {
    display: 'My Groups',
    slug: 'my-groups'
  },
  'my-activity': {
    display: 'My Activity Groups',
    slug: 'my-activity'
  },
  'my-sponsor': {
    display: 'My Sponsor Groups',
    slug: 'my-sponsor'
  },
}

export const VIRTUAL_GROUP_OPTIONS = {
  'national': {
    display: 'Team RWB National',
    slug: 'national'
  },
  'my-groups': {
    display: 'My Groups',
    slug: 'my-groups'
  },
}

export const VIRTUAL_TIME_OPTIONS = {
  'all': {
    display: 'All Times',
    slug: 'all'
  },
  'live': {
    display: 'Live Events',
    slug: 'live'
  },
  'all-day': {
    display: 'All-day Events',
    slug: 'all-day'
  }
}

export const SORT_OPTIONS = {
  // 'distance': {
  //   display: 'Distance',
  //   slug: 'distance'
  // },
  'date': {
    display: 'Date',
    slug: 'date'
  },
  'attendees': {
    display: 'Attendees',
    slug: 'attendees'
  }
};

export const VIRTUAL_EVENT_OPTIONS = {
  'all': {
    display: 'All Virtual Events',
    slug: 'all'
  },
  'challenges': {
    display: 'Challenges',
    slug: 'challenges'
  },
  'workouts': {
    display: 'Workouts',
    slug: 'workouts'
  },
};

// same as EVENT_OPTIONS, but in a different order of popularity at time 
export const GROUP_EVENT_OPTIONS = {
  'run-walk': {
    display: 'Run/Walk',
    slug: 'run-walk'
  },
  'hike-ruck': {
    display: 'Hike/Ruck',
    slug: 'hike-ruck'
  },
  'social': {
    display: 'Social',
    slug: 'social'
  },

  'cycle-mtb': {
    display: 'Cycle/MTB',
    slug: 'cycle-mtb'
  },
  'functional-fitness': {
    display: 'Functional Fitness',
    slug: 'functional-fitness'
  },

  'meeting': {
    display: 'Meeting',
    slug: 'meeting'
  },
  'ocr': {
    display: 'OCR',
    slug: 'ocr'
  },
  'other-physical': {
    display: 'Other – Physical',
    slug: 'other-physical'
  },
  'rock-climbing': {
    display: 'Rock Climbing',
    slug: 'rock-climbing'
  },

  'service': {
    display: 'Service',
    slug: 'service'
  },

  'swim': {
    display: 'Swim',
    slug: 'swim'
  },
  'team-sports': {
    display: 'Team Sports',
    slug: 'team-sports'
  },
  'training': {
    display: 'Training',
    slug: 'training'
  },
  'triathlon': {
    display: 'Triathlon',
    slug: 'triathlon'
  },
  'water-sports': {
    display: 'Water Sports',
    slug: 'water-sports'
  },
  'winter-sports': {
    display: 'Winter Sports',
    slug: 'winter-sports'
  },
  'yoga': {
    display: 'Yoga',
    slug: 'yoga'
  },
};

export const PAST_GROUP_EVENT_OPTIONS = {
  'local': {
    display: 'Local Events',
    slug: 'local',
  },
  'virtual': {
    display: 'Virtual Events',
    slug: 'virtual',
  }
}
