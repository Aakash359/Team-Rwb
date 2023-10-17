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
import {logEventReactPost} from '../../shared/models/Analytics';
import {ChallengeLink, EventLink, GroupLink, NameLink} from './PostLinks';
import FocusedPicture from '../design_components/FocusedPictureView';
import PostImage from './PostImage';
import ShareWorkoutCard from '../challenge_components/ShareWorkoutCard';
import {
  POST_BLOCK_WARNING,
  POST_DELETE_WARNING,
} from '../../shared/constants/OtherMessages';

export default class FeedCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.postType = this.props.data.foreign_id.split(':')[0]; //"event_post", "attend", "event", "post"
    this.eventID = this.props.eventID;
    this.streamID = this.props.data.id;
    this.origin = this.props.data.origin
      ? this.props.data.origin.split(':')[0]
      : null; // from feed timeline it can be "user" or "event"
    this.state = {
      loaded: false,
      liked:
        this.props.data.own_reactions && this.props.data.own_reactions.like, // if own_reactions.like, that means the post has been liked
      likeAmount:
        (this.props.data.reaction_counts &&
          this.props.data.reaction_counts.like) ||
        0,
      commentAmount:
        (this.props.data.reaction_counts &&
          this.props.data.reaction_counts.comment) ||
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
    } else if (this.postType === 'post' || this.postType === 'group_post') {
      rwbApi
        .getReactions(this.props.data.user.id, this.streamID)
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
    const postCreator = this.props.data.actor.split(':')[1]; //ID of post creator
    const currentUserID = userProfile.getUserProfile().id.toString();
    return postCreator === currentUserID && this.props.type !== 'event';
  };

  deletePost = () => {
    const serverDelete = () => {
      if (this.props.data.group_id) {
        this.setState({loaded: false});
        rwbApi
          .deleteGroupPost(this.props.data.group_id, this.props.data.id)
          .then(() => {
            this.setState({deleted: true});
          })
          .catch((err) => {
            console.warn(err);
            // TODO, alerts in shared
            Alert.alert('Team RWB', POST_DELETE_ERROR);
          })
          .finally(() => {
            this.setState({loaded: true});
          });
      } else if (this.props.data.challenge_id) {
        this.setState({loaded: false});
        rwbApi
          .deleteChallengePost(this.props.data.challenge_id, this.props.data.id)
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
      } else if (!this.props.data.event_id) {
        this.setState({loaded: false});
        rwbApi
          .deleteUserPost(this.props.data.id)
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
      } else {
        this.setState({loaded: false});
        rwbApi
          .deleteEventPost(this.props.data.event_id, this.props.data.id)
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
      this.setState({loaded: false, deleted: true});
      rwbApi
        .blockPost(this.props.data.id)
        .then(() => {})
        .catch((err) => {
          console.warn(err);
          Alert.alert('Team RWB', POST_BLOCK_ERROR);
          this.setState({deleted: false});
        })
        .finally(() => {
          this.setState({loaded: true});
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
          logEventReactPost();
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
    const creatorID = this.props.data.user.id;
    if (!this.state.liked) {
      this.updateLikeStatus('like');
      rwbApi
        .postReaction(creatorID, this.streamID, reactionKind)
        .then(() => {})
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
    // will need to add a check for event name after enrichment
    const type = this.props.type;
    const verb = this.props.data.verb;
    const event = this.props.data.event;
    const group = this.props.data.group;
    const challenge = this.props.data.challenge;
    if (type === 'event') {
      if (verb === 'create') return `added an event`;
      else if (verb === 'going' || verb === 'interested') return `is ${verb}`;
      else if (verb === 'checked_in') return `checked into`;
    }
    // posting to an event is still a type of post, but has an event object
    else if (type === 'post') {
      if (event) {
        return <EventLink event={event} />;
      } else if (group) {
        return <GroupLink group={group} />;
      } else if (challenge) {
        return <ChallengeLink challenge={challenge} />;
      }
      return 'posted';
    }
  };

  navigateToPost = () => {
    const {user, time, media_url, text, id, event, group} = this.props.data;
    NavigationService.navigate('Post', {
      post_image: media_url,
      text,
      poster: user,
      time,
      tagged: this.props.data.tagged,
      eventID: this.props.eventID || null,
      groupID: group ? group.id : null,
      streamID: id,
      liked: this.state.liked,
      likeAmount: this.state.likeAmount,
      commentAmount: this.state.commentAmount,
      title: this.displayTitle(),
      eventName: event ? event.name : null,
      groupName: group ? group.name : null,
      refreshFeed: this.props.refreshFeed,
      edited: this.props.data.edited,
    });
  };

  render() {
    const {user, time, media_url, event} = this.props.data;
    return !this.state.deleted && user.id && event?.id !== null ? (
      <View style={[styles.container, {opacity: this.state.loaded ? 1 : 0.5}]}>
        <View style={{width: '90%'}}>
          <View style={{width: '100%', flexDirection: 'row'}}>
            <NameLink
              title={this.displayTitle()}
              user={user}
              time={time}
              isFlat={true}
              isGroupSponsor={true}
              edited={this.props.data.edited}
            />
            <ReportAndDeleteModal
              type="post"
              eventStatusPost={this.props.type === 'event'}
              canDelete={this.canDelete}
              deletePost={this.deletePost}
              blockPost={this.blockPost}
              groupID={this.props.data.group_id}
              eventID={this.props.eventID}
              streamID={this.streamID}
              posterID={this.props.data.actor.split(':')[1]}
              text={this.props.data.text}
              image={this.props.data.image || this.props.data.media_url}
              tagged={this.props.data.tagged}
              refreshFeed={this.props.refreshFeed}
              workout={this.props.data.workout}
            />
          </View>

          {/* If there is stream event is from a user creating an event or setting/updating a status */}
          {this.props.type === 'event' ? (
            <TouchableOpacity
              style={{}}
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
                  {this.props.data.workout ? (
                    <View style={styles.detailBlock}>
                      <ShareWorkoutCard
                        eventName={this.props.data.workout.event_name}
                        chapterName={this.props.data.workout.chapter_name}
                        eventStartTime={
                          this.props.data.workout.event_start_time
                        }
                        miles={this.props.data.workout.miles}
                        steps={this.props.data.workout.steps}
                        hours={Math.floor(this.props.data.workout.minutes / 60)}
                        minutes={Math.floor(
                          this.props.data.workout.minutes % 60,
                        )}
                        seconds={Math.round(
                          (this.props.data.workout.minutes % 1) * 60,
                        )}
                      />
                    </View>
                  ) : null}
                  <FormattedPostText
                    text={this.props.data.text}
                    tagged={this.props.data.tagged}
                    linkableUsers={false}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.setState({imageFocused: true})}
                accessibilityRole={'button'}
                accessible={true}
                accessibilityLabel={`View post`}>
                {/* decide how to display the image, perhaps dimensions sent need to be changed */}
                {media_url ? (
                  <PostImage source={media_url} alt="User's post photo" />
                ) : null}
              </TouchableOpacity>
            </View>
          )}

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
