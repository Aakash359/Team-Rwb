import React from 'react';
import {
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  View,
  TextInput,
  Keyboard,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import PhotoController from '../design_components/PhotoController';

import globalStyles, {RWBColors} from '../styles';
import {rwbApi} from '../../shared/apis/api';
import {
  getBlobFromLocalURI,
  validTaggedUsers,
} from '../../shared/utils/Helpers';

import XIcon from '../../svgs/XIcon';
import PostIcon from '../../svgs/PostIcon';
import {userProfile} from '../../shared/models/UserProfile';
import debounce from 'lodash.debounce';
import {
  logEventCreatePost,
  logFeedCreatePost,
} from '../../shared/models/Analytics';
import TagUserInline from './TagUserInline';
import PostImage from './PostImage';
import ShareWorkoutCard from '../challenge_components/ShareWorkoutCard';

const DEBOUNCE_MS = 500;

export default class CreatePost extends React.Component {
  constructor(props) {
    super(props);
    this.type = this.props.type;
    this.id = this.props.id;
    this.posterId = userProfile.getUserProfile().id;
    this.state = {
      postText: this.props.text || '',
      image: this.props.image || null,
      isLoading: false,
      keyboardIsShowing: false,
      atLocation: null,
      searchingUsers: false,
      taggedUsers: this.props.tagged || [],
      userSearchLoading: false,
      challengeId: this.props.challengeId || 0,
      eventID: this.props.eventID || 0,
      eventName: this.props.eventName || '',
      chapterName: this.props.chapterName || '',
      eventStartTime: this.props.eventStartTime || '',
      miles: this.props.miles || '0',
      steps: this.props.steps || '0',
      hours: this.props.hours || '0',
      minutes: this.props.minutes || '0',
      seconds: this.props.seconds || '0',
    };
    this.keyboardHeight = 0;
  }

  componentDidMount() {
    this.mounted = true;
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.closeModal();
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
    this.mounted = false;
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

  closeModal() {
    this.props.onClose();
  }

  handleSelectedUser = (user) => {
    // access tagged users without mutating the array directly
    let taggedUsers = [...this.state.taggedUsers];
    let postText = this.state.postText;
    taggedUsers.push(user);
    const lastIndex = postText.lastIndexOf(`@${this.state.inputText}`);
    postText = postText.slice(0, lastIndex) + `@${user.name}`;
    this.setState({
      searchingUsers: false,
      userResults: [],
      taggedUsers,
      postText,
    });
  };

  handleTextInput = (text) => {
    // TODO: Handle backspacing early in the post while searching for users
    // TODO: Highlight color of valid user, could not find colors specific parts of text input while making it editable.
    // Once this is determined, validTaggedUsers could be modified to display valid users with the proper color
    this.setState({postText: text});
    // elastic search with value after @
    if (text.charAt(text.length - 1) === '@' && !this.state.searchingUsers) {
      this.setState({searchingUsers: true, atLocation: text.length});
    }

    if (this.state.searchingUsers) {
      // if the user deletes the "@" symbol, stop searching
      if (text.charAt(this.state.atLocation - 1) !== '@') {
        this.setState({searchingUsers: false, atLocation: null});
      } else this.searchUser(text.slice(this.state.atLocation));
    }
  };

  apiUserSearch = (text) => {
    rwbApi.searchUser(text).then((result) => {
      this.setState({userResults: result, userSearchLoading: false});
    });
  };

  updateOptions = debounce(this.apiUserSearch, DEBOUNCE_MS);

  searchUser = (text) => {
    this.setState({inputText: text, userSearchLoading: true});
    this.updateOptions(text);
  };

  submitPost() {
    this.setState({isLoading: true});
    const {
      postText,
      image,
      challengeId,
      eventID,
      eventName,
      chapterName,
      eventStartTime,
      miles,
      steps,
      hours,
      minutes,
      seconds,
    } = this.state;
    const tagged = validTaggedUsers(this.state.taggedUsers, postText);
    if (image && image != this.props.image) {
      const imageData = {
        media_filename: image.name,
        media_intent: 'post',
      };
      getBlobFromLocalURI(image.uri)
        .then((blob) => {
          rwbApi
            .getMediaUploadURL(JSON.stringify(imageData))
            .then((result) => {
              const url = result.data;
              rwbApi
                .putMediaUpload(url, blob)
                .then(() => {
                  const post_photo_url = url.split('?')[0];
                  const data = {
                    media_url: post_photo_url,
                    text: postText,
                    tagged: tagged,
                  };
                  if (this.props.streamID) this.updateFeed(data);
                  else this.putFeed(data);
                })
                .catch((error) => {
                  // Unable to upload the file to Azure
                  console.warn('error: ', error);
                  this.setState({isLoading: false});
                  Alert.alert(
                    'Team RWB',
                    'Unable to upload image to RWB Servers.',
                  );
                });
            })
            .catch((error) => {
              this.setState({isLoading: false});
              // Unable to retrieve the upload URL
              Alert.alert('Team RWB', 'Unable to upload image to RWB Servers.');
            });
        })
        .catch((error) => {
          this.setState({isLoading: false});
          Alert.alert('Team RWB', 'Unable to upload image to RWB Servers.');
        });
    } else if (postText) {
      let data = {
        text: postText,
        tagged: tagged,
        media_url: image,
      };
      if (challengeId) {
        const duration = (
          parseInt(hours || 0) * 60 +
          parseInt(minutes || 0) +
          parseInt(seconds || 0) / 60
        ).toString();
        const workout = {
          event_id: parseInt(eventID),
          event_name: eventName,
          chapter_name: chapterName,
          event_start_time: eventStartTime,
          miles: miles,
          steps: steps,
          minutes: duration,
        };
        data.workout = workout;
      }
      if (this.props.streamID) this.updateFeed(data);
      else this.putFeed(data);
    } else {
      Alert.alert('Team RWB', 'Unable to upload an empty post!');
      this.setState({isLoading: false});
      return;
    }
  }

  handlePostMade = () => {
    // retrieving the feed after so the post is in existence and can be reacted to
    // (small delay to ensure stream gets the post)
    setTimeout(() => {
      return rwbApi.getUserFeed(this.posterId).then(() => {
        // true is for updating a post
        this.props.onClose(true);
        if (this.props.refreshFeed) this.props.refreshFeed();
      });
    }, 100);
  };

  putFeed = (data) => {
    if (this.type === 'user') {
      return rwbApi
        .putFeed(JSON.stringify(data))
        .then((result) => {
          logFeedCreatePost();
          this.handlePostMade();
        })
        .catch((error) => {
          console.warn('Create Post Error: ', error);
          Alert.alert('Team RWB', 'Unable to upload post to RWB Servers.');
        })
        .finally(() => {
          if (this.mounted) this.setState({isLoading: false});
        });
    } else if (this.type === 'event') {
      return rwbApi
        .createEventPost(JSON.stringify(data), this.id)
        .then((result) => {
          logEventCreatePost();
          this.handlePostMade();
        })
        .catch((error) => {
          console.warn('Create Post Error: ', error);
          Alert.alert('Team RWB', 'Unable to upload post to RWB Servers.');
        })
        .finally(() => {
          if (this.mounted) this.setState({isLoading: false});
        });
    } else if (this.type === 'group') {
      return rwbApi
        .createGroupPost(JSON.stringify(data), this.id)
        .then((result) => {
          this.handlePostMade();
        })
        .catch(() => {
          // figure out error message
        })
        .finally(() => {
          if (this.mounted) this.setState({isLoading: false});
        });
    } else if (this.type === 'challenge') {
      return rwbApi
        .createChallengePost(JSON.stringify(data), this.id)
        .then((result) => {
          this.handlePostMade();
        })
        .catch((error) => {
          console.warn('Create Post Error: ', error);
          Alert.alert('Team RWB', 'Unable to upload post to RWB Servers.');
        })
        .finally(() => {
          if (this.mounted) this.setState({isLoading: false});
        });
    }
  };

  updateFeed = (data) => {
    return rwbApi
      .updatePost(JSON.stringify(data), this.props.streamID)
      .then((result) => {
        this.handlePostMade();
        // update for the specific post view when on PostView by reloading it
        if (this.props.updatePost) this.props.updatePost();
      })
      .catch((error) => {
        this.setState({isLoading: false});
        alert('Unable to update post to RWB Servers.');
      });
  };

  render() {
    const {
      postText,
      image,
      challengeId,
      eventID,
      eventName,
      chapterName,
      eventStartTime,
      miles,
      steps,
      hours,
      minutes,
      seconds,
    } = this.state;
    return (
      <View style={{flex: 1}}>
        {this.state.isLoading && (
          <View style={globalStyles.spinnerOverLay}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle="light-content"
            animated={true}
            translucent={false}
            backgroundColor={RWBColors.magenta}
          />
          <View style={styles.header}>
            <TouchableOpacity
              style={{padding: 5}}
              onPress={() => this.closeModal()}>
              <XIcon
                tintColor={RWBColors.white}
                style={globalStyles.headerIcon}
              />
            </TouchableOpacity>
            <Text style={[globalStyles.title, {top: 3}]}>Post</Text>
            <TouchableOpacity
              style={{padding: 5}}
              onPress={() => this.submitPost()}>
              <PostIcon
                color={RWBColors.white}
                style={globalStyles.headerIcon}
              />
            </TouchableOpacity>
          </View>
          <KeyboardAwareScrollView
            style={styles.post}
            keyboardShouldPersistTaps={'always'}
            contentContainerStyle={{
              justifyContent: 'flex-start',
              paddingBottom: 20,
            }}>
            {eventName ? (
              <View style={styles.detailBlock}>
                <ShareWorkoutCard
                  eventName={eventName}
                  chapterName={chapterName}
                  eventStartTime={eventStartTime}
                  miles={miles}
                  steps={steps}
                  hours={hours}
                  minutes={minutes}
                  seconds={seconds}
                />
              </View>
            ) : null}
            <TextInput
              onChangeText={(text) => this.handleTextInput(text)}
              value={postText}
              placeholder={'Write a post'}
              autoFocus={false}
              multiline={true}
              scrollEnabled={false}
              blurOnSubmit={true}
              returnKeyType={'go'}
              style={[
                globalStyles.formInput,
                {paddingTop: 20, paddingBottom: 20},
              ]}
              contextMenuHidden={false} // when set to true unable to paste, highlight, etc
            />

            <TagUserInline
              searchingUsers={this.state.searchingUsers}
              userSearchLoading={this.state.userSearchLoading}
              userResults={this.state.userResults}
              handleSelectedUser={this.handleSelectedUser}
            />

            {!image ? null : (
              <View>
                <TouchableOpacity
                  style={globalStyles.removeImage}
                  onPress={() => this.setState({image: null})}>
                  <XIcon
                    tintColor={RWBColors.white}
                    style={globalStyles.removeImageX}
                  />
                </TouchableOpacity>
                <PostImage
                  source={image?.uri || image}
                  alt="Cover Image for Post"
                  customStyles={{alignSelf: 'center', width: '90%'}}
                />
              </View>
            )}
          </KeyboardAwareScrollView>
          {/* only grant the ability to add a picture if an event card is not passed into the post */}
          {eventID ? null : (
            <View
              style={[
                globalStyles.aboveKeyboard,
                {
                  bottom: this.keyboardHeight,
                  position: this.state.keyboardIsShowing
                    ? 'absolute'
                    : 'relative',
                },
              ]}>
              <PhotoController
                type={'gallery'}
                handlePhoto={(photo) => this.setState({image: photo})}
              />
              <Text style={globalStyles.titleSubheader}>ADD TO YOUR POST</Text>
              <PhotoController
                type={'camera'}
                handlePhoto={(photo) => this.setState({image: photo})}
              />
            </View>
          )}
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    backgroundColor: RWBColors.magenta,
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: RWBColors.magenta,
    padding: 20,
    alignItems: 'center',
  },
  post: {
    width: '100%',
    paddingHorizontal: '5%',
    backgroundColor: RWBColors.white,
  },
  detailBlock: {
    marginTop: 10,
  },
});
