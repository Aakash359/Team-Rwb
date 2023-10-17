import React, {Component} from 'react';
import {Alert, StyleSheet, Platform, TouchableOpacity} from 'react-native';

import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin'
import {OAcreateUser} from '../../shared/apis/oneall-api';
import NavigationService from '../models/NavigationService';
import {GOOGLE_CLIENT_IDS} from '../../shared/constants/APIKeys-obfuscated';

// SVG
import GoogleLoginIcon from '../../svgs/GoogleLoginIcon';
import {authentication} from '../../shared/models/Authentication';

export default class LoginGoogleButton extends Component {
  constructor(props) {
    super(props);
    this._signIn = this._signIn.bind(this);
  }

  componentDidMount() {
    GoogleSignin.configure({
      // FIXME change this when moving to non-dev firebase instance.
      webClientId:
        Platform.OS === 'android'
          ? GOOGLE_CLIENT_IDS.android_webclient_id
          : GOOGLE_CLIENT_IDS.ios_webclient_id,
      offlineAccess: true,
      iosClientId: GOOGLE_CLIENT_IDS.ios_client_id,
    });
  }

  _signIn() {
    this.props.setLoading(true);
    GoogleSignin.signIn()
      .then((response) => {
        GoogleSignin.getTokens()
          .then(({idToken, accessToken}) => {
            return OAcreateUser('google', '', accessToken, '')
              .then((response) => {
                const {email_verified, profile_completed} = response;
                if (email_verified === false) {
                  NavigationService.navigate('VerifyEmail');
                } else if (profile_completed === false) {
                  NavigationService.navigate('PersonalInfo');
                } else if (profile_completed === true) {
                  NavigationService.navigate('App');
                } else throw new Error();
              })
              .catch((error) => {
                authentication.deleteAuthentication();
                this.props.setLoading(false);
              });
          })
          .catch((error) => {
            this.props.setLoading(false);
          });
      })
      .catch((error) => {
        this.props.setLoading(false);
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          Alert.alert(
            'Team RWB',
            'Your Google Play Services are not available or outdated. Please update Google Play Services and try again.',
          );
        } else if (error.code === 12500) {
          Alert.alert(
            'Team RWB',
            "You should only see this if you're in debug on Android. This feature doesn't work in Android debug builds. If you're seeing this anyways, please report it to Team RWB.",
          );
        }
      });
  }

  render() {
    return (
      <TouchableOpacity onPress={this._signIn}>
        <GoogleLoginIcon style={styles.loginIcon} />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  loginIcon: {
    width: 30,
    height: 30,
  },
});
