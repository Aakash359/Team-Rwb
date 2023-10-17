import React from 'react';
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  View,
  Dimensions,
  Share,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import FocusedPicture from '../design_components/FocusedPictureView';
import PostCommentView from './PostCommentView';
import CommentCard from '../design_components/CommentCard';
import ShareWorkoutCard from '../challenge_components/ShareWorkoutCard';

import globalStyles, {RWBColors} from '../styles';
import NavigationService from '../models/NavigationService';

import ChevronBack from '../../svgs/ChevronBack';
import LikeIcon from '../../svgs/LikeIcon';
import {howLongAgo, formatPostTitle} from '../../shared/utils/Helpers';
import ShareIcon from '../../svgs/ShareIcon';
import {rwbApi} from '../../shared/apis/api';
import FormattedPostText from '../design_components/FormattedPostText';
import ReportAndDeleteModal from '../design_components/ReportAndDeleteModal';
import {userProfile} from '../../shared/models/UserProfile';
import {logNotificationsLike} from '../../shared/models/Analytics';
import PostImage from './PostImage';
import {
  POST_BLOCK_ERROR,
  POST_DELETE_ERROR,
} from '../../shared/constants/ErrorMessages';
import {
  POST_BLOCK_WARNING,
  POST_DELETE_WARNING,
} from '../../shared/constants/OtherMessages';

export default class PostView extends React.Component {
  constructor(props) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
    this.title = this.props.navigation.getParam('title', null);
    this.poster = this.props.navigation.getParam('poster', null);
    this.group = this.props.navigation.getParam('group', null);
    this.eventID = this.props.navigation.getParam('eventID', null);
    this.groupID = this.props.navigation.getParam('groupID', null);
    this.streamID = this.props.navigation.getParam('streamID', null);
    this.postID = this.props.navigation.getParam('postID', null); // will only come from notifications
    this.eventName = this.props.navigation.getParam('eventName', null);
    this.groupName = this.props.navigation.getParam('groupName', null);
    this.previousScreen = this.props.navigation.getParam(
      'previousScreen',
      null,
    ); // used for an analytics check
    this.verb = '';
    this.state = {
      post_image: this.props.navigation.getParam('post_image', null),
      text: this.props.navigation.getParam('text', null),
      tagged: this.props.navigation.getParam('tagged', []),
      loading: true,
      imageFocused: false,
      postCommentVisible: false,
      liked: this.props.navigation.getParam('liked', false),
      refreshing: false,
      likeAmount: this.props.navigation.getParam('likeAmount', 0),
      commentAmount: this.props.navigation.getParam('commentAmount', 0),
      comments: [],
      loadingMore: false,
      edited: this.props.navigation.getParam('edited', false),
      time: this.props.navigation.getParam('time', 0),
      eventName: '',
      chapterName: '',
      eventStartTime: '',
      miles: 0,
      steps: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  componentDidMount() {
    this.initializeScreen();
  }

  initializeScreen = () => {
    if (!this.streamID) this.setState({loading: false});
    else {
      Promise.all([this.loadPost(), this.loadInitialReactions()])
        .then(([postData, reactionData]) => {
          // Ensure the poster is updated when just an ID is passed
          if (!this.poster.first_name) this.poster = postData.user;
          // If loading the specific post has a name (meaning it was an event), display it. Otherwise it was a post
          if (postData.name) this.eventName = postData.name;
          else if (postData.event && postData.event.name) {
            this.eventName = postData.event.name;
            this.verb = postData.verb;
            this.eventID = postData.event.id;
          } else if (postData.group) {
            this.groupName = postData.group.name;
            this.verb = postData.verb;
            this.groupID = postData.group.id;
          } else if (this.title !== 'posted') this.eventName = 'posted'; //prevent "posted posted" titles
          this.setState({
            edited: postData?.edited,
            post_image: postData.media_url,
            tagged: postData.tagged,
            text: postData.text,
            loading: false,
            likeAmount: reactionData.reaction_counts.like || 0, //liked will not exist in react_counts if there are no likes
            liked: reactionData.own_reactions.like,
            commentAmount: reactionData.reaction_counts.comment || 0,
            time: postData.time || 0,
          });
          if (postData.workout) {
            this.setState({
              eventName: postData.workout.event_name || '',
              chapterName: postData.workout.chapter_name || '',
              eventStartTime: postData.workout.event_start_time || '',
              miles: postData.workout.miles || 0,
              steps: postData.workout.steps || 0,
              hours: Math.floor(postData.workout.minutes / 60) || 0,
              minutes: Math.floor(postData.workout.minutes % 60) || 0,
              seconds: Math.round((postData.workout.minutes % 1) * 60) || 0,
            });
          }
        })
        .catch((err) => {
          this.setState({loading: false});
          Alert.alert('Team RWB', 'Error retrieving post. Post not found.');
          NavigationService.back();
        });
    }
  };

  loadPost = () => {
    return new Promise((resolve, reject) => {
      rwbApi
        .getSpecificPost(this.poster.id, this.streamID)
        .then((result) => {
          const data = result.data.results[0];
          resolve(data);
        })
        .catch((err) => {
          console.warn(err);
          reject(err);
        });
    });
  };

  // this is supposed to be handled server side
  filterReactions = (reactions) => {
    return reactions.filter((reaction) => reaction.kind === 'comment');
  };

  closeModal() {
    this.setState({imageFocused: false});
  }

  updateLikeStatus = (action) => {
    if (action === 'like')
      this.setState({liked: true, likeAmount: this.state.likeAmount + 1});
    else if (action === 'unlike')
      this.setState({liked: false, likeAmount: this.state.likeAmount - 1});
  };

  handleLikePressed = () => {
    const reactionKind = JSON.stringify({kind: 'like'});
    if (this.eventID) this.handleEventLike(reactionKind);
    else this.handleUserLike(reactionKind);
  };

  handleUserLike = (reactionKind) => {
    if (!this.state.liked) {
      this.updateLikeStatus('like');
      rwbApi
        .postReaction(this.poster.id, this.streamID, reactionKind)
        .then(() => {
          if (this.previousScreen === 'notifications') logNotificationsLike();
        })
        .catch((err) => {
          console.warn(err);
          Alert.alert('Team RWB', 'Error liking post. Please try again later.');
          this.updateLikeStatus('unlike');
        });
    } else {
      this.updateLikeStatus('unlike');
      rwbApi
        .deleteReaction(this.poster.id, this.streamID, reactionKind)
        .then(() => {})
        .catch((err) => {
          this.updateLikeStatus('like');
          console.warn(err);
          Alert.alert(
            'Team RWB',
            'Error unliking post. Please try again later.',
          );
        });
    }
  };

  handleEventLike = (reactionKind) => {
    if (!this.state.liked) {
      this.updateLikeStatus('like');
      rwbApi
        .postEventReaction(this.eventID, this.streamID, reactionKind)
        .then(() => {
          if (this.previousScreen === 'notifications') logNotificationsLike();
        })
        .catch((err) => {
          console.warn(err);
          Alert.alert('Team RWB', 'Error liking post. Please try again later.');
          this.updateLikeStatus('unlike');
        });
    } else {
      this.updateLikeStatus('unlike');
      rwbApi
        .deleteEventReaction(this.eventID, this.streamID, reactionKind)
        .then(() => {})
        .catch((err) => {
          this.updateLikeStatus('like');
          console.warn(err);
          Alert.alert(
            'Team RWB',
            'Error unliking post. Please try again later.',
          );
        });
    }
  };

  loadMoreComments = () => {
    if (this.state.loadingMoreComments) return;
    this.setState({loadingMoreComments: true});
    const oldestCommentID = this.state.comments[0].id;
    rwbApi
      .getReactions(this.poster.id, this.streamID, oldestCommentID, 'comment')
      .then((result) => {
        let newComments = this.filterReactions(result.data.reactions);
        this.setState({comments: [...newComments, ...this.state.comments]});
        this.setState({loadingMoreComments: false});
      })
      .catch((err) => {
        this.setState({loadingMoreComments: false});
        Alert.alert(
          'Team RWB',
          'Error loading more comments. Try again later.',
        );
      });
  };

  loadInitialReactions = () => {
    return new Promise((resolve, reject) => {
      rwbApi
        .getReactions(this.poster.id, this.streamID, null, 'comment')
        .then((result) => {
          // TODO, Remove when Stefan adds his changes
          let comments = this.filterReactions(result.data.reactions);
          this.setState({comments});
          resolve(result.data);
        })
        .catch((err) => {
          console.warn(err);
          reject(err);
        });
    });
  };

  // Refresh how many comments/likes on the post
  refreshReactions = () => {
    this.setState({refreshing: true, comments: []});
    this.loadInitialReactions()
      .then(() => {
        this.setState({refreshing: false});
      })
      .catch((err) => {
        Alert.alert(
          'Team RWB',
          'Error refreshing post. Please try again later',
        );
        this.setState({refreshing: false});
      });
  };

  sharePost = () => {
    return; //placed here to avoid an app error until info is provided later
    Share.share(
      {
        // message: Platform.OS === 'android' ? eventLink : name,
        // title: "Share This Event",
        // url: eventLink,
      },
      {
        // dialogTitle: "Share This Event" //might be post instead of event?
      },
    );
  };

  canDelete = () => {
    return userProfile.getUserProfile().id === this.poster.id;
  };

  deletePost = () => {
    const serverDelete = () => {
      if (!this.eventID) {
        this.setState({loading: true});
        rwbApi
          .deleteUserPost(this.streamID)
          .then(() => {
            NavigationService.back();
          })
          .catch((err) => {
            console.warn(err);
            Alert.alert('Team RWB', POST_DELETE_ERROR);
          })
          .finally(() => {
            this.setState({loading: false});
          });
      } else {
        this.setState({loading: true});
        rwbApi
          .deleteEventPost(this.eventID, this.streamID)
          .then(() => {
            NavigationService.back();
          })
          .catch((err) => {
            console.warn(err);
            Alert.alert('Team RWB', POST_DELETE_ERROR);
          })
          .finally(() => {
            this.setState({loading: false});
          });
      }
    };

    Alert.alert('Delete Post', POST_DELETE_WARNING, [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => null,
      },
      {
        text: 'Yes',
        onPress: () => serverDelete(),
      },
    ]);
  };

  blockPost = () => {
    const serverBlock = () => {
      this.setState({loading: true});
      rwbApi
        .blockPost(this.streamID)
        .then(() => {
          NavigationService.back();
        })
        .catch((err) => {
          console.warn(err);
          Alert.alert('Team RWB', POST_BLOCK_ERROR);
        })
        .finally(() => {
          this.setState({loading: false});
        });
    };

    Alert.alert('Block Post', POST_BLOCK_WARNING, [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => null,
      },
      {
        text: 'Yes',
        onPress: () => serverBlock(),
      },
    ]);
  };

  // if updated is passed, that means a comment is being modified instead of appended
  handleClosePostComment = (comment, position = null) => {
    this.setState({postCommentVisible: false});
    // if the user just made a comment add it to the bottom and update the count
    if (comment?.kind === 'comment' && position === null) {
      this.setState({
        comments: [...this.state.comments, comment],
        commentAmount: this.state.commentAmount + 1,
      });
    } else if (comment?.kind === 'comment') {
      let c = this.state.comments;
      c[position] = comment;
      this.setState({comments: c});
    }
  };

  handleCommentDeletion = () => {
    this.setState({commentAmount: this.state.commentAmount - 1});
  };

  handlePostUpdate = () => {
    this.initializeScreen();
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {this.state.loading ? (
          <View
            style={[
              globalStyles.centeredActivityIndicator,
              {
                backgroundColor: RWBColors.white,
                marginTop:
                  Platform.OS === 'android' ? StatusBar.currentHeight : 50,
              },
            ]}>
            <ActivityIndicator animating size="large" />
          </View>
        ) : (
          <View style={{width: '100%'}}>
            <FlatList
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: RWBColors.white,
              }}
              keyExtractor={(item, index) => {
                return `${item.id}`;
              }}
              //adding padding to the bottom to cover the height of the input (add comment) container
              contentContainerStyle={{paddingBottom: 65}}
              data={this.state.comments}
              ListHeaderComponent={
                <View>
                  {/* Header */}
                  <View style={styles.headerContainer}>
                    <TouchableOpacity
                      style={{padding: 5}}
                      onPress={() => NavigationService.back()}>
                      <ChevronBack
                        tintColor={RWBColors.magenta}
                        style={globalStyles.chevronBackImage}
                      />
                    </TouchableOpacity>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Image
                        style={[
                          globalStyles.mediumProfileImage,
                          {marginHorizontal: 10},
                        ]}
                        source={
                          this.poster.profile_photo_url
                            ? {uri: this.poster.profile_photo_url}
                            : require('../../shared/images/DefaultProfileImg.png')
                        }
                      />
                      <View style={{flexShrink: 1, flexDirection: 'row'}}>
                        <Text style={globalStyles.bodyCopyForm}>
                          <Text
                            onPress={() =>
                              NavigationService.navigateIntoInfiniteStack(
                                'FeedProfileAndEventDetailsStack',
                                'profile',
                                {id: this.poster.id},
                              )
                            }
                            accessibilityRole={'button'}
                            accessible={true}
                            accessibilityLabel={`Visit user ${this.poster.first_name} ${this.poster.last_name}'s profile`}
                            style={globalStyles.h3}>
                            {`${this.poster.first_name} ${this.poster.last_name}`}{' '}
                          </Text>
                          {formatPostTitle(this.title, this.verb)}{' '}
                          {this.eventName && this.eventName !== 'posted' ? (
                            <Text
                              onPress={() =>
                                NavigationService.navigateIntoInfiniteStack(
                                  'EventsProfileAndEventDetailsStack',
                                  'event',
                                  {id: this.eventID},
                                )
                              }
                              accessibilityRole={'button'}
                              accessible={true}
                              accessibilityLabel={`Visit event ${this.eventName}`}
                              style={globalStyles.h3}>
                              {`${this.eventName}`}{' '}
                            </Text>
                          ) : this.groupName ? (
                            // improve upon this. group infinite stack doesn't have group view, just has profile and event stack
                            // making group view not accessible. Nav stack in general needs improvement with groups
                            <Text
                              onPress={() =>
                                NavigationService.navigate('GroupView', {
                                  group_id: this.groupID,
                                })
                              }
                              accessibilityRole={'button'}
                              accessible={true}
                              accessibilityLabel={`Visit group ${this.groupName}`}
                              style={globalStyles.h3}>
                              {`${this.groupName}`}{' '}
                            </Text>
                          ) : (
                            <Text>{this.eventName}</Text>
                          )}
                          <Text style={{fontWeight: 'bold'}}> &middot;</Text>
                          <Text style={globalStyles.bodyCopyForm}>
                            {' '}
                            {howLongAgo(this.state.time) || null}
                            {this.state.edited && (
                              <Text
                                style={{
                                  color: RWBColors.grey20,
                                  fontStyle: 'italic',
                                }}>
                                {' '}
                                Edited
                              </Text>
                            )}
                          </Text>
                        </Text>
                      </View>
                    </View>
                    <View style={{alignSelf: 'flex-start'}}>
                      <ReportAndDeleteModal
                        type="post"
                        canDelete={this.canDelete}
                        deletePost={this.deletePost}
                        blockPost={this.blockPost}
                        streamID={this.streamID}
                        posterID={this.poster.id}
                        text={this.state.text}
                        image={this.state.post_image}
                        tagged={this.state.tagged}
                        eventStatusPost={false} // posts details can never be status updates
                        updatePost={this.handlePostUpdate}
                        refreshFeed={this.props.navigation.getParam(
                          'refreshFeed',
                          null,
                        )}
                        workout={{
                          event_name: this.state.eventName,
                          chapter_name: this.state.chapterName,
                          event_start_time: this.state.eventStartTime,
                          miles: this.state.miles,
                          steps: this.state.steps,
                          hours: this.state.hours,
                          minutes: this.state.minutes,
                          seconds: this.state.seconds,
                        }}
                      />
                    </View>
                  </View>
                  {/* Post content (text, photo, reactions) */}
                  <View
                    style={{
                      paddingHorizontal: '5%',
                      backgroundColor: RWBColors.white,
                      width: '100%',
                    }}>
                    {this.state.eventName ? (
                      <ShareWorkoutCard
                        eventName={this.state.eventName}
                        chapterName={this.state.chapterName}
                        eventStartTime={this.state.eventStartTime}
                        miles={this.state.miles}
                        steps={this.state.steps}
                        hours={this.state.hours}
                        minutes={this.state.minutes}
                        seconds={this.state.seconds}
                      />
                    ) : null}
                    <View style={{paddingTop: 10}}>
                      <FormattedPostText
                        text={this.state.text}
                        tagged={this.state.tagged}
                        linkableUsers={true}
                      />
                    </View>
                    {this.state.post_image ? (
                      <TouchableOpacity
                        style={{marginTop: 20}}
                        onPress={() => this.setState({imageFocused: true})}>
                        <PostImage
                          source={this.state.post_image}
                          alt="User's post photo"
                        />
                      </TouchableOpacity>
                    ) : null}
                    <View
                      style={{
                        marginTop: 10,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingBottom: 20,
                      }}>
                      <TouchableOpacity
                        accessibilityRole={'button'}
                        accessible={true}
                        accessibilityLabel={`Like this post`}
                        onPress={() => this.handleLikePressed()}
                        style={{height: 20, width: 20, flexDirection: 'row'}}>
                        <LikeIcon
                          tintColor={
                            this.state.liked ? RWBColors.magenta : null
                          }
                          style={{height: 16, width: 16, marginRight: 5}}
                        />
                        <Text style={globalStyles.bodyCopyForm}>
                          {this.state.likeAmount || ''}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        accessibilityRole={'button'}
                        accessible={true}
                        accessibilityLabel={`View this post's comments`}
                        onPress={() =>
                          this.setState({postCommentVisible: true})
                        }>
                        <Text style={globalStyles.bodyCopyForm}>
                          {this.state.commentAmount}{' '}
                          {this.state.commentAmount > 1
                            ? 'comments'
                            : 'comment'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* Previous Comment Button */}
                  <View
                    style={{
                      borderBottomColor: RWBColors.grey8,
                      borderBottomWidth: 1,
                    }}>
                    {this.state.loadingMoreComments ? (
                      <ActivityIndicator animating size="large" />
                    ) : this.state.commentAmount > this.state.comments.length &&
                      this.state.comments.length !== 0 &&
                      !this.state.refreshing ? (
                      <View style={styles.prevCommentsContainer}>
                        <TouchableOpacity
                          accessible={true}
                          accessibilityComponentType={'button'}
                          accessibilityLabel={'Load more recent comments'}
                          onPress={this.loadMoreComments}>
                          <Text
                            style={{
                              textAlign: 'center',
                              fontWeight: 'bold',
                              color: RWBColors.magenta,
                            }}>
                            See Previous Comments
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>
                </View>
              }
              refreshing={this.state.refreshing}
              onRefresh={this.refreshReactions}
              renderItem={({item, index}) => {
                return item?.data?.content ? (
                  <CommentCard
                    commenter={item.user}
                    text={item.data.content}
                    time={item.created_at}
                    tagged={item.tagged}
                    commentID={item.id}
                    postID={this.streamID}
                    posterID={this.poster.id}
                    eventID={this.eventID}
                    handleCommentDeletion={this.handleCommentDeletion}
                    poster={this.poster}
                    eventName={this.eventName}
                    streamID={this.streamID}
                    title={this.title}
                    verb={this.verb}
                    posterTime={this.state.time}
                    liked={this.state.liked}
                    likeAmount={this.state.likeAmount}
                    posterText={this.state.text}
                    postImage={this.state.post_image}
                    handleLike={this.handleLikePressed}
                    posterTagged={this.state.tagged}
                    close={this.handleClosePostComment}
                    index={index}
                    edited={item.data?.edited}
                  />
                ) : null;
              }}
            />
            {/* fixed to bottom add comment (width 100% not working as expected) */}
            <View
              style={{
                bottom: 0,
                left: 0,
                width: Dimensions.get('window').width,
                height: 65,
                backgroundColor: RWBColors.magenta,
                justifyContent: 'center',
                position: 'absolute',
              }}>
              <View
                style={{
                  backgroundColor: RWBColors.white,
                  width: '90%',
                  alignSelf: 'center',
                  borderRadius: 17,
                  height: 34,
                }}>
                <TouchableOpacity
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                  }}
                  onPress={() => this.setState({postCommentVisible: true})}>
                  <Text
                    style={[
                      globalStyles.formInput,
                      {
                        left: 16,
                        textAlignVertical: 'center',
                        color: RWBColors.grey80,
                      },
                    ]}>
                    Add a comment
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <Modal visible={this.state.imageFocused} animationType="fade">
          <FocusedPicture
            onClose={this.closeModal}
            image={this.state.post_image}
            likeAmount={this.state.likeAmount}
            liked={this.state.liked}
            likePressed={this.handleLikePressed}
          />
        </Modal>

        <Modal
          visible={this.state.postCommentVisible}
          onRequestClose={() => this.setState({postCommentVisible: false})}>
          <PostCommentView
            poster={this.poster}
            eventName={this.eventName}
            streamID={this.streamID}
            title={this.title}
            verb={this.verb}
            time={this.state.time}
            liked={this.state.liked}
            likeAmount={this.state.likeAmount}
            postText={this.state.text}
            eventID={this.eventID}
            postImage={this.state.post_image}
            handleLike={this.handleLikePressed}
            tagged={this.state.tagged}
            close={this.handleClosePostComment}
            workout={{
              eventName: this.state.eventName,
              chapterName: this.state.chapterName,
              eventStartTime: this.state.eventStartTime,
              miles: this.state.miles,
              steps: this.state.steps,
              hours: this.state.hours,
              minutes: this.state.minutes,
              seconds: this.state.seconds,
            }}
          />
        </Modal>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? RWBColors.magenta : null, //the magenta causes the status bar color to change for ios, causes an ugly flash render on android
  },
  headerContainer: {
    backgroundColor: RWBColors.white,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: RWBColors.grey20,
    borderBottomWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: '5%',
  },
  prevCommentsContainer: {
    borderTopColor: RWBColors.grey8,
    borderTopWidth: 1,
    padding: 20,
  },
});
