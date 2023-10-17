import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  Platform,
  ActionSheetIOS,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  Keyboard,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {NavigationEvents} from 'react-navigation';
import NavigationService from '../models/NavigationService';
import {userProfile} from '../../shared/models/UserProfile';
import MyProfileView from './MyProfileView';
import EditMyProfileView from './EditMyProfileView';
import SettingsIcon from '../../svgs/SettingsIcon';
import XIcon from '../../svgs/XIcon';
import CheckIcon from '../../svgs/CheckIcon';
import AndroidImageFlowSheet from '../design_components/AndroidImageFlowSheet';
import ImageResizer from 'react-native-image-resizer';
import {getImageType, getBlobFromLocalURI, isNullOrEmpty} from '../../shared/utils/Helpers';
import moment from 'moment';
import {rwbApi} from '../../shared/apis/api';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import globalStyles, {RWBColors} from '../styles';
import RWBUserImages from '../design_components/RWBUserImages';
import {
  EXECUTION_STATUS,
  logAccessAppSettings,
  logProfileCoverPhoto,
  logEditButton,
  logProfilePhoto,
} from '../../shared/models/Analytics';

export default class MyProfileScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chapters: [],
      isLoading: true,
      photoIsLoading: false,
      first_name: '',
      last_name: '',
      profilePhoto: null,
      coverPhoto: null,
      editing: false,
      keyboardIsShowing: false,
      followingAmount: undefined,
      followersAmount: undefined,
      refreshing: false,
      userLoadingError: false,
    };
    this.user = {
      first_name: '',
      last_name: '',
    };
    this.userChapter = new Object();
  }

  componentDidMount = () => {
    // chapters need to be loaded first to avoid issues accessing the editing state
    this.getChapters().then(this.getUser());
    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this._keyboardWillShow,
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this._keyboardWillHide,
    );
  };

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

  // used for local group picker
  // TODO: Determine how frequenly this gets updated and if we can store the results in a JSON file.
  getChapters = () => {
    return rwbApi
      .getChapters()
      .then((jsonBody) => {
        let {data} = jsonBody;

        this.setState({
          chapters: data,
        });
      })
      .catch((error) => {
        Alert.alert(
          'Team RWB',
          'There was an error finding a list of available chapters.',
        );
      });
  };

  getUser = () => {
    const user = userProfile.getUserProfile();
    this.user = user;
    let homeChapter = this.user.home_chapter;
    let preferredChapter = this.user.preferred_chapter;
    let userChapter;
    if (preferredChapter) {
      userChapter = preferredChapter;
    } else {
      userChapter = homeChapter;
    }
    // with the speed of the server, get user retrieves the previously uploaded user image
    // because of this, on the initial load only do we use the user profile photo, otherwise we use
    // the one stored in state (the one the user picked)
    this.getUsersFollowSummary(this.user.id)
      .then((result) => {
        const followingAmount = result.following;
        const followersAmount = result.followers;
        this.setState({
          user,
          isLoading: false,
          profilePhoto:
            this.state.profilePhoto === null
              ? this.user.profile_photo_url
              : this.state.profilePhoto,
          coverPhoto:
            this.state.coverPhoto === null
              ? this.user.cover_photo_url
              : this.state.coverPhoto,
          first_name: user.first_name,
          last_name: user.last_name,
          title: user.eagle_leader_title,
          userChapter,
          followingAmount,
          followersAmount,
        });
      })
      .catch((error) => {
        Alert.alert('Team RWB', 'Issue retrieving user information');
        this.setState({
          isLoading: false,
          userLoadingError: true,
        });
      });
  };

  getUsersFollowSummary = (id) => {
    return rwbApi.getFollowSummary(id).catch((error) => {
      console.warn(error);
    });
  };

  toggleEdit = () => {
    logEditButton();
    this.setState({editing: !this.state.editing});
  };

  cancelEdit = () => {
    this.getUser();
    this.toggleEdit();
  };

  showProfilePhotoFlow = () => {
    logProfilePhoto();
    this.setState({
      editingProfilePhoto: true,
    });
    const {profilePhoto} = this.state;
    if (Platform.OS === 'ios') {
      this.displayActionSheetIOS(profilePhoto, 'front', 'profile');
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
    const {coverPhoto} = this.state;
    if (Platform.OS === 'ios') {
      this.displayActionSheetIOS(coverPhoto, 'back', 'cover');
    } else {
      this.setState({
        showAndroidImageSheet: true,
      });
    }
  };

  displayActionSheetIOS = (currentPhoto, facing, type) => {
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
        } else if (buttonIndex === 3) {
          // remove photo
          if (type === 'profile') this.removeProfilePhoto();
          else if (type === 'cover') this.removeCoverPhoto();
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
          profilePhoto: null,
        });
        // remove profile photo from UserProfile
        this.user.profile_photo_url = null;
        userProfile.saveToUserProfile(this.user);
        this.getUser();
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
        logProfileCoverPhoto({has_image: !isNullOrEmpty(this.state.coverPhoto), execution_status: EXECUTION_STATUS.success});
        this.setState({
          coverPhoto: null,
        });
        // remove cover photo from UserProfile
        this.user.cover_photo_url = null;
        userProfile.saveToUserProfile(this.user);
        this.getUser();
      })
      .catch((error) => {
        logProfileCoverPhoto({has_image: !isNullOrEmpty(this.state.coverPhoto), execution_status: EXECUTION_STATUS.failure});
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
      .catch((err) => {
        console.warn(err);
      });
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

    const name = `${moment().format('X')}.jpg`; // current unix timestamp, seconds.
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
      photoIsLoading: true,
    });
    if (editingCoverPhoto && editingProfilePhoto) {
      console.error('cannot be editing both cover and profile photos at once');
    } else if (!editingCoverPhoto && !editingProfilePhoto) {
      console.error('cannot be editing neither cover nor profile photo');
    } else if (editingProfilePhoto) {
      rwbApi
        .putUserPhoto(img_data, 'profile')
        .then((jsonBody) => {
          if (jsonBody.hasOwnProperty('url')) {
            // server returns 200 when upload fails, so double check that it has a url
            this.setState({
              profilePhoto: jsonBody.url,
            });
            this.user.profile_photo_url = jsonBody.url;
            userProfile.saveToUserProfile(this.user);
            this.getUser();
          } else throw new Error();
        })
        .catch((error) => {
          Alert.alert(
            'Team RWB',
            "There was an issue uploading your image to Team RWB's server. Please try again",
          );
        })
        .finally(() =>
          this.setState({
            photoIsLoading: false,
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
                      logProfileCoverPhoto({has_image: !isNullOrEmpty(this.state.coverPhoto), execution_status: EXECUTION_STATUS.success});
                      this.setState({coverPhoto: cover_photo_url});
                      this.user.cover_photo_url = cover_photo_url;
                      userProfile.saveToUserProfile(this.user);
                      this.getUser();
                    });
                })
                .catch((error) => {
                  logProfileCoverPhoto({has_image: !isNullOrEmpty(this.state.coverPhoto), execution_status: EXECUTION_STATUS.failure});
                  // Unable to upload the file to Azure
                  console.warn('error: ', error);
                });
            })
            .catch((error) => {
              // Unable to retrieve the upload URL
            });
        })
        .finally(() => {
          this.setState({photoIsLoading: false});
        });
    }
    this.cancelImageFlow();
  };

  refreshUserProfile = () => {
    // despite bounce being set to false, pull refresh can still happen during editing
    // this fix prevents the crash, but the pull refresh icon will still appear
    // includes pulling latest feed, badges, and metrics
    if (!this.state.editing && this.profileView)
      this.profileView.loadUserProfile();
  };

  render() {
    const {
      editing,
      profilePhoto,
      coverPhoto,
      editingCoverPhoto,
      editingProfilePhoto,
      showAndroidImageSheet,
      isLoading,
    } = this.state;
    return (
      <SafeAreaView style={{backgroundColor: RWBColors.magenta, flex: 1}}>
        <FlatList
          refreshing={this.state.refreshing}
          onRefresh={() => this.refreshUserProfile()}
          bounces={!this.state.editing} // prevents refreshing while editing
          style={{backgroundColor: RWBColors.white}}
          ListHeaderComponent={
            <SafeAreaView
              style={[
                globalStyles.tabScreenContainer,
                {backgroundColor: RWBColors.magenta},
              ]}>
              {editing ? (
                <View style={styles.editMyProfileHeader}>
                  <View style={styles.editHeader}>
                    <TouchableOpacity
                      onPress={this.cancelEdit}
                      disabled={
                        this.state.isLoading || this.state.photoIsLoading
                      }>
                      <XIcon
                        tintColor={RWBColors.white}
                        style={[
                          globalStyles.headerIcon,
                          {
                            opacity:
                              this.state.isLoading || this.state.photoIsLoading
                                ? 0.5
                                : 1,
                          },
                        ]}
                      />
                    </TouchableOpacity>
                    <Text
                      style={[globalStyles.title, {color: RWBColors.white}]}>
                      Edit Profile
                    </Text>
                    <TouchableOpacity
                      disabled={
                        this.state.isLoading || this.state.photoIsLoading
                      }
                      onPress={() => this.editProfile.updateProfile()}>
                      <CheckIcon
                        color={RWBColors.white}
                        style={[
                          globalStyles.headerIcon,
                          {
                            opacity:
                              this.state.isLoading || this.state.photoIsLoading
                                ? 0.5
                                : 1,
                          },
                        ]}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
              <KeyboardAwareScrollView
                style={{width: '100%', backgroundColor: RWBColors.white}}
                contentContainerStyle={{
                  flexGrow: this.state.keyboardIsShowing ? 0 : 1,
                }}>
                <StatusBar
                  barStyle="light-content"
                  animated={true}
                  translucent={false}
                  backgroundColor={RWBColors.magenta}
                />
                <NavigationEvents onDidFocus={this.getUser} />
                {this.state.isLoading || this.state.photoIsLoading ? (
                  <View style={globalStyles.spinnerOverLay}>
                    <ActivityIndicator size="large" />
                  </View>
                ) : null}
                {/* Header elements */}
                {editing ? null : (
                  <View style={styles.settingsIconContainer}>
                    <TouchableOpacity
                      style={styles.headerIconContainer}
                      onPress={() => {
                        // note, this can be spam clicked
                        logAccessAppSettings();
                        NavigationService.push('AppSettingsStack');
                      }}>
                      <SettingsIcon
                        style={globalStyles.headerIcon}
                        tintColor={RWBColors.magenta}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                {/* Image elements */}
                <RWBUserImages
                  editable={editing}
                  coverPhoto={coverPhoto}
                  editCoverPhoto={this.showCoverPhotoFlow}
                  profilePhoto={profilePhoto}
                  editProfilePhoto={this.showProfilePhotoFlow}
                />
                {/* Body elements */}
                <View
                  style={{
                    flexGrow: this.state.keyboardIsShowing ? 0 : 1,
                    marginTop: 40,
                  }}>
                  {isLoading || this.state.userLoadingError ? (
                    <View />
                  ) : editing ? (
                    <EditMyProfileView
                      ref={(editProfile) => {
                        this.editProfile = editProfile;
                      }}
                      chapters={this.state.chapters}
                      onEdit={this.toggleEdit}
                      user={this.state.user}
                      userChapter={this.state.userChapter}
                      onSave={this.getUser}
                    />
                  ) : (
                    <MyProfileView
                      ref={(profileView) => {
                        this.profileView = profileView;
                      }}
                      onEdit={this.toggleEdit}
                      user={this.state.user}
                      userChapter={this.state.userChapter}
                      followersAmount={this.state.followersAmount}
                      followingAmount={this.state.followingAmount}
                    />
                  )}
                </View>
              </KeyboardAwareScrollView>
              {editingProfilePhoto && showAndroidImageSheet ? (
                <AndroidImageFlowSheet
                  showDelete={!!profilePhoto}
                  removeImage={this.removeProfilePhoto}
                  facing={'front'}
                  hide={this.hideImageFlowSheets}
                  save={this.onCameraDismiss}
                />
              ) : null}
              {editingCoverPhoto && showAndroidImageSheet ? (
                <AndroidImageFlowSheet
                  showDelete={!!coverPhoto}
                  removeImage={this.removeCoverPhoto}
                  facing={'back'}
                  hide={this.cancelImageFlow}
                  save={this.onCameraDismiss}
                />
              ) : null}
            </SafeAreaView>
          }
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
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
  // header styles
  settingsIconContainer: {
    position: 'absolute',
    top: 10,
    right: '5%',
    zIndex: 2,
  },
  headerIconContainer: {
    backgroundColor: RWBColors.whiteOpacity85,
    height: 34,
    width: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editMyProfileHeader: {
    width: '100%',
    height: 56,
    paddingVertical: 10,
    backgroundColor: RWBColors.magenta,
  },
  editHeader: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    marginHorizontal: 16,
    color: RWBColors.white,
  },
});
