import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import RWBButton from '../design_components/RWBButton';
import RegisterHeader from './RegisterHeader';
import LinedRadioForm from '../design_components/LinedRadioForm';
import {rwbApi} from '../../shared/apis/api';
import {ANON_PROPS} from '../../shared/constants/RadioProps';
import {MILITARY_STATUSES} from '../../shared/constants/MilitaryStatusSlugs';
import {logCompleteRegistration} from '../../shared/models/Analytics';
import ImageResizer from 'react-native-image-resizer';
import moment from 'moment';
import {userProfile} from '../../shared/models/UserProfile';

import globalStyles, {RWBColors} from '../styles';

const {anon_radio_props} = ANON_PROPS;

export default class RegisterPrivacyWaiverView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: () => (
        <RegisterHeader headerText="Privacy/Waiver" stepText="STEP 6 OF 6" />
      ),
      headerLeft: () => null,
      headerStyle: {
        backgroundColor: RWBColors.magenta,
      },
      headerTintColor: RWBColors.white,
    };
  };

  constructor() {
    super();
    this.state = {
      anonymous_profile: false,
      legal_waiver: userProfile.getUserProfile().legal_waiver_signed, // needed for when redirected to register flow
      legal_waiver_error_text: '',
    };
    this.nextPressed = this.nextPressed.bind(this);
  }

  onWaiverModalDismiss(value) {
    // set the value.
    this.setState({legal_waiver: value});
  }

  nextPressed() {
    const {anonymous_profile, legal_waiver} = this.state;

    if (!legal_waiver) {
      this.setState({
        legal_waiver_error_text: 'YOU MUST ACCEPT THE WAIVER TO CONTINUE',
      });
      return;
    } else {
      this.setState({legal_waiver_error_text: ''});
    }
    let analyticsObj = {};
      if (
        this.props.navigation.state.params &&
        this.props.navigation.state.params.from
      )
        analyticsObj.previous_view = this.props.navigation.state.params.from;
    logCompleteRegistration(analyticsObj);
    let {navigation} = this.props;
    let value = navigation.getParam('value', {});
    value = Object.assign(value, {
      anonymous_profile,
      legal_waiver_signed: legal_waiver,
    });
    this.setState({isLoading: true});
    // Uncomment to test and not save the user profile
    // if (
    //   value.military_status !== MILITARY_STATUSES.civilian &&
    //   value.registration_started_via_app
    // ) {
    //   this.props.navigation.navigate('RedShirt', {value});
    // }
    // return;
    this.updateUserAndPhoto(value.profile_image, value)
      .then(([userPassed, photoPassed]) => {
        this.setState({
          isLoading: false,
        });
        if (userPassed && photoPassed) {
          rwbApi.getUser().then((response) => {
            if (
              value.military_status !== MILITARY_STATUSES.civilian &&
              value.registration_started_via_app &&
              !response.stripe_transaction_date // default value seems to be an empty string, otherwise date in a string
            ) {
              this.props.navigation.navigate('RedShirt', {value, from: 'Privacy/Waiver'});
            } else
              this.props.navigation.navigate('Feed', {
                newAccount: !this.props.navigation.state?.params?.incomplete,
              });
          });
        } else if (!userPassed && !photoPassed) {
          Alert.alert(
            'Error',
            'There was a problem uploading your photo and your profile.',
          );
        } else if (!photoPassed) {
          Alert.alert(
            'Error',
            'There was a problem uploading your photo. Add a photo at any time from "My Profile."',
            [
              {
                text: 'OK',
                onPress: () => {
                  this.props.navigation.navigate('Feed', {
                    newAccount: !this.props.navigation.state?.params
                      ?.incomplete,
                  });
                },
              },
            ],
          );
        } else {
          Alert.alert('Error', 'There was a problem uploading your profile.');
        }
      })
      .catch((error) => {
        Alert.alert(
          'Error',
          'There was a problem contacting the server. Please try again.',
        );
        this.setState({
          isLoading: false,
        });
      });
  }

  /**
   * Promise.all resolves to an array of resolved values.
   * It also rejects on the first uncaught exception.
   * Returning in the .catch blocks allow the Promise.all
   * to only resolve, so we can handle UX in one place.
   */
  updateUserAndPhoto(profile_image, payload) {
    return Promise.all([
      this.updateUser(payload)
        .then((response) => {
          return true;
        })
        .catch((error) => {
          return false;
        }),
      this.resizePhoto(profile_image)
        .then((response) => {
          return true;
        })
        .catch((error) => {
          return false;
        }),
    ]);
  }

  updateUser(value) {
    const {anonymous_profile, legal_waiver} = this.state;
    let payload = {
      app_created: true,
      app_installed: true,
      device_os_type: Platform.OS === 'ios' ? 'iPhone' : 'Android',
      //Profile Info
      first_name: value.first_name,
      last_name: value.last_name,
      profile_bio: value.profile_bio,
      street: value.location.address,
      street_2: value.location?.apartment,
      state: value.location.address_state,
      address_type: value.location.address_type,
      city: value.location.city,
      zipcode: value.location.zip,
      country: value.location.country,
      address_verified: value.address_verified,
      international_address_verified: value.international_address_verified,
      phone: value.phone,
      gender: value.gender,

      //Military Service
      military_status: value.military_status,

      //Legal Waiver
      anonymous_profile: anonymous_profile,
      legal_waiver_signed: legal_waiver,
    };

    if (value.military_status === MILITARY_STATUSES.veteran) {
      payload.military_ets = value.military_ets;
    }
    if (value.military_status !== MILITARY_STATUSES.civilian) {
      payload.military_rank = value.military_rank;
      payload.combat_zone = value.combat_zone;
      payload.has_disability = value.has_disability;
      payload.military_branch = value.military_branch;
    } else payload.military_family_member = value.military_family_member;
    // extra chance to avoid salesforce syncing issues
    if (value.combat_zone)
      payload.combat_deployment_operations = value.combat_deployment_operations;
    return rwbApi.putUser(JSON.stringify(payload));
  }

  resizePhoto(photo) {
    if (!photo) return this.uploadPhoto();
    else {
      let uri;
      // select image from gallery
      if (!photo.uri) uri = photo.image.uri;
      // take picture
      else uri = photo.uri;
      return ImageResizer.createResizedImage(uri, 500, 500, 'JPEG', 85, 0)
        .then((response) => {
          return this.uploadPhoto(photo, response.uri);
        })
        .catch((err) => {
          console.warn(err);
        });
    }
  }

  uploadPhoto(photo, uri) {
    let formData = new FormData();
    if (!photo) {
      // if the user hasn't selected a photo, just all good.
      // new Response() defaults to empty 200 OK
      const defaultResponse = new Response();
      return Promise.resolve(defaultResponse);
    } else {
      uri = Platform.OS === 'android' ? uri : uri.replace('file://', '');

      let type;
      // user just took the picture
      if (!photo.type) type = 'image/jpeg';
      // select from gallery android
      else if (Platform.OS === 'android') type = photo.type;
      // selected from gallery ios
      else type = getImageType(photo.image);

      const name = `${moment().format('X')}.jpg`; // current unix timestamp, seconds.

      formData = new FormData();
      formData.append('photo', {
        uri,
        type,
        name,
      });
    }

    return rwbApi.putUserPhoto(formData);
  }

  openWaiverModal() {
    this.props.navigation.navigate('WaiverModal', {
      onWaiverModalDismiss: (value) => this.onWaiverModalDismiss(value),
    });
  }

  handleSwitchChange(value) {
    if (value === true) {
      this.openWaiverModal();
    } else {
      this.setState({legal_waiver: value});
    }
  }

  render() {
    let switchRender = (
      <Switch
        value={this.state.legal_waiver}
        onValueChange={(value) => {
          this.handleSwitchChange(value);
        }}
      />
    );

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: RWBColors.white}}>
        {this.state.isLoading && (
          <View style={globalStyles.spinnerOverLay}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <StatusBar
          barStyle="light-content"
          animated={true}
          translucent={false}
          backgroundColor={RWBColors.magenta}
        />
        <ScrollView
          style={styles.scrollViewContainer}
          contentContainerStyle={styles.scrollViewContainerContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.formWrapper}>
            <View style={globalStyles.formBlock}>
              <Text style={globalStyles.formLabel}>LEGAL WAIVER</Text>
              <Text
                style={globalStyles.bodyCopy}
                onPress={() => {
                  this.openWaiverModal();
                }}>
                <Text style={globalStyles.link}>
                  Please read our Legal Waiver
                </Text>
                . You must accept waiver to complete signup.
              </Text>
              <View style={styles.switchView}>
                {switchRender}
                <Text style={[globalStyles.bodyCopyForm, styles.switchLabel]}>
                  Yes, I accept.
                </Text>
              </View>

              {this.state.legal_waiver_error_text ? (
                <Text style={globalStyles.errorMessage}>
                  {' '}
                  {this.state.legal_waiver_error_text}
                </Text>
              ) : null}
              {this.state.legal_waiver_error_text ? (
                <View style={styles.errorBar} />
              ) : null}
            </View>

            <Text style={globalStyles.formLabel}>PUBLIC PROFILE</Text>
            <LinedRadioForm
              style={globalStyles.formBlock}
              radio_props={anon_radio_props}
              initial={0}
              onPress={(value) => {
                this.setState({anonymous_profile: value});
              }}
            />
          </View>
          <View style={globalStyles.centerButtonWrapper}>
            <RWBButton
              buttonStyle="primary"
              text={
                this.props.navigation.state.params &&
                this.props.navigation.state.params.incomplete
                  ? 'COMPLETE INFORMATION UPDATE'
                  : 'COMPLETE REGISTRATION'
              }
              onPress={this.nextPressed}
            />
            <RWBButton
              buttonStyle="secondary"
              text="Back"
              onPress={() => {
                this.props.navigation.goBack();
              }}
            />
          </View>
        </ScrollView>
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
    flexGrow: 1,
  },
  formWrapper: {
    flex: 1,
    width: '90%',
    height: 'auto',
    marginTop: 15,
  },
  logoView: {
    width: '100%',
    padding: 50,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  login: {
    textAlign: 'center',
    margin: 25,
  },
  footerText: {
    fontSize: 10,
    textAlign: 'center',
    width: '65%',
  },
  switchView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    width: '90%',
  },
  switchLabel: {
    marginLeft: 15,
    flex: 1,
    justifyContent: 'center',
  },
  errorBar: {
    position: 'absolute',
    left: Dimensions.get('window').width * -0.05,
    top: '-3.5%',
    backgroundColor: RWBColors.magenta,
    width: 7,
    height: '107%',
  },
});
