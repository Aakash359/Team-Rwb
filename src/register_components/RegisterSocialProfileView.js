import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Platform,
  View,
  TextInput,
  ActionSheetIOS,
  StatusBar,
  Alert,
  ActivityIndicator,
  Text,
  Keyboard,
} from 'react-native';
import ImageResizer from 'react-native-image-resizer';
import moment from 'moment';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  isNullOrEmpty,
  getImageType,
  getBlobFromLocalURI,
} from '../../shared/utils/Helpers';
import {rwbApi} from '../../shared/apis/api';
import RWBButton from '../design_components/RWBButton';
import RWBTextField from '../design_components/RWBTextField';
import RWBUserImages from '../design_components/RWBUserImages';
import RegisterHeader from './RegisterHeader';
import {userProfile} from '../../shared/models/UserProfile';
import AndroidImageFlowSheet from '../design_components/AndroidImageFlowSheet';
import NavigationService from '../models/NavigationService';
import {authentication} from '../../shared/models/Authentication';

import globalStyles, {RWBColors} from '../styles';
import {logSocialProfile} from '../../shared/models/Analytics';

const FIELD_IS_REQUIRED_STRING = 'THIS FIELD IS REQUIRED';
const BIO_LENGTH_ERROR = 'EXCEEDED THE PROFILE BIO LIMIT';
const MAX_BIO_CHARS = 250;

export default class RegisterSocialProfileView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: () => (
        <RegisterHeader headerText="Social Profile" stepText="STEP 4 OF 6" />
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
    const {
      first_name,
      last_name,
      profile_bio,
      profile_photo_url,
      cover_photo_url,
      legal_waiver_signed,
    } = userProfile.getUserProfile();

    const default_state = {
      first_name: '',
      last_name: '',
      profile_bio: '',
      profile_photo_url: '',
      cover_photo_url: '',

      first_name_error: '',
      last_name_error: '',
      profile_bio_error: '',

      legal_waiver_signed: false,

      showAndroidImageSheet: false,
      editingCoverPhoto: false,
      editingProfilePhoto: false,

      isLoading: false,
      keyboardIsShowing: false,
    };

    const assigned_state = Object.assign(
      default_state,
      first_name ? {first_name} : {},
      last_name ? {last_name} : {},
      profile_bio ? {profile_bio} : {},
      profile_photo_url ? {profile_photo_url} : {},
      cover_photo_url ? {cover_photo_url} : {},
      legal_waiver_signed ? {legal_waiver_signed} : {},
    );
    this.state = assigned_state;
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

  showProfilePhotoFlow = () => {
    this.setState({
      editingProfilePhoto: true,
    });
    const {profile_photo_url} = this.state;
    if (Platform.OS === 'ios') {
      this.displayActionSheetIOS(profile_photo_url, 'front');
    } else {
      this.setState({
        showAndroidImageSheet: true,
      });
    }
  };

  showCoverPhotoFlow = () => {
    this.setState({
      editingCoverPhoto: true,
    });
    const {cover_photo} = this.state;
    if (Platform.OS === 'ios') {
      this.displayActionSheetIOS(cover_photo, 'back');
    } else {
      this.setState({
        showAndroidImageSheet: true,
      });
    }
  };

  displayActionSheetIOS = (currentPhoto, facing) => {
    if (currentPhoto) {
      const optionsWithRemove = {
        options: [
          'Cancel',
          'Take Photo',
          'Choose from Library',
          'Remove Photo',
        ],
        cancelButtonIndex: 0,
        destructiveButtonIndex: 3,
      };
      const controlsWithRemove = (buttonIndex) => {
        if (buttonIndex === 0) {
          this.cancelImageFlow();
        } else if (buttonIndex === 1) {
          NavigationService.navigate('CameraModal', {
            facing,
            onCameraDismiss: (photo) => this.onCameraDismiss(photo),
          });
        } else if (buttonIndex === 2) {
          NavigationService.navigate('CameraRollModal', {
            onCameraRollDismiss: (photo) => this.onCameraDismiss(photo),
          });
        } else if (buttonIndex === 3) {
          this.removeProfilePhoto();
        }
      };
      ActionSheetIOS.showActionSheetWithOptions(
        optionsWithRemove,
        controlsWithRemove,
      );
    } else {
      const optionsWithoutRemove = {
        options: ['Cancel', 'Take Photo', 'Choose from Library'],
        cancelButtonIndex: 0,
      };
      const controlsWithoutRemove = (buttonIndex) => {
        if (buttonIndex === 0) {
          this.cancelImageFlow();
        } else if (buttonIndex === 1) {
          // take photo
          NavigationService.navigate('CameraModal', {
            facing,
            onCameraDismiss: (photo) => this.onCameraDismiss(photo),
          });
        } else if (buttonIndex === 2) {
          // choose from lib
          NavigationService.navigate('CameraRollModal', {
            onCameraRollDismiss: (photo) => this.onCameraDismiss(photo),
          });
        }
      };
      ActionSheetIOS.showActionSheetWithOptions(
        optionsWithoutRemove,
        controlsWithoutRemove,
      );
    }
  };

  removeProfilePhoto = () => {
    this.setState({
      isLoading: true,
    });
    rwbApi
      .removeProfilePhoto('profile')
      .then((res) => {
        if (!res.ok) throw new Error();
        this.setState({
          profile_photo_url: '',
        });
      })
      .catch((error) => {
        Alert.alert(
          'Team RWB',
          'There was a problem removing your profile photo. Please try again in a minute.',
        );
      })
      .finally(() => {
        this.setState({
          isLoading: false,
        });
      });
  };

  removeCoverPhoto = () => {
    this.setState({
      isLoading: true,
    });
    rwbApi
      .putUser(JSON.stringify({cover_photo_url: ''}))
      .then((result) => {
        this.setState({
          cover_photo_url: '',
        });
      })
      .catch((error) => {
        Alert.alert(
          'Team RWB',
          'There was a problem removing your cover photo. Please try again in a minute.',
        );
      })
      .finally(() => {
        this.setState({isLoading: false});
      });
  };

  hideImageFlowSheets = () => {
    this.setState({
      showAndroidImageSheet: false,
    });
  };

  cancelImageFlow = () => {
    this.setState({
      editingCoverPhoto: false,
      editingProfilePhoto: false,
      showAndroidImageSheet: false,
    });
  };

  onCameraDismiss = (photo) => {
    if (!photo) {
      this.cancelImageFlow();
    } else {
      this.hideImageFlowSheets();
      this.resizePhoto(photo);
    }
  };

  resizePhoto = (photo) => {
    let uri;
    // select image from gallery
    if (!photo.uri) uri = photo.image.uri;
    // take picture
    else uri = photo.uri;
    ImageResizer.createResizedImage(uri, 500, 500, 'JPEG', 85, 0)
      .then((response) => {
        this.formDataMaker(photo, response.uri);
      })
      .catch((err) => {});
  };

  formDataMaker = (photo, uri) => {
    uri = Platform.OS === 'android' ? uri : uri.replace('file://', '');

    let type;
    // user just took the picture
    if (!photo.type) type = 'image/jpeg';
    // select from gallery android
    else if (Platform.OS === 'android') type = photo.type;
    // selected from gallery ios
    else type = getImageType(photo.image);

    const name = `${moment().format('X')}.jpg`;
    let formData = new FormData();
    formData.append('photo', {
      uri,
      type,
      name,
    });
    this.uploadPhoto(formData);
  };

  uploadPhoto = (img_data) => {
    const {editingCoverPhoto, editingProfilePhoto} = this.state;
    this.setState({
      isLoading: true,
    });
    if (editingCoverPhoto && editingProfilePhoto) {
      console.error('cannot be editing both cover and profile photos at once');
    } else if (!editingCoverPhoto && !editingProfilePhoto) {
      console.error('cannot be editing neither cover nor profile photo');
    } else if (editingProfilePhoto) {
      rwbApi
        .putUserPhoto(img_data)
        .then((jsonBody) => {
          if (jsonBody.hasOwnProperty('url')) {
            // server returns 200 when upload fails, so double check that it has a url
            this.setState({
              profile_photo_url: jsonBody.url,
            });
          } else throw new Error('Server did not respond with a URL.');
        })
        .catch((error) => {
          console.error(error);
          Alert.alert(
            'Team RWB',
            "There was an issue uploading your image to Team RWB's server. Please try again",
          );
        })
        .finally(() =>
          this.setState({
            isLoading: false,
          }),
        );
    } else if (editingCoverPhoto) {
      const imageURI = img_data.getParts()[0].uri;
      const fileName = img_data.getParts()[0].name;

      const data = {
        media_filename: fileName,
        media_intent: 'cover',
      };

      getBlobFromLocalURI(imageURI)
        .then((blob) => {
          rwbApi
            .getMediaUploadURL(JSON.stringify(data))
            .then((result) => {
              const url = result.data;
              rwbApi
                .putMediaUpload(url, blob)
                .then(() => {
                  const cover_photo_url = url.split('?')[0];
                  rwbApi
                    .putUser(JSON.stringify({cover_photo_url}))
                    .then((result) => {
                      this.setState({cover_photo_url: cover_photo_url});
                    });
                })
                .catch((error) => {
                  // Unable to upload the file to Azure
                  console.warn('error: ', error);
                });
            })
            .catch((error) => {
              // Unable to retrieve the upload URL
            });
        })
        .finally(() => {
          this.setState({isLoading: false});
        });
    }
    this.cancelImageFlow();
  };

  clearErrorWarnings = () => {
    this.setState({
      first_name_error: '',
      last_name_error: '',
      profile_bio_error: '',
    });
  };

  validateProfile = () => {
    const {
      first_name,
      last_name,
      profile_bio,
      legal_waiver_signed,
    } = this.state;
    let hasError = false;
    if (isNullOrEmpty(first_name)) {
      this.setState({
        first_name_error: FIELD_IS_REQUIRED_STRING,
      });
      hasError = true;
    }
    if (isNullOrEmpty(last_name)) {
      this.setState({
        last_name_error: FIELD_IS_REQUIRED_STRING,
      });
      hasError = true;
    }
    if (profile_bio.length > MAX_BIO_CHARS) {
      this.setState({profile_bio_error: BIO_LENGTH_ERROR});
      hasError = true;
    }
    return !hasError;
  };

  backPressed = () => {
    NavigationService.back();
  };

  nextPressed = () => {
    this.clearErrorWarnings();
    if (this.validateProfile()) {
      this.doNext();
    }
  };

  doNext = () => {
    const {
      first_name,
      last_name,
      profile_bio,
      profile_photo_url,
      cover_photo_url,
    } = this.state;

    // retrieve information from the previous registration flow to save and pass forward
    let value = this.props.navigation.getParam('value', {});

    const newData = {
      first_name,
      last_name,
      profile_bio,
      profile_photo_url,
      cover_photo_url,
    };

    value = Object.assign(value, newData);

    const profile = Object.assign({}, userProfile.getUserProfile(), value);
    userProfile.saveToUserProfile(profile);
    let incomplete = false;
    if (
      this.props.navigation.state.params &&
      this.props.navigation.state.params.incomplete
    )
      incomplete = true;
    let analyticsObj = {};
      if (
        this.props.navigation.state.params &&
        this.props.navigation.state.params.from
      )
        analyticsObj.previous_view = this.props.navigation.state.params.from;
    logSocialProfile(analyticsObj);
    NavigationService.navigate('MilitaryService', {value: profile, incomplete, from: 'Social Profile'});
  };

  render() {
    const {
      first_name,
      last_name,
      profile_bio,
      profile_photo_url,
      cover_photo_url,

      first_name_error,
      last_name_error,
      profile_bio_error,

      showAndroidImageSheet,
      editingCoverPhoto,
      editingProfilePhoto,
      isLoading,
    } = this.state;
    return (
      <SafeAreaView style={globalStyles.registrationScreenContainer}>
        <StatusBar
          barStyle="light-content"
          animated={true}
          translucent={false}
          backgroundColor={RWBColors.magenta}
        />
        {isLoading ? (
          <View style={globalStyles.spinnerOverLay}>
            <ActivityIndicator size="large" />
          </View>
        ) : null}
        <KeyboardAwareScrollView
          style={styles.scrollViewContainer}
          contentContainerStyle={[
            styles.scrollViewContainerContent,
            {flexGrow: this.state.keyboardIsShowing ? 0 : 1},
          ]}
          keyboardShouldPersistTaps="handled">
          <View style={{width: '100%'}}>
            <RWBUserImages
              editable={true}
              coverPhoto={cover_photo_url}
              editCoverPhoto={this.showCoverPhotoFlow}
              profilePhoto={profile_photo_url}
              editProfilePhoto={this.showProfilePhotoFlow}
            />
            <View style={[styles.formWrapper]}>
              <RWBTextField
                label="FIRST NAME"
                autoFocus={false}
                value={first_name}
                error={first_name_error}
                onChangeText={(text) => {
                  this.setState({
                    first_name: text,
                  });
                }}
              />
              <RWBTextField
                label="LAST NAME"
                autoFocus={false}
                error={last_name_error}
                value={last_name}
                onChangeText={(text) => {
                  this.setState({
                    last_name: text,
                  });
                }}
              />
            </View>
            <View style={[styles.formWrapper, {marginBottom: 20}]}>
              <Text style={globalStyles.formLabel}>
                PROFILE BIO ( {profile_bio.length} / {MAX_BIO_CHARS} )
              </Text>
              <TextInput
                placeholder="Enter Profile Description"
                value={profile_bio}
                multiline={true}
                blurOnSubmit={true}
                maxLength={MAX_BIO_CHARS}
                style={globalStyles.formInput}
                onChangeText={(text) => {
                  this.setState({
                    profile_bio: text,
                  });
                }}
              />
              {profile_bio_error ? (
                <View>
                  <Text />
                  <Text style={globalStyles.errorMessage}>
                    {profile_bio_error}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
          <View
            style={[
              globalStyles.centerButtonWrapper,
              {width: '90%', alignSelf: 'center'},
            ]}>
            <RWBButton
              buttonStyle="primary"
              text="NEXT"
              onPress={this.nextPressed}
            />
            <RWBButton
              buttonStyle="secondary"
              text="Back"
              onPress={this.backPressed}
            />
          </View>
        </KeyboardAwareScrollView>
        {editingProfilePhoto && showAndroidImageSheet ? (
          <AndroidImageFlowSheet
            showDelete={!!profile_photo_url}
            removeImage={this.removeProfilePhoto}
            facing={'front'}
            hide={this.hideImageFlowSheets}
            save={this.onCameraDismiss}
          />
        ) : null}
        {editingCoverPhoto && showAndroidImageSheet ? (
          <AndroidImageFlowSheet
            showDelete={!!cover_photo_url}
            removeImage={this.removeCoverPhoto}
            facing={'back'}
            hide={this.cancelImageFlow}
            save={this.onCameraDismiss}
          />
        ) : null}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    width: '100%',
  },
  scrollViewContainerContent: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  formWrapper: {
    flex: 1,
    width: '100%',
    paddingHorizontal: '5%',
    height: 'auto',
    marginTop: 20,
  },
});
