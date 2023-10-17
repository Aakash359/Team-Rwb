import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {NavigationEvents} from 'react-navigation';
import {rwbApi} from '../../shared/apis/api';
import {authentication} from '../../shared/models/Authentication';
import {userProfile} from '../../shared/models/UserProfile';
import {TEAMRWB} from '../../shared/constants/URLs';
import {logVerifyEmail} from '../../shared/models/Analytics';
import RegisterHeader from './RegisterHeader';

import {urlToParamsObj} from '../../shared/utils/Helpers';

// SVGs
import VerifyEmailIcon from '../../svgs/VerifyEmailIcon';
import RWBButton from '../design_components/RWBButton';

import globalStyles, {RWBColors} from '../styles';

export default class RegisterVerifyEmailView extends React.Component {
  // This is in a SwitchNavigator, which does not support static headers

  constructor() {
    super();
    this.state = {
      isLoading: false,
    };
    this.logout = this.logout.bind(this);
    this.checkVerification = this.checkVerification.bind(this);
    this.checkURL = this.checkURL.bind(this);
    this.handleDidFocus = this.handleDidFocus.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this._handleURLChange = this._handleURLChange.bind(this);
  }

  componentDidMount() {
    Linking.addEventListener('url', this._handleURLChange);
    Linking.getInitialURL().then((url) => {
      if (url) {
        this.checkURL(url);
      }
    });
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this._handleURLChange);
  }

  _handleURLChange(url) {
    if (url) {
      this.checkURL(url);
    }
  }

  logout() {
    const {navigation} = this.props;
    authentication
      .deleteAuthentication()
      .then(() => navigation.navigate('AuthRoot'));
  }

  checkURL(urlObj) {
    if (!urlObj) {
      return;
    }
    const {url} = urlObj;
    const urlParams = urlToParamsObj(url);
    if (url.includes(`verify?`) && urlParams.hasOwnProperty('id')) {
      userProfile.setUserId(urlParams.id);
      this.setState({
        isLoading: true,
      });
      fetch(url)
        .then((response) => {
          if (response.ok || response.status === 302) {
            this.checkVerification();
          }
        })
        .catch((error) => {
          this.setState({
            isLoading: false,
          });
        });
    }
  }

  handleDidFocus() {
    this.checkURL();
  }

  checkVerification() {
    const {navigation} = this.props;
    this.setState({
      isLoading: true,
    });
    rwbApi
      .getUser()
      .then((response) => {
        const {email_verified, profile_completed} = response;
        if (email_verified === true && profile_completed === false) {
          let analyticsObj = {};
          if (
            this.props.navigation.state.params &&
            this.props.navigation.state.params.from
          )
            analyticsObj.previous_view = this.props.navigation.state.params.from;
          logVerifyEmail(analyticsObj);
          navigation.navigate('PersonalInfo', {from: 'Verify Your Email'});
        } else if (email_verified === true && profile_completed === true) {
          navigation.navigate('App');
        } else {
          Alert.alert(
            'Team RWB',
            "Please check your email inbox for a link from Team RWB. If you're still having trouble, contact support.",
          );
          this.setState({
            isLoading: false,
          });
        }
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
        });
        Alert.alert(
          'Team RWB',
          'There was an error contacting the server. Please try again.',
        );
      });
  }

  render() {
    const {isLoading} = this.state;
    return (
      <View style={{flex: 1}}>
        <SafeAreaView style={{flex: 0, backgroundColor: RWBColors.magenta}} />
        <SafeAreaView style={globalStyles.registrationScreenContainer}>
          <StatusBar
            backgroundColor={RWBColors.magenta}
            barStyle="light-content"
            animated={true}
            translucent={false}
          />
          <View style={styles.headerBar}>
            <RegisterHeader
              headerText="Verify Your Email"
              stepText="STEP 2 OF 6"
            />
          </View>
          <NavigationEvents onDidFocus={this.handleDidFocus} />
          {isLoading ? (
            <View style={globalStyles.spinnerOverLay}>
              <ActivityIndicator size="large" />
            </View>
          ) : null}
          <View style={styles.contentContainer}>
            <View style={{flex: 1, paddingVertical: '35%'}}>
              <VerifyEmailIcon style={styles.iconView} />
              <Text style={[globalStyles.bodyCopy, {textAlign: 'center'}]}>
                To keep your information safe and secure,{'\n'} an email has
                been sent to you.
              </Text>
              <Text style={[globalStyles.bodyCopy, {textAlign: 'center'}]}>
                Didn't receive the email? {'\n'}
                Check your spam folder or{' '}
                <Text
                  style={globalStyles.link}
                  onPress={() => {
                    Linking.openURL(TEAMRWB.contact);
                  }}>
                  contact us
                </Text>{' '}
                for help.
              </Text>
            </View>
            <View
              style={[
                globalStyles.centerButtonWrapper,
                {bottom: 0, position: 'absolute'},
              ]}>
              <RWBButton
                buttonStyle="primary"
                text="I'VE VERIFIED MY EMAIL"
                onPress={this.checkVerification}
              />
              <RWBButton
                buttonStyle="secondary"
                text="Not you? Back to login"
                onPress={this.logout}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    width: '90%',
    flex: 1,
  },
  iconView: {
    width: '100%',
    left: 5,
    padding: 20,
    textAlign: 'center',
    marginBottom: 25,
  },
  headerBar: {
    justifyContent: 'center',
    width: '100%',
    height: 65,
    marginHorizontal: 0,
    marginTop: 0,
  },
});
