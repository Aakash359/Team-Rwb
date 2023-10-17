import firebase from '@react-native-firebase/app';
import '@react-native-firebase/analytics';
import { isDev } from '../../shared/utils/IsDev';

const Analytics = firebase.analytics();
Analytics.setAnalyticsCollectionEnabled(!isDev());

export default firebase;
