import React, {Component} from 'react';
import {View, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import {LoginManager, AccessToken} from 'react-native-fbsdk';

import {OAcreateUser} from '../../shared/apis/oneall-api';
import NavigationService from '../models/NavigationService';
import {authentication} from '../../shared/models/Authentication';

// SVG
import FacebookLoginIcon from '../../svgs/FacebookLoginIcon';

export default class FBLoginButton extends Component {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
  }

  login() {
    LoginManager.logInWithPermissions(['email', 'public_profile'])
      .then((result) => {
        if (result.isCancelled) {
          return;
        } else if (
          result.grantedPermissions.includes('email') &&
          result.grantedPermissions.includes('public_profile')
        ) {
          AccessToken.getCurrentAccessToken().then((token) => {
            this.props.setLoading(true);
            OAcreateUser('facebook', '', token.accessToken, '') // no access token secret given for fb
              .then((response) => {
                const {email_verified, profile_completed} = response;
                if (email_verified === false) {
                  NavigationService.navigate('VerifyEmail');
                } else if (
                  email_verified === true &&
                  profile_completed === false
                ) {
                  NavigationService.navigate('PersonalInfo');
                } else if (
                  email_verified === true &&
                  profile_completed === true
                ) {
                  NavigationService.navigate('App');
                } else throw new Error();
              })
              .catch((error) => {
                authentication.deleteAuthentication();
                this.props.setLoading(false);
              });
          });
        } else if (
          result.declinedPermissions.includes('email') ||
          result.declinedPermissions.includes('public_profile')
        ) {
          Alert.alert(
            'Team RWB',
            'Team RWB requires permission to access both your email and your public profile to continue.',
          );
        } else throw new Error();
      })
      .catch((error) => {
        this.props.setLoading(false);
      });
  }

  render() {
    return (
      <View>
        <TouchableOpacity onPress={this.login}>
          <FacebookLoginIcon style={styles.loginIcon} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loginIcon: {
    width: 30,
    height: 30,
  },
});
