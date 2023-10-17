import React from 'react';
import {View, StatusBar, Linking} from 'react-native';
import {authentication} from '../../shared/models/Authentication';
import {rwbApi} from '../../shared/apis/api';
import RWBLogo from './../../svgs/RWBLogo';
import globalStyles, {RWBColors} from '../styles';
import {userProfile} from '../../shared/models/UserProfile';

export default class SplashScreen extends React.Component {
  componentDidMount() {
    this.loadAuth();
  }

  loadAuth() {
    const path = this.props.navigation.getParam('path', null);
    authentication
      .getAccessToken()
      .then((accessToken) => {
        if (accessToken) return accessToken;
        return Promise.reject('Missing Credentials');
      })
      .then(rwbApi.getAuthenticatedUser)
      .then((json) => {
        const isFocused = this.props.navigation.isFocused();
        if (isFocused) {
          const {profile_completed, email_verified} = json;
          if (!email_verified) {
            this.props.navigation.navigate('VerifyEmail');
          } else if (email_verified && !profile_completed) {
            this.props.navigation.navigate('PersonalInfo');
          }
          // if we have a deep link, we do not want to redirect the user
          else if (path) {
            Linking.openURL(`teamrwb://${path}`);
          } else {
            this.props.navigation.navigate('App');
            rwbApi.getUnseenNotifications().then((result) => {
              global.unseenNotifications = result.data > 0;
            });
          }
        }
      })
      .catch((error) => {
        console.warn('auth error', error);
        this.props.navigation.navigate('Login', {path});
      });
  }

  render() {
    return (
      <View style={globalStyles.spinnerOverLay}>
        <StatusBar
          barStyle="dark-content"
          animated={true}
          translucent={false}
          backgroundColor="white"
        />
        <RWBLogo style={{width: '100%', height: 146}} />
      </View>
    );
  }
}
