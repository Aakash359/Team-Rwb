// All analytics constants, bucketed by category.
// Each value for BUCKET.events.KEY is a 2-tuple, containing [Event, Label].

export const SIGNING_UP = {
    category: 'Registration',
    events: {
        CREATE_ACCOUNT: [
            'create_account',
            'Create Account'
        ],
        VERIFY_EMAIL: [
            'verify_email',
            'Verify Email'
        ],
        PERSONAL_INFO: [
            'personal_information',
            'Personal Information'
        ],
        SOCIAL_PROFILE: [
            'social_profile',
            'Social Profile',
        ],
        MILTARY_SERVICE: [
            'military_service',
            'Military Service'
        ],
        COMPLETE_REGISTRATION: [
            'complete_registration',
            'Complete Registration'
        ],
        GET_RED_SHIRT: [
            'get_red_shirt',
            'Get Red Shirt'
        ],
        PAY_FOR_SHIRT: [
            'pay_for_shirt',
            'Pay for Shirt'
        ],
        ORDER_CONFIRMATION: [
            'order_confirmation',
            'Order Confirmation'
        ],
    }
}

export const NAVIGATING_THE_APP = {
    category: 'Navigation',
    events: {
        ACCESS_FEED: [
            'feed_tab',
            'Feed Tab'
        ],
        ACCESS_EVENTS: [
            'events_tab',
            'Events Tab'
        ],
        ACCESS_NOTIFICATIONS: [
            'notifications_tab',
            'Notifications Tab',
        ],
        ACCESS_MY_PROFILE: [
            'my_profile_tab',
            'My Profile Tab'
        ],
    }
}

export const MANAGING_PROFILE_AND_SETTINGS = {
    category: 'Profile Management',
    events: {
        UPDATE_COVER_PHOTO: [
            'cover_photo',
            'Cover Photo'
        ],
        UPDATE_PROFILE_PHOTO: [
            'profile_photo',
            'Profile Photo'
        ],
        EDIT_BUTTON: [
            'edit_button',
            'Edit Button'
        ],
        ACCESS_FOLLOWERS: [
            'followers',
            'Followers'
        ],
        ACCESS_FOLLOWING: [
            'following',
            'Following'
        ],
        UPDATE_PROFILE: [
            'edit_profile',
            'Edit Profile'
        ],
        UPDATE_MILITARY_SERVICE: [
            'military_service',
            'Military Service'
        ],
        UPDATE_CHAPTER_PREFERENCES: [
            'chapter_preferences',
            'Chapter Preferences'
        ],
        ACCESS_APP_SETTINGS: [
            'app_settings',
            'App Settings'
        ],
        UPDATE_PERSONAL_INFORMATION: [
            'personal_information',
            'Personal Information'
        ],
        UPDATE_PASSWORD: [
            'update_password',
            'Update Password'
        ],
        FORGOT_PASSWORD: [
            'forgot_password',
            'Forgot Password'
        ],
        UPDATE_PRIVACY_SETTINGS: [
            'privacy_settings',
            'Privacy Settings'
        ],
        LOGIN: [
            'login',
            'Login'
        ],
        LOGOUT: [
            'logout',
            'Logout'
        ],
    }
}

export const SEARCHING_FOR_AND_PARTICIPATING_IN_EVENTS = {
    category: 'Event Participation',
    events: {
        EVENT_SEARCH: [
            'search',
            'Search'
        ],
        ACCESS_MY_EVENTS: [
            'my_events',
            'My Events'
        ],
        ACCESS_FILTERS: [
            'filters',
            'Filters'
        ],
        DETAILED_EVENT_FILTERS: [
            'detailed_event_filters',
            'DETAILED EVENT FILTERS'
        ],
        TOGGLE_HIDE_VIRTUAL: [
            'hide_virtual',
            'Hide Virtual'
        ],
        DISTANCE: [
            'distance_filter',
            'Distance'
        ],
        DATE: [
            'date_filter',
            'Date'
        ],
        HOST: [
            'host_filter',
            'Host'
        ],
        SORT_BY: [
            'sort_filter',
            'Sort By'
        ],
        ACCESS_EVENT_DETAILS: [
            'view_event_details',
            'View Event Details'
        ],
        UPCOMING_EVENTS: [
            'upcoming_events',
            'Upcoming Events'
        ],
        PAST_EVENTS: [
            'past_events',
            'Past Events'
        ],
        INTERESTED: [
            'interested',
            'Interested'
        ],
        GOING: [
            'going',
            'Going'
        ],
        CHECKED_IN: [
            'checked_in',
            'Check-in'
        ],
        CALENDAR: [
            'calendar',
            'Calendar'
        ],
        MAP: [
            'map',
            'Map'
        ],
        ADDRESS: [
            'address',
            'Address'
        ],
        SHARE: [
            'share',
            'Share'
        ],
        ATTENDEES: [
            'attendees',
            'Attendees'
        ],
        CREATE_POST: [
            'event_post',
            'Event Post'
        ],
        REACT_POST: [
            'event_like',
            'Event Like'
        ],
        TOGGLE_LOZENGE: [
            'toggle_lozenge',
            'Toggle Lozenge'
        ],
        EVENT_STATUS: [
            'event_status',
            'Event Status'
        ],
    }
}

export const CREATING_AND_MANAGING_EVENTS = {
    category: 'Event Management',
    events: {
        START_EVENT_CREATION: [
            'event_button',
            'Event Button'
        ],
        CHOOSE_CHAPTER_EVENT: [
            'choose_chapter_event',
            'Choose Chapter Event'
        ],
        CHOOSE_MEMBER_EVENT: [
            'choose_member_event',
            'Choose Member Event'
        ],
        CREATE_EVENT: [
            'create_event',
            'Create Event'
        ],
        CANCEL_EVENT: [
            'cancel_event',
            'Cancel Event'
        ],
        UPDATE_EVENT: [
            'update_event',
            'Update Event'
        ],
        CHANGE_COVER_PHOTO: [
            'cover_photo',
            'Cover Photo'
        ],
    }
}

export const NOTIFICATIONS = {
    category: 'Notifications',
    events: {
        ACCESS_NOTIFICATION: [
            'access_notification',
            'Access Notification'
        ],
        NOTIFICATIONS_LIKE: [
            'notifications_like',
            'Notifications Like'
        ],
    }
}

export const FEED = {
    category: 'Feed',
    events: {
        CREATE_POST: [
            'feed_post',
            'Feed Post'
        ],
        REACT_POST: [
            'feed_like',
            'Feed Like'
        ],
        SEARCH_FOR_PEOPLE: [
            'people_search',
            'People Search'
        ],
        FOLLOW: [
            'follow',
            'Follow'
        ],
        UNFOLLOW: [
            'unfollow',
            'Unfollow'
        ],
    }
}

export const CHALLENGES = {
    category: 'Challenges',
    events: {
        JOIN_CHALLENGE: [
            'join_challenge',
            'Join Challenge'
        ],
        LEAVE_CHALLENGE: [
            'leave_challenge',
            'Leave Challenge'
        ],
        VIEW_EVENTS: [
            'view_events',
            'View Events'
        ]
    }
}

export const ACTION_CATEGORIES = {
    administrative: 'administrative',
    social: 'social',
    registration: 'registration', 
}
