import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActionSheetIOS,
  Alert,
  Modal,
} from 'react-native';
import {rwbApi} from '../../shared/apis/api';
import {userProfile} from '../../shared/models/UserProfile';
import AndroidAction from './AndroidActionSheet';
import RWBSheetButton from './RWBSheetButton';
import PostOptionIcon from '../../svgs/PostOptionIcon';
import {capitalizeFirstLetter} from '../../shared/utils/Helpers';
import {REPORT_ERROR} from '../../shared/constants/ErrorMessages';
import CreatePost from '../post_components/CreatePostView';
import PostCommentView from '../post_components/PostCommentView';

export default class ReportAndDeleteModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      actionSheetVisible: false,
      editPostVisible: false,
    };
  }

  reportSent = () => {
    Alert.alert('Team RWB', 'Your report has been sent', [
      {
        text: 'Ok',
      },
    ]);
  };

  reportError = () => {
    Alert.alert('Team RWB', REPORT_ERROR);
  };

  // determines which type of report is being done
  report = () => {
    const reporterID = JSON.stringify({
      reporter: userProfile.getUserProfile().id,
    });
    Alert.alert(
      'Team RWB',
      `Would you like to report this ${this.props.type}?`,
      [
        {
          text: 'No',
          style: 'destructive',
        },
        {
          text: 'Yes',
          onPress: () => {
            this.setState({actionSheetVisible: false});
            if (this.props.type === 'post') {
              if (this.props.eventID) this.reportEventPost(reporterID);
              else if (this.props.groupID) this.reportGroupPost(reporterID);
              else if (this.props.posterID) this.reportUserPost(reporterID);
            } else if (this.props.type === 'comment')
              this.reportCommentPost(reporterID);
            else {
              throw new Error(
                "Invalid Type, expecting the type 'post' or 'comment",
              );
            }
          },
        },
      ],
    );
  };

  reportUserPost = (reporterID) => {
    rwbApi
      .reportUserPost(this.props.posterID, this.props.streamID, reporterID)
      .then(this.reportSent)
      .catch((err) => {
        this.reportError();
        console.warn(err);
      });
  };

  reportEventPost = (reporterID) => {
    rwbApi
      .reportEventPost(this.props.eventID, this.props.streamID, reporterID)
      .then(this.reportSent)
      .catch((err) => {
        this.reportError();
        console.warn(err);
      });
  };

  reportCommentPost = (reporterID) => {
    rwbApi
      .reportUserComment(this.props.posterID, this.props.commentID, reporterID)
      .then(this.reportSent)
      .catch((err) => {
        this.reportError();
        console.warn(err);
      });
  };

  reportGroupPost = (reporterID) => {
    rwbApi
      .reportGroupPost(this.props.posterID, this.props.groupID, reporterID)
      .then(this.reportSent)
      .catch((err) => {
        this.reportError();
        console.warn(err);
      });
  };

  editPost = () => {
    this.setState({
      actionSheetVisible: false,
      editPostVisible: true,
    });
  };

  closeComment = (commentObj) => {
    // update instead of add
    this.props.close(commentObj, this.props.index);
    this.setState({editPostVisible: false});
  };

  render() {
    return (
      <View>
        {!this.props.eventStatusPost ? (
          <TouchableOpacity
            onPress={() => this.setState({actionSheetVisible: true})}
            accessible={true}
            accessibilityLabel={'Open Card Menu'}
            accessibilityRole={'button'}>
            <PostOptionIcon height="20" width="20" />
          </TouchableOpacity>
        ) : null}
        {
          this.state.actionSheetVisible ? (
            Platform.OS === 'ios' ? (
              ActionSheetIOS.showActionSheetWithOptions(
                {
                  // cancel, delete option (logged in user's post), and report text for specific type (user, post, event)
                  // either show deleting your own post, or show reporting the content
                  options: this.props.canDelete()
                    ? [
                        'Cancel',
                        `Edit ${capitalizeFirstLetter(this.props.type)}`,
                        `Delete ${capitalizeFirstLetter(this.props.type)}`,
                      ]
                    : this.props.type === 'post'
                    ? [
                        'Cancel',
                        `Block ${capitalizeFirstLetter(this.props.type)}`,
                        `Report ${capitalizeFirstLetter(this.props.type)}`,
                      ]
                    : [
                        'Cancel',
                        `Report ${capitalizeFirstLetter(this.props.type)}`,
                      ],
                  cancelButtonIndex: 0,
                  destructiveButtonIndex: this.props.canDelete()
                    ? 2
                    : this.props.type === 'post'
                    ? 2
                    : 1,
                },
                (buttonIndex) => {
                  if (buttonIndex === 1) {
                    this.setState({actionSheetVisible: false});
                    if (this.props.canDelete()) {
                      this.editPost();
                    } else if (this.props.type === 'post') {
                      this.props.blockPost();
                    } else {
                      // determine what should be reported
                      this.report();
                    }
                  } else if (buttonIndex === 2) {
                    this.setState({actionSheetVisible: false});
                    if (this.props.canDelete()) {
                      this.props.deletePost();
                    } else {
                      // determine what should be reported
                      this.report();
                    }
                  } else {
                    // clicking either cancel OR off the screen
                    // this prevents issues where other clickable interactions bring the overlay back up
                    this.setState({actionSheetVisible: false});
                  }
                },
              )
            ) : (
              <AndroidAction
                cancelable={true}
                hide={() => this.setState({actionSheetVisible: false})}>
                {this.props.canDelete() ? (
                  <>
                    <RWBSheetButton
                      text={`Edit ${this.props.type}`}
                      onPress={this.editPost}
                    />
                    <RWBSheetButton
                      text={`Delete ${this.props.type}`}
                      onPress={this.props.deletePost}
                    />
                  </>
                ) : (
                  <>
                    <RWBSheetButton
                      text={`Report ${this.props.type}`}
                      onPress={this.report}
                    />
                    {this.props.type === 'post' ? (
                      <RWBSheetButton
                        text={'Block post'}
                        onPress={this.props.blockPost}
                      />
                    ) : null}
                  </>
                )}
              </AndroidAction>
            )
          ) : null // not toggled
        }
        <Modal
          visible={this.state.editPostVisible}
          onRequestClose={() => this.setState({editPostVisible: false})}>
          {this.props.commentID ? (
            <PostCommentView
              poster={this.props.poster}
              eventName={this.props.eventName}
              streamID={this.props.streamID}
              title={this.props.title}
              verb={this.props.verb}
              time={this.props.time}
              liked={this.props.liked}
              likeAmount={this.props.likeAmount}
              postText={this.props.text}
              eventID={this.props.eventID}
              postImage={this.props.post_image}
              handleLike={this.props.handleLike}
              tagged={this.props.tagged}
              posterText={this.props.posterText}
              posterTagged={this.props.posterTagged}
              posterTime={this.props.posterTime}
              close={this.closeComment}
              commentID={this.props.commentID}
              groupName={this.props.groupName}
            />
          ) : (
            <CreatePost
              text={this.props.text}
              image={this.props.image}
              type={this.props.type} // todo check formerly hardcoded group
              onClose={() => this.setState({editPostVisible: false})}
              streamID={this.props.streamID} // create post expects id to be either event id or group id
              tagged={this.props.tagged}
              refreshFeed={this.props.refreshFeed}
              updatePost={this.props.updatePost}
              eventName={this.props.workout?.event_name}
              chapterName={this.props.workout?.chapter_name}
              eventStartTime={this.props.workout?.event_start_time}
              miles={this.props.workout?.miles}
              steps={this.props.workout?.steps}
              hours={Math.floor(this.props.workout?.hours)}
              minutes={Math.floor(this.props.workout?.minutes)}
              seconds={Math.round(this.props.workout?.seconds)}
            />
          )}
        </Modal>
      </View>
    );
  }
}
