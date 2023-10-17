import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {isNullOrEmpty} from '../../shared/utils/Helpers';
import RWBButton from '../design_components/RWBButton';
import RWBTextField from '../design_components/RWBTextField';
import {SafeAreaView} from 'react-navigation';
import {rwbApi} from '../../shared/apis/api';
import NavigationService from '../models/NavigationService';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

// SVGs
import ChevronBack from '../../svgs/ChevronBack';

import globalStyles, {RWBColors} from '../styles';
import {logUpdatePassword} from '../../shared/models/Analytics';

export default class ProfilePasswordUpdate extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: 'Update Password',
      headerStyle: {
        backgroundColor: RWBColors.magenta,
      },
      headerTintColor: RWBColors.white,
      headerLeft: () => (
        <TouchableOpacity
          style={globalStyles.headerSave}
          onPress={() => {
            navigation.goBack();
          }}
          accessibilityRole={'button'}
          accessible={true}
          accessibilityLabel={'Go Back'}>
          <ChevronBack style={globalStyles.chevronBackImage} />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <Text style={[globalStyles.title, {top: 3}]}>Update Password</Text>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      old_password: '',
      old_password_error: '',

      password: '',
      password_confirm: '',

      password_error: '',
      password_confirm_error: '',

      isLoading: false,
      keyboardIsShowing: false,
    };
    this.keyboardHeight = 0;
    this.clearErrors = this.clearErrors.bind(this);
    this.savePressed = this.savePressed.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
  }

  componentDidMount() {
    const {savePressed} = this;
    this.props.navigation.setParams({
      savePressed,
    });
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

  clearErrors() {
    this.setState({
      password_error: '',
      password_confirm_error: '',
    });
  }

  savePressed() {
    this.clearErrors();

    const {old_password, password, password_confirm} = this.state;

    let hasError = false;

    // if (isNullOrEmpty(old_password)) {
    //   this.setState({ old_password_error: 'THIS FIELD IS REQUIRED' });
    //   hasError = true;
    // }
    if (isNullOrEmpty(password)) {
      this.setState({password_error: 'THIS FIELD IS REQUIRED'});
      hasError = true;
    }
    if (!isNullOrEmpty(password) && password.length < 8) {
      this.setState({
        password_error: 'PASSWORD MUST BE AT LEAST 8 CHARACTERS LONG',
      });
      hasError = true;
    }
    if (isNullOrEmpty(password_confirm)) {
      this.setState({password_confirm_error: 'THIS FIELD IS REQUIRED'});
      hasError = true;
    }
    if (!isNullOrEmpty(password_confirm) && password !== password_confirm) {
      this.setState({password_confirm_error: 'PASSWORD DOES NOT MATCH'});
      hasError = true;
    }

    if (hasError) return;
    else {
      this.updatePassword(old_password, password);
    }
  }

  updatePassword(old_password, new_password) {
    this.setState({
      isLoading: true,
    });
    const payload = JSON.stringify({
      // old_password,
      // new_password
      password: new_password,
    });
    rwbApi.putUser(payload).then(() => {
      logUpdatePassword();
      NavigationService.back();
    });
    return;
    // TODO verify server implementation and API
    rwbApi
      .updatePassword(payload)
      .then((response) => {
        return response.json();
      })
      .then((jsonBody) => {
        if (jsonBody.error === undefined) {
          Alert.alert('Team RWB', 'Password Updated successfully.');
          NavigationService.back();
        } else {
          this.setState({
            old_password_error: jsonBody.error,
          });
        }
      })
      .catch((error) => {
        Alert.alert(
          'Team RWB',
          'There was an error updating your password. Please try again later.',
        );
      })
      .finally(() => {
        this.setState({
          isLoading: false,
        });
      });
  }

  render() {
    const {
      old_password,
      old_password_error,

      password,
      password_confirm,

      password_error,
      password_confirm_error,

      isLoading,
    } = this.state;
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: RWBColors.white}}>
        <View style={{width: '100%', height: 'auto', flex: 1}}>
          {isLoading && (
            <View style={globalStyles.spinnerOverLay}>
              <ActivityIndicator size="large" />
            </View>
          )}
          <KeyboardAwareScrollView
            style={styles.scrollViewContainer}
            contentContainerStyle={styles.scrollViewContainerContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.formWrapper} ref="uploadPhotoView">
              {/* <RWBTextField
                label='OLD PASSWORD'
                value={old_password}
                error={old_password_error}
                secureTextEntry={true}
                autoCapitalize='none'
                returnKeyType='next'
                blurOnSubmit={false}
                onChangeText={text => {
                  this.setState({
                    old_password: text,
                  });
                }}
                onSubmitEditing={() => this.password.focus()}
              /> */}
              <RWBTextField
                refProp={(input) => {
                  this.password = input;
                }}
                label="NEW PASSWORD"
                value={password}
                error={password_error}
                secureTextEntry={true}
                autoCapitalize="none"
                returnKeyType="next"
                blurOnSubmit={false}
                onChangeText={(text) => {
                  this.setState({
                    password: text,
                  });
                }}
                onSubmitEditing={() => this.passwordConfirm.focus()}
              />
              <RWBTextField
                refProp={(input) => {
                  this.passwordConfirm = input;
                }}
                label="CONFIRM NEW PASSWORD"
                value={password_confirm}
                error={password_confirm_error}
                secureTextEntry={true}
                autoCapitalize="none"
                returnKeyType="done"
                blurOnSubmit={true}
                onChangeText={(text) => {
                  this.setState({
                    password_confirm: text,
                  });
                }}
                onSubmitEditing={() => this.savePressed()}
              />
            </View>
          </KeyboardAwareScrollView>
          <View
            style={[
              globalStyles.centerButtonWrapper,
              {
                width: '90%',
                alignSelf: 'center',
                bottom: this.keyboardHeight,
                position: 'absolute',
              },
            ]}>
            <RWBButton
              buttonStyle="primary"
              text="SAVE"
              onPress={this.savePressed}
            />
          </View>
        </View>
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
  formWrapper: {
    flex: 1,
    width: '100%',
    height: 'auto',
    marginBottom: 25,
  },
});
