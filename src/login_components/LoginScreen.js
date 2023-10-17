// login screen
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Linking,
  ActivityIndicator,
  Keyboard,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {isNullOrEmpty, validateEmail} from '../../shared/utils/Helpers';
import RWBTextField from '../design_components/RWBTextField';
import RWBButton from '../design_components/RWBButton';
import FBLoginButton from './LoginFacebook';
import LoginGoogleButton from './LoginGoogle';
import LoginLinkedin from './LoginLinkedin';
import AppleLoginButton from './AppleLogin';
import {TEAMRWB} from '../../shared/constants/URLs';

import {rwbApi} from '../../shared/apis/api';
import {logForgotPassword, logLogin} from '../../shared/models/Analytics';

// SVGs
import RWBLogo from '../../svgs/RWBLogo';

import globalStyles, {RWBColors} from '../styles';
import {INVALID_LOGIN_ERROR} from '../../shared/constants/ErrorMessages';

export default class LoginScreen extends React.Component {
  static navigationOptions = {
    headerShown: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      value: 0,
      email: '',
      password: '',
      email_error_text: null,
      password_error_text: null,
      isLoading: false,
    };

    this.clearErrors = this.clearErrors.bind(this);
    this.signInPressed = this.signInPressed.bind(this);
    this.setLoading = this.setLoading.bind(this);
    this.onRegisterPress = this.onRegisterPress.bind(this);
  }

  clearErrors() {
    this.setState({
      email_error_text: '',
      password_error_text: '',
    });
  }

  updateMobileInfo = (user) => {
    const {app_installed, device_os_type} = user;
    if (
      (Platform.OS === 'ios' && device_os_type !== 'iPhone') ||
      (Platform.OS === 'android' && device_os_type !== 'Android') ||
      !app_installed
    ) {
      const payload = {
        app_installed: true,
        device_os_type: Platform.OS === 'ios' ? 'iPhone' : 'Android',
      };
      rwbApi.putUser(JSON.stringify(payload));
    }
  };

  signInPressed() {
    logLogin();

    let {email, password} = this.state;

    this.clearErrors();

    let hasError = false;

    if (isNullOrEmpty(email) || !validateEmail(email)) {
      this.setState({email_error_text: 'PLEASE ENTER A VALID EMAIL'});
      hasError = true;
    }
    if (!password || password === null || password === '') {
      this.setState({password_error_text: 'ENTER YOUR PASSWORD'});
      hasError = true;
    }

    if (hasError) {
      return;
    }

    this.setState({
      email: email.trim(),
      isLoading: true,
    });
    Keyboard.dismiss();
    rwbApi
      .loginUser(email, password)
      .then((json) => {
        const {email_verified, profile_completed} = json;
        let path = this.props.navigation.getParam('path', null);
        this.updateMobileInfo(json);
        if (email_verified === false) {
          this.props.navigation.navigate('VerifyEmail');
        } else if (email_verified === true && profile_completed === false) {
          this.props.navigation.navigate('PersonalInfo');
        } else if (path) {
          const route = path.split('/')[0];
          const id = path.split('/')[1];
          if (route === 'events')
            this.props.navigation.navigate('EventView', {eventTitle: id});
          else if (route === 'groups')
            this.props.navigation.navigate('GroupView', {group_id: id});
        } else this.props.navigation.navigate('App');
      })
      .catch((error) => {
        this.setState({
          password_error_text: INVALID_LOGIN_ERROR.toUpperCase(),
          isLoading: false,
        });
      });
  }

  setLoading(isLoading) {
    this.setState({
      isLoading,
    });
  }

  onRegisterPress() {
    this.props.navigation.navigate('Register', {from: 'Login'});
  }

  forgotPasswordOnPress() {
    logForgotPassword();
    Linking.openURL(TEAMRWB.lostpassword);
  }

  render() {
    let screenHeight = Math.round(Dimensions.get('window').height);
    var loginPadding;
    if (screenHeight >= 800) {
      loginPadding = '25%';
    } else if (screenHeight >= 690) {
      loginPadding = '15%';
    } else {
      loginPadding = '7.5%';
    }
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          animated={true}
          translucent={false}
          backgroundColor={RWBColors.white}
        />
        {this.state.isLoading && (
          <View style={globalStyles.spinnerOverLay}>
            <ActivityIndicator size="large" />
          </View>
        )}

        {
          // this keyboardavoidingView is a bit finicky. If it continues to give us trouble, we should just make our own.
          // Note that I set windowSoftInputMode="adjustPan" in AndroidManifest.xml to make android
          // behaive more like iOS when soft keyboard is displayed. Otherwise it changes the view size and this doesn't work the same.
        }
        {/* <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={0} style={{ width:'90%', height: 'auto' }}> */}
        <KeyboardAwareScrollView
          style={{
            width: '100%',
            paddingHorizontal: '5%',
            paddingTop: loginPadding,
          }}>
          <RWBLogo style={styles.logoView} />

          <RWBTextField
            label="EMAIL"
            autoCapitalize="none"
            error={this.state.email_error_text}
            value={this.state.email}
            onChangeText={(text) => {
              this.setState({email: text});
            }}
            onSubmitEditing={() => {
              this.passwordField.focus();
            }}
            returnKeyType="next"
            keyboardType={'email-address'}
            blurOnSubmit={false}
          />

          <RWBTextField
            label="PASSWORD"
            secureTextEntry={true}
            refProp={(input) => {
              this.passwordField = input;
            }}
            error={this.state.password_error_text}
            onChangeText={(text) => {
              this.setState({
                password: text,
              });
            }}
            autoCapitalize="none"
            returnKeyType="done"
          />

          <Text
            style={[globalStyles.bodyCopy, {textAlign: 'center', margin: 15}]}>
            Forgot your password?{' '}
            <Text
              style={globalStyles.link}
              onPress={this.forgotPasswordOnPress}>
              Tap here
            </Text>
          </Text>
          <View style={[globalStyles.centerButtonWrapper, {height: 325}]}>
            <RWBButton
              buttonStyle="primary"
              text="SIGN IN"
              onPress={this.signInPressed}
            />
            {Platform.OS === 'ios' ? null : (
              <Text
                style={[
                  globalStyles.bodyCopyForm,
                  {textAlign: 'center', margin: 15},
                ]}>
                Or Sign in via a social login
              </Text>
            )}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                marginBottom: 25,
              }}>
              {/* Hide social auth for iOS only. Code looks a bit messy as ideally we just remove this ternary after the build */}
              {Platform.OS === 'ios' ? null : (
                <>
                  <FBLoginButton setLoading={this.setLoading} />
                  <LoginGoogleButton setLoading={this.setLoading} />
                  <LoginLinkedin setLoading={this.setLoading} />
                  {Platform.OS === 'ios' ? (
                    <AppleLoginButton setLoading={this.setLoading} />
                  ) : null}
                </>
              )}
            </View>
            <RWBButton
              buttonStyle="secondary"
              text="No Account? Register Now"
              onPress={this.onRegisterPress}
            />
          </View>
        </KeyboardAwareScrollView>
        {/* </KeyboardAvoidingView> */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            ©2020 Team Red, White {'&'} Blue.{'\n'}
            All Rights Reserved.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: RWBColors.white,
  },
  logoView: {
    width: '100%',
    height: 130,
    textAlign: 'center',
  },
  forgotAccount: {
    textAlign: 'center',
    margin: 25,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '10%',
    backgroundColor: RWBColors.grey5,
    alignSelf: 'flex-end',
    justifyContent: 'center',
  },
  footerText: {
    color: RWBColors.grey80,
    fontSize: 10,
    textAlign: 'center',
  },
  spinnerOverLay: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
