import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import RWBRowButton from '../design_components/RWBRowButton';
import {rwbApi} from '../../shared/apis/api';
import {isNullOrEmpty} from '../../shared/utils/Helpers';
import NavigationService from '../models/NavigationService';
import RWBTextField from '../design_components/RWBTextField';
import RWBButton from '../design_components/RWBButton';
// SVGs
import FlagIcon from '../../svgs/FlagIcon';

import globalStyles, {RWBColors} from '../styles';
import {logUpdateProfile} from '../../shared/models/Analytics';

const MAX_BIO_CHARS = 250;

export default class EditMyProfileView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      searchVisible: false,
      user: this.props.user,
      preferredChapter: this.props.user.preferred_chapter,
      first_name_error: '',
      last_name_error: '',
      bio_error: '',
    };
  }

  // Call getUser in MyProfileScreen and update the state
  getUpdatedProfile() {
    this.props.onSave();
    this.setState({user: this.props.user});
  }

  save() {
    if (this.state.edited) return this.updateProfile();
    this.props.onEdit();
  }

  clearWarnings() {
    this.setState({
      first_name_warning: '',
      last_name_warning: '',
      bio_error: '',
    });
  }

  updateProfile() {
    this.clearWarnings();
    let hasError = false;
    const {first_name, last_name, profile_bio} = this.state.user;
    const field_is_required_string = 'THIS FIELD IS REQUIRED';
    const bio_length_error = 'EXCEEDED THE PROFILE BIO LIMIT';

    if (isNullOrEmpty(first_name)) {
      this.setState({first_name_error: field_is_required_string});
      hasError = true;
    }
    if (isNullOrEmpty(last_name)) {
      this.setState({last_name_error: field_is_required_string});
      hasError = true;
    }
    if (isNullOrEmpty(profile_bio)) {
      this.setState({bio_error: field_is_required_string});
      hasError = true;
    }
    if (profile_bio && profile_bio > MAX_BIO_CHARS) {
      this.setState({bio_error: bio_length_error});
      hasError = true;
    }
    // check all fields for errors, then return.
    if (hasError) {
      return;
    }
    let userData = {first_name, last_name, profile_bio};
    this.setState({isLoading: true});
    rwbApi.putUser(JSON.stringify(userData)).then(() => {
      this.updateChapter().then(() => {
        logUpdateProfile();
        this.getUpdatedProfile();
        this.props.onEdit();
      });
    });
  }

  updateChapter = () => {
    return rwbApi
      .putChapters(
        JSON.stringify({
          preferred_chapter: this.state.preferredChapter.id.toString(),
        }),
      )
      .then((response) => {
        this.setState({isLoading: false});
      })
      .catch((error) => {
        Alert.alert(
          'Team RWB',
          'There was a problem updating your personal info. Please try again later.',
        );
      });
  };

  handleChapterPicker = (chapter) => {
    this.setState({
      preferredChapter: chapter,
      edited: chapter.id !== this.state.preferredChapter.id,
    });
  };

  render() {
    const {first_name_error, last_name_error, bio_error, user} = this.state;
    const {first_name, last_name, profile_bio} = user;
    return (
      <View style={styles.container}>
        {this.state.isLoading && (
          <View style={globalStyles.spinnerOverLay}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <View style={styles.contentWrapper}>
          {/* Name and location */}
          <View style={{paddingHorizontal: '5%'}}>
            <RWBTextField
              label="FIRST NAME"
              autoFocus={false}
              // onBlur={onBlur}
              value={first_name}
              // onSubmitEditing={onDonePressed}
              error={first_name_error}
              onChangeText={(text) => {
                this.setState({
                  user: {
                    ...user,
                    first_name: text,
                  },
                  edited: true,
                });
              }}
            />
            <RWBTextField
              label="LAST NAME"
              autoFocus={false}
              // onBlur={onBlur}
              error={last_name_error}
              value={last_name}
              onChangeText={(text) => {
                this.setState({
                  user: {
                    ...user,
                    last_name: text,
                  },
                  edited: true,
                });
              }}
              // onSubmitEditing={onDonePressed}
            />
            {/* <PreferredChapterPicker
              preferredChapter={this.state.preferredChapter}
              chapters={this.props.chapters}
              changeChapter={this.handleChapterPicker}
            /> */}
            {/* This is the user's preferred chapter, which is tied to anchor chapter. */}
            <View
              style={{
                marginTop: 10,
                marginBottom: 20,
                borderBottomWidth: 1,
                borderBottomColor: '#9E9E9E', // to match form fields when not focused
                paddingBottom: 8,
              }}>
              <Text style={[globalStyles.formLabel, {color: '#9E9E9E'}]}>
                LOCAL CHAPTER
              </Text>
              <Text style={globalStyles.formInput}>
                {this.state.preferredChapter.name}
              </Text>
            </View>
            <View style={{marginBottom: 20, marginTop: 0}}>
              <Text style={globalStyles.formLabel}>
                PROFILE BIO ( {profile_bio ? profile_bio.length : 0} /{' '}
                {MAX_BIO_CHARS} )
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
                    user: {
                      ...user,
                      profile_bio: text,
                    },
                    edited: true,
                  });
                }}
              />
              {bio_error ? (
                <View>
                  <Text />
                  <Text style={globalStyles.errorMessage}>{bio_error}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <RWBRowButton
            icon={
              <FlagIcon style={[styles.iconView, {marginRight: 10, top: 1}]} />
            }
            text="Military Service"
            buttonStyle="chevron"
            onPress={() =>
              NavigationService.navigate('MyProfileMilitaryService', {
                value: this.props.user,
                getUpdatedProfile: this.getUpdatedProfile.bind(this),
              })
            }
          />
        </View>
        <View style={{paddingHorizontal: '5%'}}>
          <RWBButton
            onPress={() => this.save()}
            text={'Save'}
            buttonStyle={'primary'}
            customStyles={{width: '100%', marginTop: 20}}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    width: '100%',
    alignSelf: 'center',
  },
  contentWrapper: {
    width: '100%',
    flex: 1,
  },
  iconView: {
    width: 16,
    height: 16,
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
