// This file should never be imported from directly. Keep it out of the dependency graph,
// and use APIKeys-obfuscated.js instead.

import {isDev} from '../utils/IsDev';

const env = isDev()
  ? 'staging' // set to 'dev'/'staging' for appropriate server
  : 'prod';

let basicToken;
if (env !== 'prod') {
  basicToken =
    'amtsNjVjQmVadUNkTzdoMm52cGl6bDhsWm9YRWJSa3RiNmUxaXk5YjpSbFZuMmVDNjk1Q3VMMkNoaTE1M214MHJ1NGtoNmQwOWNCUTV2bjFF';
} else {
  // This token also valid for teamrwbdev.wpengine.com
  basicToken =
    'SW1oWTAxSmtJVW9hS2xxM1FhTVJIVTQwdGJXbDhYUVNjemY4VUR4UToxRzROeHNiaHAxSTc4S2ZWdnd1VXZ0c3oweHVIMlFBdU9wczJjR0ll';
}

export const BASIC_TOKEN = basicToken; // Basic token used in client credentials handshake. base64encode(client_id:client_secret)

let stripeKey;
// for betas, make sure you use the productive stripe so real purchases can be tested
if (env !== 'prod') stripeKey = 'pk_test_Qb1p9v4TgyCCCNphzVBRQCR700ZIepbgNW';
else stripeKey = 'pk_live_gyaTw3TMF86lxrwC7KetBu3H00xPIsOTJH';

export const STRIPE_KEY = stripeKey;

export const MELISSA_ID = 'AWnzuhXjgtwo-iUyCybpnS**';

export const LINKEDIN_API_KEY = {
  id: '860k1ckefmtx4i',
  secret: 'qYNuUU4cCjmcRhH5',
};

export const GOOGLE_GEOCODING_API_KEY =
  'AIzaSyCGhV6RPStpUzTCmNF4ku2hU-Yg4tU8fyE';

export const GOOGLE_PLACES_API_KEY = 'AIzaSyBmalr4wXTZXhQQ8qDG0ws3GtmYM_CV9BA';

export const GOOGLE_TIMEZONE_API_KEY =
  'AIzaSyAoXyNSQOelhvI4oyiGJefTsuCeC7aBERQ';

export const FCM_SERVER_KEY =
  'AAAAOd7Dabc:APA91bHZRGP5nQEIeH7XIWfLsI6yE7neoHYTpbVgVZxI1r07qrz1BsqFYWZtf846qjP4_MZtTnKl1Kn6ZUZJix5YtIJPtuTWpMVZhl9SHbh8-Lv0gLC1bwkiK69bUCNVYYiTFKfzXUQx';

export const GCM_SENDER_ID = env !== 'prod' ? '738852958689' : '248550484407' ; //sender ID under cloud messaging in firebase

/*
Needed for google signin on android.
First, add the release SHA-1 hash to the android app in Firebase Console ->
    Project Settings, then re-download the googleplay-services.json and put it in android/app

Second, navigate to Firebase Console -> Develop -> Authentication -> 
    Sign-in Method -> Google -> Web SDK Configuration (?) -> Google API Console.
    The (?) is the part you want to click in Web SDK Configuration.

    If it isn't already, ensure that the oauth consent screen is filled in correctly.

Third, in the same web-page, grab the `Web client (auto created by Google Service)` client id
    and paste it below in ANDROID_WEBCLIENT_ID
*/
const ANDROID_WEBCLIENT_ID =
  '248550484407-t4k3bquoioko2i16vs431sjvecc0ietn.apps.googleusercontent.com';

/*

*/
const IOS_WEBCLIENT_ID =
  '526930970232-ls9b6cus1onbvuh0187ovrl1hv5978i2.apps.googleusercontent.com';

/*

*/
const IOS_CLIENT_ID =
  '526930970232-7r2ctnfjt31qej2t0qukbfb0k19umk44.apps.googleusercontent.com';

export const GOOGLE_CLIENT_IDS = {
  android_webclient_id: ANDROID_WEBCLIENT_ID,
  ios_webclient_id: IOS_WEBCLIENT_ID,
  ios_client_id: IOS_CLIENT_ID,
};

export const GOOGLE_REACT_API_KEY = 'AIzaSyBJIBLRIYN_Pa4IdFZ2aVPeAm9-dm29n0M';
