import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
} from 'react-native';
import {rwbApi} from '../../shared/apis/api';
import globalStyles, {RWBColors} from '../styles';
import LikeIcon from '../../svgs/LikeIcon';
import NavigationService from '../models/NavigationService';
import EnrichedEventCard from '../design_components/EnrichedEventCard';
import FormattedPostText from '../design_components/FormattedPostText';
import {userProfile} from '../../shared/models/UserProfile';
import ReportAndDeleteModal from '../design_components/ReportAndDeleteModal';
import {
  POST_BLOCK_ERROR,
  POST_DELETE_ERROR,
  STREAM_ERRORS,
} from '../../shared/constants/ErrorMessages';
import {logFeedReactPost} from '../../shared/models/Analytics';
import {EventLink, GroupLink, NameLink} from './PostLinks';
import FocusedPicture from '../design_components/FocusedPictureView';
import PostImage from './PostImage';
import PinnedPostIcon from '../../svgs/PinnedPostIcon';
import ShareWorkoutCard from '../challenge_components/ShareWorkoutCard';
import {
  POST_BLOCK_WARNING,
  POST_DELETE_WARNING,
} from '../../shared/constants/OtherMessages';
export default class AggregatedFeedCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.postType = this.props.data.activities[0].foreign_id.split(':')[0]; //"event_post", "attend", "event", "post"
    this.reactable = this.postType !== 'attend'; // can only react to posts that can only be "single" (create, post, etc)
    this.eventID = this.props.eventID;
    this.streamID = this.props.data.activities[0].id;
    this.origin = this.props.data.origin
      ? this.props.data.activities[0].origin.split(':')[0]
      : null; // from feed timeline it can be "user" or "event"
    this.state = {
      loaded: false,
      liked:
        this.props.data.activities[0].own_reactions &&
        this.props.data.activities[0].own_reactions.like, // if own_reactions.like, that means the post has been liked
      likeAmount:
        (this.props.data.activities[0].reaction_counts &&
          this.props.data.activities[0].reaction_counts.like) ||
        0,
      commentAmount:
        (this.props.data.activities[0].reaction_counts &&
          this.props.data.activities[0].reaction_counts.comment) ||
        0,
      deleted: false,
      imageFocused: false,
    };
  }

  componentDidMount() {
    // posts on events are 'event_post's, but do not have an ID. Do not treat it like an event post
    if (
      this.postType === 'event_post' &&
      this.eventID &&
      this.origin !== 'user'
    ) {
      rwbApi
        .getEventReactions(this.eventID, this.streamID)
        .then((result) => {
          this.setState({
            liked: result.data.own_reactions.like,
            likeAmount: result.data.reaction_counts.like || 0,
            loaded: true,
          });
        })
        .catch((err) => {
          // Going to be multiple alerts if for some reason reactions cannot be retrieved
          // TODO: think about how this should be handled
          console.warn(err);
        });
    } else if (this.postType === 'post') {
      const userID = this.props.data.activities[0].actor.split(':')[1];
      rwbApi
        .getReactions(userID, this.props.data.activities[0].id)
        .then((result) => {
          this.setState({
            liked: result.data.own_reactions.like,
            likeAmount: result.data.reaction_counts.like || 0,
            loaded: true,
          });
        })
        .catch((err) => {
          console.warn(err);
        });
    } else this.setState({loaded: true});
  }

  // only the creator of a post can delete
  // "event" types are statuses, and those cannot be deleted
  canDelete = () => {
    const postCreator = this.props.data.activities[0].actor.split(':')[1]; //ID of post creator
    const currentUserID = userProfile.getUserProfile().id.toString();
    return postCreator === currentUserID && this.props.type !== 'event';
  };

  navigateToPost = () => {
    const {
      user,
      time,
      media_url,
      text,
      id,
      event,
      group,
    } = this.props.data.activities[0];
    NavigationService.navigate('Post', {
      post_image: media_url,
      text,
      poster: user,
      time,
      tagged: this.props.data.activities[0].tagged,
      eventID: this.eventID || null,
      groupID: group ? group.id : null,
      streamID: id,
      liked: this.state.liked,
      likeAmount: this.state.likeAmount,
      commentAmount: this.state.commentAmount,
      title: this.displayTitle(),
      eventName: event ? event.name : null,
      groupName: group ? group.name : null,
      refreshFeed: this.props.refreshFeed,
      edited: this.props.data.activities[0].edited,
    });
  };

  deletePost = () => {
    const serverDelete = () => {
      if (!this.props.data.event_id) {
        this.setState({loaded: false});
        rwbApi
          .deleteUserPost(this.props.data.activities[0].id)
          .then(() => {
            this.setState({deleted: true});
          })
          .catch((err) => {
            console.warn(err);
            Alert.alert('Team RWB', POST_DELETE_ERROR);
          })
          .finally(() => {
            this.setState({loaded: true});
          });
      }
      // Event deletion is not planned for from here. Keeping this commented out in case we need to use it
      // else {
      //   this.setState({loaded: false});
      //   rwbApi
      //     .deleteEventPost(this.props.data.event_id, this.props.data.id)
      //     .then(() => {
      //       this.setState({deleted: true});
      //     })
      //     .catch((err) => {
      //       console.warn(err);
      //       Alert.alert(
      //         'Team RWB',
      //         'Error deleting the post. Please try again later.',
      //       );
      //     })
      //     .finally(() => {
      //       this.setState({loaded: true});
      //     });
      // }
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
      if (!this.props.data.event_id) {
        this.setState({loaded: false, deleted: true});
        rwbApi
          .blockPost(this.props.data.activities[0].id)
          .then(() => {})
          .catch((err) => {
            console.warn(err);
            Alert.alert('Team RWB', POST_BLOCK_ERROR);
            this.setState({deleted: false});
          })
          .finally(() => {
            this.setState({loaded: true});
          });
      }
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

  updateLikeStatus = (action) => {
    if (action === 'like')
      this.setState({liked: true, likeAmount: this.state.likeAmount + 1});
    else if (action === 'unlike')
      this.setState({liked: false, likeAmount: this.state.likeAmount - 1});
  };

  handleLikePost = () => {
    const reactionKind = JSON.stringify({kind: 'like'});
    // posts on events are 'event_post's, but do not have an ID. Do not treat it like an event post
    if (
      this.postType === 'event_post' &&
      this.eventID &&
      this.origin !== 'user'
    )
      this.eventPostLike(reactionKind);
    // other postTypes might be "attend",
    else this.userPostLike(reactionKind);
  };

  eventPostLike = (reactionKind) => {
    if (!this.state.liked) {
      this.updateLikeStatus('like');
      rwbApi
        .postEventReaction(this.eventID, this.streamID, reactionKind)
        .then(() => {
          logFeedReactPost();
        })
        .catch((err) => {
          console.warn(err);
          if (err === STREAM_ERRORS.ALREADY_REACTED)
            Alert.alert(
              'Team RWB',
              "You've already liked this post. Please refresh your feed.",
            );
          else
            Alert.alert(
              'Team RWB',
              'Error liking post. Please try again later.',
            );
          this.updateLikeStatus('unlike');
        });
    } else {
      this.updateLikeStatus('unlike');
      rwbApi
        .deleteEventReaction(this.eventID, this.streamID, reactionKind)
        .then(() => {})
        .catch((err) => {
          console.warn(err);
          if (err === STREAM_ERRORS.REACTION_NOT_FOUND)
            Alert.alert(
              'Team RWB',
              "You've already unliked this post or it was deleted. Please refresh your feed.",
            );
          else
            Alert.alert(
              'Team RWB',
              'Error unliking post. Please try again later.',
            );
          this.updateLikeStatus('like');
        });
    }
  };

  // for timeline/feed posts
  userPostLike = (reactionKind) => {
    const creatorID = this.props.data.activities[0].user.id;
    if (!this.state.liked) {
      this.updateLikeStatus('like');
      rwbApi
        .postReaction(creatorID, this.streamID, reactionKind)
        .then(() => {
          logFeedReactPost();
        })
        .catch((err) => {
          console.warn(err);
          if (err === STREAM_ERRORS.ALREADY_REACTED)
            Alert.alert(
              'Team RWB',
              "You've already liked this post. Please refresh your feed.",
            );
          else
            Alert.alert(
              'Team RWB',
              'Error liking post. Please try again later.',
            );
          this.updateLikeStatus('unlike');
        });
    } else {
      this.updateLikeStatus('unlike');
      rwbApi
        .deleteReaction(creatorID, this.streamID, reactionKind)
        .then(() => {})
        .catch((err) => {
          console.warn(err);
          if (err === STREAM_ERRORS.REACTION_NOT_FOUND)
            Alert.alert(
              'Team RWB',
              "You've already unliked this post or it was deleted. Please refresh your feed.",
            );
          else
            Alert.alert(
              'Team RWB',
              'Error unliking post. Please try again later.',
            );
          this.updateLikeStatus('like');
        });
    }
  };

  displayTitle = () => {
    const type = this.props.type;
    const verb = this.props.data.activities[0].verb;
    const event = this.props.data.activities[0].event;
    const group = this.props.data.activities[0].group;
    if (type === 'event') {
      // should only be 'create'. 'going', 'interested', and 'checked_in' get handled by AggregatedPostTitle
      if (verb === 'create') return `added an event`;
    }
    // posting to an event is still a type of post, but has an event object
    else if (type === 'post') {
      if (event) {
        return <EventLink event={event} />;
      } else if (group) {
        return <GroupLink group={group} />;
      }
      return 'posted';
    }
  };

  render() {
    const {
      user,
      time,
      media_url,
      event,
      is_pinned,
    } = this.props.data.activities[0];
    return !this.state.deleted ? (
      <View style={[styles.container, {opacity: this.state.loaded ? 1 : 0.5}]}>
        <View style={{width: '90%'}}>
          <View style={{width: '100%', flexDirection: 'row'}}>
            {/* only want to visit the user's profile if there is one user */}
            <NameLink
              disabled={this.props.data.activity_count > 1}
              user={user}
              time={time}
              title={this.displayTitle()}
              isFlat={false}
              reactable={this.reactable}
              activities={this.props.data.activities}
              edited={this.props.data.activities[0].edited}
            />
            {is_pinned ? (
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={[globalStyles.formLabel, {color: RWBColors.magenta}]}>
                  PINNED POST
                </Text>
                <PinnedPostIcon
                  tintColor={RWBColors.magenta}
                  style={{height: 16, width: 16}}
                />
              </View>
            ) : null}

            <ReportAndDeleteModal
              type="post"
              canDelete={this.canDelete}
              deletePost={this.deletePost}
              blockPost={this.blockPost}
              streamID={this.streamID}
              posterID={this.props.data.activities[0].actor.split(':')[1]}
              eventID={this.eventID}
              text={this.props.data.activities[0].text}
              image={media_url}
              eventStatusPost={this.props.type === 'event'}
              tagged={this.props.data.activities[0].tagged}
              refreshFeed={this.props.refreshFeed}
              workout={this.props.data.activities[0].workout}
            />
          </View>

          {/* If there is stream event is from a user creating an event or setting/updating a status */}
          {this.props.type === 'event' ? (
            <TouchableOpacity
              onPress={() =>
                NavigationService.navigate('EventView', {
                  value: {event: {id: event.id}},
                })
              }
              accessibilityRole={'button'}
              accessible={true}
              accessibilityLabel={`View the ${event.name} event`}>
              <EnrichedEventCard
                isVirtual={event.is_virtual}
                timeZoneID={event.time_zone_id}
                eventTitle={event.name}
                category={event.category}
                start={event.start}
                end={event.end}
                group_name={event.group_name}
                is_all_day={event.is_all_day}
                eventImage={event.photo_url}
                attendeesCount={event.attendees_count}
                attendeePhotos={event.attendee_photos}
              />
            </TouchableOpacity>
          ) : (
            <View>
              <TouchableOpacity
                style={{width: '100%'}}
                onPress={this.navigateToPost}
                accessibilityRole={'button'}
                accessible={true}
                accessibilityLabel={`View post`}>
                <View>
                  {this.props.data.activities[0].workout ? (
                    <View style={styles.detailBlock}>
                      <ShareWorkoutCard
                        eventName={
                          this.props.data.activities[0].workout.event_name
                        }
                        chapterName={
                          this.props.data.activities[0].workout.chapter_name
                        }
                        eventStartTime={
                          this.props.data.activities[0].workout.event_start_time
                        }
                        miles={this.props.data.activities[0].workout.miles}
                        steps={this.props.data.activities[0].workout.steps}
                        hours={Math.floor(
                          this.props.data.activities[0].workout.minutes / 60,
                        )}
                        minutes={Math.floor(
                          this.props.data.activities[0].workout.minutes % 60,
                        )}
                        seconds={Math.round(
                          (this.props.data.activities[0].workout.minutes % 1) *
                            60,
                        )}
                      />
                    </View>
                  ) : null}
                  <FormattedPostText
                    text={this.props.data.activities[0].text}
                    tagged={this.props.data.activities[0].tagged}
                    linkableUsers={false}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.setState({imageFocused: true})}
                accessibilityRole={'button'}
                accessible={true}
                accessibilityLabel={'View post image'}>
                {/* decide how to display the image, perhaps dimensions sent need to be changed */}
                {media_url ? (
                  <PostImage source={media_url} alt="User's post photo" />
                ) : null}
              </TouchableOpacity>
            </View>
          )}
          {this.reactable ? (
            <View
              style={{
                flex: 1,
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10,
              }}>
              <TouchableOpacity
                style={{flexDirection: 'row', height: 20, width: 20}}
                accessibilityRole={'button'}
                accessible={true}
                accessibilityLabel={`Like this post`}
                onPress={() => this.handleLikePost()}>
                <LikeIcon
                  tintColor={this.state.liked ? RWBColors.magenta : null}
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
                onPress={this.navigateToPost}>
                <Text style={globalStyles.bodyCopyForm}>
                  {this.state.commentAmount}{' '}
                  {this.state.commentAmount > 1 ? 'comments' : 'comment'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
        <Modal visible={this.state.imageFocused} animationType="fade">
          <FocusedPicture
            onClose={() => this.setState({imageFocused: false})}
            image={media_url}
            likeAmount={this.state.likeAmount}
            liked={this.state.liked}
            likePressed={this.handleLikePost}
          />
        </Modal>
      </View>
    ) : null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    borderBottomColor: RWBColors.grey8,
    borderBottomWidth: 1,
    paddingVertical: 20,
  },
  detailBlock: {
    marginBottom: 10,
  },
});
