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

import {LoginManager as FBLoginManager} from 'react-native-fbsdk';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import RWBButton from '../design_components/RWBButton';
import RWBTextField from '../design_components/RWBTextField';
import {SafeAreaView} from 'react-navigation';
import {rwbApi} from '../../shared/apis/api';
import {logLogout} from '../../shared/models/Analytics';
import globalStyles, {RWBColors} from '../styles';
import {userProfile} from '../../shared/models/UserProfile';
import {INVALID_PASSWORD_ERROR} from '../../shared/constants/ErrorMessages';
import {userLocation} from '../../shared/models/UserLocation';
import {filters} from '../models/Filters';
import {authentication} from '../../shared/models/Authentication';

// SVGs
import ChevronBack from '../../svgs/ChevronBack';
import NoEventIcon from '../../svgs/NoEventIcon';

export default class ProfileDeleteAccount extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: 'Delete Account',
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
        <Text style={[globalStyles.title, {top: 3}]}>Delete Account</Text>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      password: '',
      isLoading: false,
      keyboardIsShowing: false,
      passwordError: '',
    };
    this.keyboardHeight = 0;
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

  logout() {
    logLogout();
    userLocation.deleteUserLocation();
    userProfile.deleteUserProfile();
    filters.deleteFilters();
    FBLoginManager.logOut();
    GoogleSignin.signOut().catch((error) => {});
    authentication
      .deleteAuthentication()
      .then(() => this.props.navigation.navigate('AuthRoot'));
  }

  deleteAccountPressed = () => {
    this.setState({
      isLoading: true,
    });
    const payload = JSON.stringify({
      id: userProfile.getUserProfile().id,
      password: this.state.password,
    });
    rwbApi
      .deleteAccount(payload)
      .then((result) => {
        if (result) {
          this.logout();
        } else {
          this.setState({
            passwordError: INVALID_PASSWORD_ERROR.toUpperCase(),
          });
        }
      })
      .catch((error) => {
        Alert.alert(
          'Team RWB',
          'There was an error deleting your account. Please try again later.',
        );
      })
      .finally(() => {
        this.setState({
          isLoading: false,
        });
      });
  };

  render() {
    const {password, isLoading, passwordError} = this.state;
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
            <View style={styles.formWrapper}>
              <View style={styles.textBlock}>
                <NoEventIcon
                  tintColor={RWBColors.magenta}
                  style={styles.iconContainer}
                />
                <Text style={globalStyles.bodyCopyForm}>
                  This will permanently delete your app account and all data
                  associated with it.{' '}
                  <Text style={globalStyles.h7}>
                    Please note that there is no option to restore the account
                    or its data once it is deleted.
                  </Text>
                </Text>
                <Text style={[globalStyles.bodyCopyForm, styles.textContainer]}>
                  To continue please enter your password below.
                </Text>
              </View>
              <RWBTextField
                value={password}
                secureTextEntry={true}
                label="PASSWORD"
                autoCapitalize="none"
                blurOnSubmit={true}
                error={passwordError}
                onChangeText={(text) => {
                  this.setState({
                    password: text,
                  });
                }}
              />
            </View>
          </KeyboardAwareScrollView>
          <View
            style={[
              globalStyles.centerButtonWrapper,
              styles.bottomButtonContainer,
              {bottom: this.keyboardHeight},
            ]}>
            <RWBButton
              buttonStyle="primary"
              text="DELETE MY ACCOUNT"
              onPress={this.deleteAccountPressed}
              disabled={password.length < 8}
              customStyles={{
                opacity: password.length >= 8 ? 1 : 0.5,
              }}
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
  iconContainer: {
    height: 36,
    width: 36,
    alignSelf: 'center',
    marginBottom: 25,
  },
  textBlock: {
    marginTop: 25,
  },
  textContainer: {
    marginTop: 20,
  },
  bottomButtonContainer: {
    width: '90%',
    alignSelf: 'center',
    position: 'absolute',
  },
});
