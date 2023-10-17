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
  Alert,
  ActivityIndicator,
  Keyboard,
  Image,
  Modal,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import globalStyles, {RWBColors} from '../styles';

import XIcon from '../../svgs/XIcon';
import PostIcon from '../../svgs/PostIcon';
import {
  formatPostTitle,
  howLongAgo,
  isNullOrEmpty,
  validTaggedUsers,
} from '../../shared/utils/Helpers';
import NavigationService from '../models/NavigationService';
import FocusedPicture from '../design_components/FocusedPictureView';
import {rwbApi} from '../../shared/apis/api';
import LikeIcon from '../../svgs/LikeIcon';
import debounce from 'lodash.debounce';
import TagUserInline from './TagUserInline';
import FormattedPostText from '../design_components/FormattedPostText';
import {userProfile} from '../../shared/models/UserProfile';
import PostImage from './PostImage';
import ShareWorkoutCard from '../challenge_components/ShareWorkoutCard';

const DEBOUNCE_MS = 500;

const THREE_LINE_LENGTH = 500; //this is a modified number of the character length of three lines on an iPhone X
const CUT_TEXT_AMOUNT = 80;

export default class CreatePost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commentText: this.props.commentID ? this.props.postText : '',
      cutoffText: '', //this is what is removed when the length gets too long
      loading: false,
      imageFocused: false,
      taggedUsers: this.props.tagged || [],
      keyboardIsShowing: false,
      atLocation: null,
      searchingUsers: false,
      userSearchLoading: false,
      modifyingCuttofText: false, // used to prevent deleting more text when holding down back button
      lastButtonBackspace: false,
    };
    this.keyboardHeight = 0;
    this.selectionLocation = 0;
  }

  componentDidMount() {
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
    this.showFullComment();
    this.forceUpdate();
  };

  closeModal() {
    this.props.close();
  }

  apiUserSearch = (text) => {
    rwbApi.searchUser(text).then((result) => {
      this.setState({userResults: result, userSearchLoading: false});
    });
  };

  handleSelectedUser = (user) => {
    // access tagged users without mutating the array directly
    let taggedUsers = [...this.state.taggedUsers];
    let commentText = this.state.commentText;
    taggedUsers.push(user);
    const lastIndex = commentText.lastIndexOf(`@${this.state.inputText}`);
    commentText = commentText.slice(0, lastIndex) + `@${user.name}`;
    this.setState({
      searchingUsers: false,
      userResults: [],
      taggedUsers,
      commentText,
    });
  };

  handleTextInput = (text) => {
    // TODO: Handle backspacing early in the post while searching for users
    // TODO: Highlight color of valid user, could not find colors specific parts of text input while making it editable.
    // Once this is determined, validTaggedUsers could be modified to display valid users with the proper color)
    this.setState({commentText: text});
    const forceUpdateText =
      text.length === 0 &&
      this.state.cutoffText.length > 0 &&
      !this.state.modifyingCuttofText;
    this.formatDisplayableText(forceUpdateText ? this.state.cutoffText : text);
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

  updateOptions = debounce(this.apiUserSearch, DEBOUNCE_MS);

  searchUser = (text) => {
    this.setState({inputText: text, userSearchLoading: true});
    this.updateOptions(text);
  };

  formatDisplayableText = (inputText) => {
    // truncate the text
    if (this.state.modifyingCuttofText) return;
    if (inputText.length > THREE_LINE_LENGTH) {
      const {cutoffText} = this.state;
      let addedCutoffText = '';
      let newCutoffText = '';
      // if the user pasted
      if (
        this.state.commentText.length === 0 &&
        inputText.length > THREE_LINE_LENGTH
      ) {
        addedCutoffText = inputText.slice(
          0,
          inputText.length - CUT_TEXT_AMOUNT,
        );
        newCutoffText = `${cutoffText}${addedCutoffText}`;
      } else {
        if (!this.state.lastButtonBackspace) {
          // avoid adding elipses
          addedCutoffText = cutoffText
            ? inputText.slice(3, CUT_TEXT_AMOUNT)
            : inputText.slice(0, CUT_TEXT_AMOUNT);
          newCutoffText = `${cutoffText}${addedCutoffText}`;
        } else {
          newCutoffText = inputText.slice(0, CUT_TEXT_AMOUNT * -1);
        }
      }
      this.setState(
        {
          cutoffText: newCutoffText,
          commentText: `...${inputText.slice(CUT_TEXT_AMOUNT * -1)}`,
          modifyingCuttofText: true,
        },
        () => {
          this.setState({modifyingCuttofText: false});
        },
      );
    } else if (
      inputText.length + this.state.cutoffText.length < THREE_LINE_LENGTH &&
      this.state.cutoffText
    ) {
      if (this.state.cutoffText.includes(inputText)) {
        // if the cutofftext is or has the remaining text after a lot of deletion, replace the comment text with the cuttoff text and empty the cutoff text
        this.setState({
          commentText: this.state.cutoffText,
          cutoffText: '',
        });
      } else this.showFullComment();
    } else if (this.state.cutoffText && this.state.commentText.length < 1) {
      this.setState(
        {
          modifyingCuttofText: true,
          commentText: `...${this.state.cutoffText.slice(
            CUT_TEXT_AMOUNT * -1,
          )}${inputText.slice(3, inputText.length)}`,
          cutoffText: this.state.cutoffText.slice(
            0,
            this.state.cutoffText.length - CUT_TEXT_AMOUNT,
          ),
        },
        () => {
          this.setState({modifyingCuttofText: false});
        },
      );
    }
  };

  // this handles whenever the selector changes (click or input change)
  // it also happens before input, so the changes get overwritten by handleTextInput if we try to make changes when the user types
  handleSelectionChange = (event) => {
    // if the cursor is at the start or moved to the start/elipses location on truncation, show everything
    if (
      event.selection.start <= 4 &&
      this.state.commentText.length > 4 &&
      this.state.cutoffText.length <= THREE_LINE_LENGTH
    ) {
      this.showFullComment();
    }
  };

  showFullComment = () => {
    // javascript string replace replaces the first value found, and the elipses when shrinking content will always be what is replaced
    const hasEllipses = this.state.commentText.slice(0, 3) === '...';
    this.setState({
      commentText: hasEllipses
        ? this.state.commentText.replace('...', this.state.cutoffText)
        : this.state.cutoffText
        ? this.state.cutoffText
        : this.state.commentText,
    });
  };

  submitComment() {
    if (isNullOrEmpty(this.state.commentText)) {
      Alert.alert('Team RWB', 'Unable to post an empty comment.');
      return;
    }
    Keyboard.dismiss();
    this.setState({loading: true});
    const taggedIDs = validTaggedUsers(
      this.state.taggedUsers,
      this.state.commentText,
    );
    const data = {
      kind: 'comment',
      content: this.state.commentText.replace('...', this.state.cutoffText), // despite hiding the keyboard, the combined text is not retrieved, so ensure we get the combined text here
      tagged: taggedIDs,
    };
    if (this.props.commentID) {
      rwbApi
        .updateReaction(
          this.props.poster.id,
          this.props.streamID,
          JSON.stringify(data),
          this.props.commentID,
        )
        .then((result) => {
          this.setState({loading: false});
          let reactionObj = result.reaction;
          const commenter = userProfile.getUserProfile();
          reactionObj.user = {
            first_name: commenter.first_name,
            last_name: commenter.last_name,
            id: commenter.id,
            profile_photo_url: commenter.profile_photo_url,
            edited: true,
          };
          reactionObj.tagged = this.state.taggedUsers;
          this.props.close(reactionObj);
        })
        .catch((err) => {
          this.setState({loading: false});
          Alert.alert(
            'Team RWB',
            'Unable to update your comment. Please try again later.',
          );
        });
    } else {
      rwbApi
        .postReaction(
          this.props.poster.id,
          this.props.streamID,
          JSON.stringify(data),
        )
        .then((result) => {
          this.setState({loading: false});
          let reactionObj = result.reaction;
          const commenter = userProfile.getUserProfile();
          reactionObj.user = {
            first_name: commenter.first_name,
            last_name: commenter.last_name,
            id: commenter.id,
            profile_photo_url: commenter.profile_photo_url,
          };
          reactionObj.tagged = this.state.taggedUsers;
          this.props.close(reactionObj);
        })
        .catch((err) => {
          this.setState({loading: false});
          Alert.alert(
            'Team RWB',
            'Unable to post your comment. Please try again later.',
          );
        });
    }
  }

  render() {
    const {commentText} = this.state;

    const {poster, postText} = this.props;

    return (
      <View style={{flex: 1}}>
        <SafeAreaView style={{flex: 0, backgroundColor: RWBColors.magenta}} />
        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle="light-content"
            animated={true}
            translucent={false}
            backgroundColor={RWBColors.magenta}
          />
          {this.state.loading ? (
            <View
              style={[
                globalStyles.centeredActivityIndicator,
                {
                  backgroundColor: RWBColors.white,
                  marginTop:
                    Platform.OS === 'android' ? StatusBar.currentHeight : 25,
                },
              ]}>
              <ActivityIndicator animating size="large" />
            </View>
          ) : null}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => this.closeModal()}>
              <XIcon
                tintColor={RWBColors.white}
                style={globalStyles.headerIcon}
              />
            </TouchableOpacity>
            <Text style={[globalStyles.title, {top: 3}]}>Comment</Text>
            <TouchableOpacity onPress={() => this.submitComment()}>
              <PostIcon
                color={RWBColors.white}
                style={globalStyles.headerIcon}
              />
            </TouchableOpacity>
          </View>
          <KeyboardAwareScrollView
            style={{width: '100%', marginBottom: -30}}
            keyboardShouldPersistTaps={'always'}>
            <View style={styles.post}>
              <View style={styles.postHeader}>
                <Text style={globalStyles.bodyCopyForm}>
                  <Text
                    style={globalStyles.h3}
                    onPress={() =>
                      NavigationService.navigateIntoInfiniteStack(
                        'FeedProfileAndEventDetailsStack',
                        'profile',
                        {id: this.props.poster.id},
                      )
                    }>
                    {`${this.props.poster.first_name} ${this.props.poster.last_name}`}{' '}
                  </Text>
                  {formatPostTitle(this.props.title, this.props.verb)}{' '}
                  {this.props.eventName ? (
                    <Text
                      onPress={() =>
                        NavigationService.navigateIntoInfiniteStack(
                          'EventsProfileAndEventDetailsStack',
                          'event',
                          {id: this.props.eventID},
                        )
                      }
                      accessibilityRole={'button'}
                      accessible={true}
                      accessibilityLabel={`Visit event ${this.props.eventName} profile`}
                      style={globalStyles.h3}>
                      {`${this.props.eventName}`}{' '}
                    </Text>
                  ) : (
                    <Text>{this.props.eventName}</Text>
                  )}
                  {/* todo: missing group support */}
                  <Text style={{fontWeight: 'bold'}}> &middot;</Text>{' '}
                  {howLongAgo(this.props.posterTime || this.props.time) || null}
                </Text>
              </View>
              {this.props?.workout?.eventName ? (
                <View style={styles.shareWorkoutCardContainer}>
                  <ShareWorkoutCard
                    eventName={this.props.workout.eventName}
                    chapterName={this.props.workout.chapterName}
                    eventStartTime={this.props.workout.eventStartTime}
                    miles={this.props.workout.miles}
                    steps={this.props.workout.steps}
                    hours={this.props.workout.hours}
                    minutes={this.props.workout.minutes}
                    seconds={this.props.workout.seconds}
                  />
                </View>
              ) : null}
              <Text style={styles.postText}>
                <FormattedPostText
                  text={this.props.posterText || postText}
                  linkableUsers={true}
                  tagged={this.props.tagged}
                />
              </Text>

              <View style={styles.imageContainer}>
                {this.props.postImage ? (
                  <TouchableOpacity
                    style={{marginTop: 20}}
                    onPress={() => this.setState({imageFocused: true})}>
                    <PostImage
                      source={this.props.postImage}
                      alt="User's post photo"
                    />
                  </TouchableOpacity>
                ) : null}
                <View
                  style={{
                    marginTop: 10,
                    flexDirection: 'row',
                  }}>
                  <TouchableOpacity
                    accessibilityRole={'button'}
                    accessible={true}
                    accessibilityLabel={`Like this post`}
                    onPress={() => this.props.handleLike()}
                    style={{height: 20, width: 20, flexDirection: 'row'}}>
                    <LikeIcon
                      tintColor={this.props.liked ? RWBColors.magenta : null}
                      style={{height: 16, width: 16, marginRight: 5}}
                    />
                    <Text style={globalStyles.bodyCopyForm}>
                      {this.props.likeAmount || ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.comment}>
              <TextInput
                onChangeText={(text) => this.handleTextInput(text)}
                onKeyPress={({nativeEvent: {key: keyValue}}) =>
                  this.setState({lastButtonBackspace: keyValue === 'Backspace'})
                }
                value={commentText}
                placeholder={'Your comment'}
                autoFocus={true}
                multiline={true}
                blurOnSubmit={true}
                returnKeyType={'go'}
                style={[
                  globalStyles.formInput,
                  {paddingTop: 20, paddingBottom: 20},
                ]}
                onSelectionChange={({nativeEvent}) =>
                  this.handleSelectionChange(nativeEvent)
                }
              />
              <TagUserInline
                searchingUsers={this.state.searchingUsers}
                userSearchLoading={this.state.userSearchLoading}
                userResults={this.state.userResults}
                handleSelectedUser={this.handleSelectedUser}
              />
            </View>
            <Modal visible={this.state.imageFocused} animationType="fade">
              <FocusedPicture
                onClose={() => this.setState({imageFocused: false})}
                image={this.props.postImage}
                likeAmount={this.props.likeAmount}
                liked={this.props.liked}
                likePressed={this.props.handleLike}
              />
            </Modal>
          </KeyboardAwareScrollView>
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
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: RWBColors.magenta,
    paddingVertical: 20,
    paddingHorizontal: '5%',
    alignItems: 'center',
  },
  post: {
    width: '100%',
    borderBottomColor: RWBColors.grey20,
    borderBottomWidth: 1,
  },
  postHeader: {
    paddingHorizontal: '5%',
    marginVertical: 20,
    flexDirection: 'row',
  },
  postText: {
    paddingHorizontal: '5%',
  },
  imageContainer: {
    paddingHorizontal: '5%',
    marginBottom: 20,
  },
  comment: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: '5%',
  },
  shareWorkoutCardContainer: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
    marginTop: -10,
  },
});
