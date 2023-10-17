import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
  StatusBar,
  Alert,
  Linking,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {isNullOrEmpty} from '../../shared/utils/Helpers';
import RWBTextField from '../design_components/RWBTextField';
import RWBButton from '../design_components/RWBButton';
import RegisterHeader from './RegisterHeader';
import {rwbApi} from '../../shared/apis/api';
import {userProfile} from '../../shared/models/UserProfile';

import globalStyles, {RWBColors} from '../styles';
import NavigationService from '../models/NavigationService';
import {
  POLICY_TERMS_URL,
  COMMUNITY_GUIDELINES_URL,
} from '../../shared/constants/TermURLs';
import {logCreateAccount} from '../../shared/models/Analytics';

export default class RegisterCreateAccountView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: () => (
        <RegisterHeader headerText="Signup" stepText="STEP 1 OF 6" />
      ),
      headerLeft: () => null,
      headerStyle: {
        backgroundColor: RWBColors.magenta,
      },
      headerTintColor: RWBColors.white,
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      confirm_email: '',
      password: '',
      confirm_password: '',
      isLoading: false,
      first_name_error_text: '',
      last_name_error_text: '',
      email_error_text: '',
      confirm_email_error_text: '',
      password_error_text: '',
      confirm_password_error_text: '',
      server_errror_text: '',
      field_is_required_string: 'THIS FIELD IS REQUIRED',
      server_error_message_string:
        'THERE WAS A PROBLEM WITH THE SERVER, PLEASE TRY AGAIN.',
      keyboardIsShowing: false,
    };

    this.createUser = this.createUser.bind(this);
    this.clearErrorWarnings = this.clearErrorWarnings.bind(this);
    this.createAccountPressed = this.createAccountPressed.bind(this);
  }

  componentDidMount() {
    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this._keyboardWillShow,
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this._keyboardWillHide,
    );
  }

  componentWillUnmount() {
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();
  }

  _keyboardWillShow = (e) => {
    this.keyboardHeight = e.endCoordinates.height;
    this.setState({keyboardIsShowing: true});
    this.forceUpdate();
  };

  _keyboardWillHide = (e) => {
    this.keyboardHeight = 0;
    this.setState({keyboardIsShowing: false});
    this.forceUpdate();
  };

  clearErrorWarnings() {
    this.setState({
      first_name_error_text: '',
      last_name_error_text: '',
      email_error_text: '',
      confirm_email_error_text: '',
      password_error_text: '',
      confirm_password_error_text: '',
      server_error_text: '',
    });
  }

  createUser(firstName, lastName, email, password) {
    this.setState({isLoading: true});
    Keyboard.dismiss();
    return rwbApi
      .createNewUser(
        JSON.stringify({
          grant_type: 'client_credentials',
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
        }),
      )
      .then((response) => {
        if (response.status === 201) {
          response.json().then((jsonBody) => {
            this.setState({server_error_text: ''});
            userProfile.setUserId(jsonBody.id);
            rwbApi
              .loginUser(email, password)
              .then((response) => {
                logCreateAccount();
                rwbApi.putUser(
                  JSON.stringify({registration_started_via_app: true}),
                );
                NavigationService.navigate('VerifyEmail');
              })
              .catch((error) => {
                Alert.alert(
                  'Server error. Please try again. If the problem persists, please contact support@teamrwb.org',
                );
                this.setState({
                  isLoading: false,
                });
              });
          });
        } else {
          response.json().then((jsonBody) => {
            if (jsonBody.code === 'existing_user_login') {
              this.setState({
                isLoading: false,
                email_error_text: 'AN ACCOUNT WITH THIS EMAIL ALREADY EXISTS',
              });
            } else {
              this.setState({
                isLoading: false,
                server_error_text:
                  'THERE WAS A PROBLEM WITH THE SERVER. PLEASE TRY AGAIN',
              });
            }
          });
        }
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
          server_error_text:
            'THERE WAS A PROBLEM WITH THE SERVER, PLEASE TRY AGAIN.',
        });
      });
  }

  createAccountPressed() {
    this.clearErrorWarnings();

    //Local error checking

    let field_is_required_string = 'THIS FIELD IS REQUIRED';
    let hasError = false;

    if (isNullOrEmpty(this.state.first_name)) {
      this.setState({first_name_error_text: field_is_required_string});
      hasError = true;
    }
    if (isNullOrEmpty(this.state.last_name)) {
      this.setState({last_name_error_text: field_is_required_string});
      hasError = true;
    }
    if (isNullOrEmpty(this.state.email)) {
      this.setState({email_error_text: field_is_required_string});
      hasError = true;
    }
    if (this.state.email.endsWith('teamrwb.org')) {
      this.setState({email_error_text: 'PLEASE USE A NON-TEAMRWB EMAIL'});
      hasError = true;
    }
    if (isNullOrEmpty(this.state.confirm_email)) {
      this.setState({confirm_email_error_text: field_is_required_string});
      hasError = true;
    }
    if (this.state.email !== this.state.confirm_email) {
      this.setState({confirm_email_error_text: 'EMAIL DOES NOT MATCH'});
      hasError = true;
    }
    if (isNullOrEmpty(this.state.password)) {
      this.setState({password_error_text: field_is_required_string});
      hasError = true;
    }
    if (!isNullOrEmpty(this.state.password) && this.state.password.length < 8) {
      this.setState({
        password_error_text: 'PASSWORD MUST BE AT LEAST 8 CHARACTERS LONG',
      });
      hasError = true;
    }
    if (isNullOrEmpty(this.state.confirm_password)) {
      this.setState({confirm_password_error_text: field_is_required_string});
      hasError = true;
    }
    if (this.state.password !== this.state.confirm_password) {
      this.setState({confirm_password_error_text: 'PASSWORD DOES NOT MATCH'});
      hasError = true;
    }

    if (hasError) return;

    this.createUser(
      this.state.first_name,
      this.state.last_name,
      this.state.email,
      this.state.password,
    );
  }

  render() {
    return (
      <SafeAreaView style={globalStyles.registrationScreenContainer}>
        <StatusBar
          barStyle="light-content"
          animated={true}
          translucent={false}
          backgroundColor={RWBColors.magenta}
        />
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.scrollViewContainer}
          contentContainerStyle={[
            styles.scrollViewContainerContent,
            {flexGrow: this.state.keyboardIsShowing ? 0 : 1},
          ]}>
          {this.state.isLoading && (
            <View style={globalStyles.spinnerOverLay}>
              <ActivityIndicator size="large" />
            </View>
          )}

          <View style={{width: '100%', flex: 1}}>
            <RWBTextField
              label="FIRST NAME"
              error={this.state.first_name_error_text}
              onChangeText={(text) => {
                this.state.first_name = text;
              }}
              onSubmitEditing={() => this.lastNameInput.focus()}
              returnKeyType="next"
              blurOnSubmit={false}
            />
            <RWBTextField
              label="LAST NAME"
              error={this.state.last_name_error_text}
              onChangeText={(text) => {
                this.state.last_name = text;
              }}
              refProp={(input) => {
                this.lastNameInput = input;
              }}
              onSubmitEditing={() => this.emailInput.focus()}
              returnKeyType="next"
              blurOnSubmit={false}
            />
            <RWBTextField
              label="EMAIL"
              error={this.state.email_error_text}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(text) => {
                this.state.email = text;
              }}
              refProp={(input) => {
                this.emailInput = input;
              }}
              onSubmitEditing={() => this.emailConfirmInput.focus()}
              returnKeyType="next"
              blurOnSubmit={false}
            />
            <Text style={[globalStyles.bodyCopy, {marginTop: 25}]}>
              Please use a civilian or non-governmental email address. (Note:
              Eagle Leaders, please do not use your @teamrwb.org email address)
            </Text>
            <RWBTextField
              label="CONFIRM EMAIL"
              error={this.state.confirm_email_error_text}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(text) => {
                this.state.confirm_email = text;
              }}
              refProp={(input) => {
                this.emailConfirmInput = input;
              }}
              onSubmitEditing={() => this.passwordInput.focus()}
              returnKeyType="next"
              blurOnSubmit={false}
            />
            <RWBTextField
              label="PASSWORD"
              onChangeText={(text) => {
                this.state.password = text;
              }}
              error={this.state.password_error_text}
              secureTextEntry={true}
              autoCapitalize="none"
              refProp={(input) => {
                this.passwordInput = input;
              }}
              onSubmitEditing={() => this.passwordConfirmInput.focus()}
              returnKeyType="next"
              blurOnSubmit={false}
            />
            <RWBTextField
              label="CONFIRM PASSWORD"
              secureTextEntry={true}
              error={this.state.confirm_password_error_text}
              onChangeText={(text) => {
                this.state.confirm_password = text;
              }}
              autoCapitalize="none"
              refProp={(input) => {
                this.passwordConfirmInput = input;
              }}
              returnKeyType="done"
              blurOnSubmit={true}
            />
            <View style={{marginTop: 15}}>
              <Text
                style={[
                  globalStyles.bodyCopy,
                  {alignSelf: 'center', textAlign: 'center'},
                ]}>
                By creating an account, you agree to{'\n'} Team Red, White &
                Blue’s{' '}
                <Text
                  style={globalStyles.link}
                  onPress={() => Linking.openURL(POLICY_TERMS_URL)}>
                  Privacy Policy & Terms
                </Text>
                &nbsp;and&nbsp;
                <Text
                  style={globalStyles.link}
                  onPress={() => Linking.openURL(COMMUNITY_GUIDELINES_URL)}>
                  Community Guidelines
                </Text>
              </Text>

              {this.state.server_error_text != '' && (
                <Text
                  style={[
                    globalStyles.errorMessage,
                    {alignSelf: 'center', textAlign: 'center'},
                  ]}>
                  {this.state.server_error_text}
                </Text>
              )}
            </View>
          </View>
          <View style={globalStyles.centerButtonWrapper}>
            <RWBButton
              buttonStyle="primary"
              text="CREATE ACCOUNT"
              onPress={this.createAccountPressed}
            />
            <RWBButton
              buttonStyle="secondary"
              text="Have an account? Login here"
              onPress={() => {
                this.props.navigation.navigate('Login');
              }}
            />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    width: '100%',
    paddingHorizontal: '5%',
  },
  scrollViewContainerContent: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});
