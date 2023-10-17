import React, {Component} from 'react';
import styles from './Registration.module.css';
import RWBUserImages from '../RWBUserImages';
import TextArea from '../TextArea';
import TextInput from '../TextInput';
import RWBButton from '../RWBButton';
import {userProfile} from '../../../../shared/models/UserProfile';
import {isNullOrEmpty} from '../../../../shared/utils/Helpers';
import {rwbApi} from '../../../../shared/apis/api';
import Loading from '../Loading';
import {withRouter} from 'react-router-dom';
import imageHandler from '../ImageHandler';
import {logSocialProfile} from '../../../../shared/models/Analytics';

const FIELD_IS_REQUIRED_STRING = 'THIS FIELD IS REQUIRED';
const BIO_LENGTH_ERROR = 'EXCEEDED THE PROFILE BIO LIMIT';
const MAX_BIO_CHARS = 250;

class RegisterSocialProfile extends Component {
  constructor(props) {
    super(props);
    const {
      first_name,
      last_name,
      profile_bio,
      profile_photo_url,
      cover_photo_url,
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
      isLoading: false,
    };

    const assigned_state = Object.assign(
      default_state,
      first_name ? {first_name} : {},
      last_name ? {last_name} : {},
      profile_bio ? {profile_bio} : {},
      profile_photo_url ? {profile_photo_url} : {},
      cover_photo_url ? {cover_photo_url} : {},
    );
    this.state = assigned_state;
  }

  addImageHandler = (e, imageStateHandler) => {
    const file = e.target.files[0];
    const type = imageStateHandler.split('_')[0]; //cover or profile
    if (file) {
      // needs support for iOS devices as they are 'image/' type,
      // but are not selectable from the html accept value
      if (!file.type.includes('image/')) {
        window.alert('Invalid file format: please upload an image.');
      } else {
        this.setState({isLoading: true});
        imageHandler(file, type).then((result) => {
          this.setState((prevState) => ({
            ...prevState,
            [imageStateHandler]: result,
          }));
          if (imageStateHandler === 'cover_photo_url') {
            rwbApi.putUser(JSON.stringify({[imageStateHandler]: result}));
          } else {
            this.uploadProfileImage(file);
          }
          this.setState({isLoading: false});
        });
      }
    }
  };

  uploadProfileImage = async (file) => {
    const profilePhotoPayload = this.formDataMaker(file);
    await rwbApi
      .putUserPhotoWeb(profilePhotoPayload)
      .then((jsonBody) => {
        if (jsonBody.hasOwnProperty('url')) {
          // server returns 200 when upload fails, so double check that it has a url
          this.setState({profile_photo_url: jsonBody.url});
        } else throw new Error();
      })
      .catch((error) => {
        alert(
          "There was an issue uploading your image to Team RWB's server. Please try again",
        );
      });
  };

  formDataMaker = (file) => {
    let formData = new FormData();
    formData.append('photo', file);
    return formData;
  };

  clearErrorWarnings = () => {
    this.setState({
      first_name_error: '',
      last_name_error: '',
      profile_bio_error: '',
    });
  };

  validateProfile = () => {
    const {first_name, last_name, profile_bio} = this.state;
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

  nextPressed = () => {
    this.clearErrorWarnings();
    if (this.validateProfile()) this.doNext();
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
    let value = this.props.location.state?.value || {};

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
    if (this.props.location.state && this.props.location.state.incomplete)
      incomplete = true;
    let analyticsObj = {};
    if (this.props.location.state && this.props.location.state.from)
      analyticsObj.previous_view = this.props.location.state.from;
    logSocialProfile(analyticsObj);
    this.props.history.push({
      pathname: '/registration/military_info',
      state: {value: profile, incomplete, from: 'Social Profile'},
    });
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
      <div className={styles.container}>
        <Loading size={100} color={'var(--white)'} loading={isLoading} />
        <div className={styles.headerContainer}>
          <h3 className="title">Social Profile</h3>
          <p className="titleSubheader">Step 4 of 6</p>
        </div>
        <div className={styles.userImageContainer}>
          <RWBUserImages
            coverPhoto={cover_photo_url}
            profilePhoto={profile_photo_url}
            edit={true}
            onChangeProfile={(e) =>
              this.addImageHandler(e, 'profile_photo_url')
            }
            onChangeCover={(e) => this.addImageHandler(e, 'cover_photo_url')}
          />
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.formContainer}>
            <TextInput
              label={'First Name'}
              error={first_name_error}
              value={first_name}
              onValueChange={(text) => {
                this.setState({
                  first_name: text.target.value,
                });
              }}
            />
            <TextInput
              label={'Last Name'}
              error={last_name_error}
              value={last_name}
              onValueChange={(text) => {
                this.setState({
                  last_name: text.target.value,
                });
              }}
            />
            <TextArea
              label={'Profile Bio'}
              placeholder={'Enter Profile Description'}
              error={profile_bio_error}
              maxChar={250}
              value={profile_bio}
              onChange={(value) => this.setState({profile_bio: value})}
            />
          </div>
          <div className={styles.buttonContainer}>
            <RWBButton
              onClick={this.nextPressed}
              label={'Next'}
              buttonStyle={'primary'}
            />
            <RWBButton
              link={true}
              to={'/registration/personal_info'}
              label={'Back'}
              buttonStyle={'secondary'}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(RegisterSocialProfile);
