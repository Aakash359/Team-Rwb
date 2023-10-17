import {Platform, Linking, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'react-native-store-review';
const GOOGLE_PACKAGE_NAME = 'com.teamrwb';
openStore = () => {
  //This is the main trick
  if (Platform.OS != 'ios') {
    Linking.openURL(`market://details?id=${GOOGLE_PACKAGE_NAME}`).catch((err) =>
      alert('Please check for the Google Play Store'),
    );
  } else {
    Linking.openURL(
      `https://apps.apple.com/us/app/id1460324981?mt=8`,
    ).catch((err) => alert('Please check for the App Store'));
  }
};

function startRatingCounter() {
  let t = setInterval(() => {
    clearInterval(t);
    Alert.alert(
      'Rate us',
      'Please support Team RWB by giving us a review.',
      [
        {text: 'Sure', onPress: () => this.openStore()},
        {
          text: 'No Thanks!',
          onPress: () => {},
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  }, 1000);
}

export default function requestReview() {
  AsyncStorage.getItem('reviewRequested').then((value) => {
    if (value === null) {
      if (StoreReview.isAvailable) {
        StoreReview.requestReview();
      } else {
        startRatingCounter();
      }
      AsyncStorage.setItem('reviewRequested', 'true');
    }
  });
}
