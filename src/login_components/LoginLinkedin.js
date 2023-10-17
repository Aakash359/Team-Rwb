import React, {Component} from 'react';
import {View, StyleSheet, Alert, TouchableOpacity} from 'react-native';

import LinkedInModal from './LinkedIn';
import {OAcreateUser} from '../../shared/apis/oneall-api';
import {authentication} from '../../shared/models/Authentication';
import NavigationService from '../models/NavigationService';

import {ONEALL_CALLBACK} from '../../shared/constants/URLs';
import {LINKEDIN_API_KEY} from '../../shared/constants/APIKeys-obfuscated';

// SVG
import LinkedInLoginIcon from '../../svgs/LinkedInLoginIcon';

export default class LoginLinkedin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
    this.linkedRef = React.createRef();
    this.onSuccess = this.onSuccess.bind(this);
    this.onError = this.onError.bind(this);
    this.renderButton = this.renderButton.bind(this);
  }

  onSuccess(token) {
    this.props.setLoading(true);
    OAcreateUser('linkedin', '', token.access_token, '')
      .then((response) => {
        const {email_verified, profile_completed} = response;
        if (email_verified === false) {
          NavigationService.navigate('VerifyEmail');
        } else if (profile_completed === false) {
          NavigationService.navigate('PersonalInfo');
        } else if (profile_completed === true) {
          NavigationService.navigate('App');
        } else {
          throw new Error('Supplied user has invalid properties.');
        }
      })
      .catch((error) => {
        this.props.setLoading(false);
      });
  }

  onError(error) {
    if (error.type === 'user_cancelled_login') return;
    authentication.deleteAuthentication();
    Alert.alert('Team RWB', error.message);
  }

  renderButton() {
    const {renderButton, linkText} = this.props;
    if (renderButton) return renderButton();
    return (
      <TouchableOpacity onPress={() => this.linkedRef.current.open()}>
        <LinkedInLoginIcon style={styles.loginIcon} />
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View style={[styles.loginIcon, this.props.style]}>
        <LinkedInModal
          ref={this.linkedRef}
          clientID={LINKEDIN_API_KEY.id}
          clientSecret={LINKEDIN_API_KEY.secret}
          redirectUri={ONEALL_CALLBACK}
          permissions={['r_liteprofile', 'r_emailaddress']}
          renderButton={this.renderButton}
          onSuccess={this.onSuccess}
          onError={this.onError}
          onClose={this.close}
        />
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
