import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {NavigationEvents} from 'react-navigation';

import {LoginManager as FBLoginManager} from 'react-native-fbsdk';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

import RWBRowButton from '../design_components/RWBRowButton';
import {authentication} from '../../shared/models/Authentication';
import {userProfile} from '../../shared/models/UserProfile';
import {logLogout} from '../../shared/models/Analytics';
import NavigationService from '../models/NavigationService';
import {filters} from '../models/Filters';
import {userLocation} from '../../shared/models/UserLocation';
import {version as AppVersion} from '../../package.json';

// SVGs
import LogoutIcon from '../../svgs/LogoutIcon';
import MailIcon from '../../svgs/EmailIcon';
import AccountIcon from '../../svgs/AccountIcon';
import PrivacyIcon from '../../svgs/PrivacyIcon';
import NotificationTabIcon from '../../svgs/NotificationTabIcon';
import KeyIcon from '../../svgs/KeyIcon';
import DocumentIcon from '../../svgs/DocumentIcon';
import XIcon from '../../svgs/XIcon';

import globalStyles, {RWBColors} from '../styles';
import {
  COOKIE_POLICY_URL,
  COMMUNITY_GUIDELINES_URL,
  POLICY_TERMS_URL,
} from '../../shared/constants/TermURLs';
import {NEWSLETTER_PREFERENCES} from '../../shared/constants/URLs';
import {isDev} from '../../shared/utils/IsDev';
import TrashIcon from '../../svgs/TrashIcon';
import BlockedUsersIcon from '../../svgs/BlockedUsersIcon';

export default class AppSettings extends React.Component {
  static navigationOptions = ({navigation}) => {
    const {params = {}} = navigation.state;
    return {
      headerStyle: {
        backgroundColor: RWBColors.magenta,
      },
      headerTitleStyle: {alignSelf: 'center'},
      headerTintColor: RWBColors.white,
      // the shared header config is in app.js
      headerLeft: () =>
        params && params.showNavHeader ? (
          <TouchableOpacity
            style={globalStyles.backButton}
            onPress={() => {
              const backPressed = navigation.getParam('backPressed', null);
              if (backPressed === null) {
                params.hideHeader();
                navigation.pop();
                return;
              }
              backPressed();
            }}
            accessibilityRole={'button'}
            accessible={true}
            accessibilityLabel={'Close'}>
            <XIcon
              tintColor={RWBColors.white}
              style={globalStyles.headerIcon}
            />
          </TouchableOpacity>
        ) : null,
      headerTitle: () =>
        params && params.showNavHeader ? (
          <Text style={[globalStyles.title, {top: 3}]}>App Settings</Text>
        ) : null,
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      photoIsLoading: false,
      showAndroidImageSheet: false,
      first_name: '',
      last_name: '',
      profilePhoto: undefined,
    };
    this.user = {
      first_name: '',
      last_name: '',
    };
    this.userChapter = new Object();
    this.getUser = this.getUser.bind(this);
    this.logout = this.logout.bind(this);
    this.handleLogoutPress = this.handleLogoutPress.bind(this);
    this.requestAndroidPerms = this.requestAndroidPerms.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setParams({
      showNavHeader: true,
      hideHeader: this.hideHeader,
    });
    this.getUser();
  }

  // when closing the page the header persists at the bottom on iOS
  // when hitting back button, do not display the header to avoid this
  // TODO: Finish fixing this.
  hideHeader = () => {
    this.props.navigation.setParams({
      showNavHeader: false,
    });
  };

  requestAndroidPerms() {
    return PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
  }

  getUser() {
    this.setState({isLoading: true});
    user = userProfile.getUserProfile();
    this.user = user;

    let homeChapter = this.user.home_chapter;
    let preferredChapter = this.user.preferred_chapter;

    if (preferredChapter) {
      this.userChapter = preferredChapter;
    } else {
      this.userChapter = homeChapter;
    }
    // with the speed of the server, get user retrieves the previously uploaded user image
    // because of this, on the initial load only do we use the user profile photo, otherwise we use
    // the one stored in state (the one the user picked)
    this.setState({
      isLoading: false,
      profilePhoto:
        this.state.profilePhoto === undefined
          ? this.user.profile_photo_url
          : this.state.profilePhoto,
      first_name: user.first_name,
      last_name: user.last_name,
      title: user.eagle_leader_title,
    });
  }

  handleLogoutPress() {
    Alert.alert('Team RWB', "Are you sure you'd like to log out?", [
      {
        text: 'Cancel',
        onPress: function () {
          return;
        },
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: this.logout,
        style: 'destructive',
      },
    ]);
  }

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

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <NavigationEvents onDidFocus={this.getUser} />
        <View style={styles.contentWrapper}>
          <ScrollView style={{flex: 1, marginBottom: 10}}>
            <RWBRowButton
              icon={<AccountIcon style={styles.rowButtonIcon} />}
              buttonStyle="chevron"
              text="Personal Information"
              onPress={() => {
                NavigationService.navigate('SettingsPersonalInfo', {
                  value: {
                    user: this.user,
                    userLocation: this.user.location,
                  },
                });
              }}
            />
            <RWBRowButton
              icon={<PrivacyIcon style={styles.rowButtonIcon} />}
              buttonStyle="chevron"
              text="Privacy Settings"
              onPress={() => {
                NavigationService.navigate('SettingsPrivacySettings', {
                  value: {
                    user: this.user,
                  },
                  onWaiverModalDismiss: function (boolean) {
                    /* no-op */
                  },
                });
              }}
            />
            <RWBRowButton
              icon={<BlockedUsersIcon style={styles.rowButtonIcon} />}
              buttonStyle="chevron"
              text="Blocked Users"
              onPress={() => {
                NavigationService.navigate('SettingsBlockedUsers');
              }}
            />
            <RWBRowButton
              icon={
                <NotificationTabIcon
                  style={styles.rowButtonIcon}
                  tintColor={RWBColors.magenta}
                  filledIcon={true}
                />
              }
              buttonStyle="chevron"
              text="Notification Settings"
              onPress={() => {
                NavigationService.navigate('SettingsNotificationSettings', {
                  value: {
                    user: this.user,
                  },
                });
              }}
            />
            <RWBRowButton
              icon={<KeyIcon style={styles.rowButtonIcon} />}
              buttonStyle="chevron"
              text="Update Password"
              onPress={() => {
                NavigationService.navigate('SettingsPasswordUpdate');
              }}
            />
            <RWBRowButton
              icon={
                <DocumentIcon
                  tintColor={RWBColors.magenta}
                  style={styles.rowButtonIcon}
                />
              }
              buttonStyle="chevron"
              text="Legal Waiver"
              onPress={() => {
                NavigationService.navigate('SettingsLegalWaiver');
              }}
            />

            <RWBRowButton
              icon={<TrashIcon style={styles.rowButtonIcon} />}
              buttonStyle="chevron"
              text="Delete Account"
              onPress={() => {
                NavigationService.navigate('SettingsDeleteAccount');
              }}
            />
            <RWBRowButton
              icon={<MailIcon style={styles.rowButtonIcon} />}
              text="Newsletter Preferences"
              onPress={() => {
                // no preferences on staging, so use acccount 176249 (Daniel Ellman) on prod
                // NOTE: this account does not load on mobile devices for some reason
                isDev()
                  ? Linking.openURL(
                      `${NEWSLETTER_PREFERENCES}0033h00000OZ5dBAAT`,
                    )
                  : Linking.openURL(
                      `${NEWSLETTER_PREFERENCES}${this.user.salesforce_contact_id}`,
                    );
              }}
            />
            <RWBRowButton
              icon={<LogoutIcon style={styles.rowButtonIcon} />}
              text="Logout"
              onPress={this.handleLogoutPress}
            />
          </ScrollView>
          <View style={styles.footerContainer}>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Text
                style={globalStyles.link}
                onPress={() => Linking.openURL(POLICY_TERMS_URL)}>
                Privacy Policy & Terms
              </Text>
              <Text
                style={globalStyles.link}
                onPress={() => Linking.openURL(COMMUNITY_GUIDELINES_URL)}>
                Community Guidelines
              </Text>
              <Text
                style={globalStyles.link}
                onPress={() => Linking.openURL(COOKIE_POLICY_URL)}>
                Cookie Policy
              </Text>
            </View>
            <Text style={[globalStyles.formLabel, {textAlign: 'center'}]}>
              {`VERSION ${AppVersion}`}
            </Text>
          </View>
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
  contentWrapper: {
    width: '100%',
    flex: 1,
  },
  iconView: {
    width: 16,
    height: 16,
  },
  rowButtonIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
    top: 1,
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
  footerContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignSelf: 'flex-end',
    justifyContent: 'center',
  },
});
