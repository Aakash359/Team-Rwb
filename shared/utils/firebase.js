import * as firebase from 'firebase';
import {isDev} from './IsDev';

const prodApp = {
  apiKey: "AIzaSyC-BkjqVC4lMYt8s-jYRb-a-4hcGrZWsMM",
  authDomain: "team-rwb-app.firebaseapp.com",
  databaseURL: "https://team-rwb-app.firebaseio.com",
  projectId: "team-rwb-app",
  storageBucket: "team-rwb-app.appspot.com",
  messagingSenderId: "248550484407",
  appId: "1:248550484407:web:dc4804190e93ec2179e032",
  measurementId: "G-B8P8VTRGM9"
}

const devApp = {
  apiKey: 'AIzaSyDJ4fy7vuaKjvrKlh6a10eZLoLzw3_PgD8',
  authDomain: 'team-rwb-app-dev.firebaseapp.com',
  databaseURL: 'https://team-rwb-app-dev.firebaseio.com',
  projectId: 'team-rwb-app-dev',
  storageBucket: 'team-rwb-app-dev.appspot.com',
  messagingSenderId: '738852958689',
  appId: '1:738852958689:web:2c4055f2bc8986a2a022a0',
  measurementId: 'G-54X9S7V6RH',
}

firebase.initializeApp(isDev() ? devApp : prodApp);

const Analytics = firebase.analytics();
Analytics.setAnalyticsCollectionEnabled(true);

export default firebase;
