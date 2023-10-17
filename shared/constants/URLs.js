'use strict';
import {isDev} from '../utils/IsDev';

const env = isDev()
  ? 'staging' // set to 'dev'/'staging' for appropriate server
  : 'prod';

let d;
if (env === 'staging') {
  d = 'https://teamrwbstage.wpengine.com/';
} else if (env === 'prod') {
  d = 'https://www.teamrwb.org/';
} else if (env === 'dev') {
  d = 'https://teamrwbdev.wpengine.com/';
}

// Overwrite or comment for local development server
// d = 'http://192.168.64.2/test3/'

export const DOMAIN = d; // used for API and external links

export const TEAMRWB = {
  contact: `${DOMAIN}/about-us/contact/`,
  lostpassword: `${DOMAIN}/wp-login.php?action=lostpassword`,
};

let deepLinkPrefix;
if (env !== 'prod') {
  deepLinkPrefix = /https:\/\/teamrwbdev.wpengine.com\/|https:\/\/teamrwbstage.wpengine.com\/|https:\/\/members-staging.teamrwb.org\/|https:\/\/www.teamrwb.org\/|teamrwb:\/\//;
} else {
  deepLinkPrefix = /https:\/\/www.teamrwb.org\/|teamrwb:\/\/|members.teamrwb.org\//;
}

export const RWB_DEEP_LINK_PREFIX = deepLinkPrefix;

export const ONEALL_DOMAIN = `https://teamrwb.api.oneall.com`;
export const ONEALL_CALLBACK = `https://teamrwb.api.oneall.com/socialize/callback.html`;

export const NEWSLETTER_PREFERENCES = `https://preferences.teamrwb.org/preferences?contact_id=`;

export const ENVIRONMENT = env;
