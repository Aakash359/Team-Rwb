import React, {Component} from 'react';
import styles from './FeedListItem.module.css';
import DefaultProfileImg from '../../../../shared/images/DefaultProfileImg.png';
import LikeIcon from '../svgs/LikeIcon';
import EnhancedCard from './EnhancedCard';
import {howLongAgo} from '../../../../shared/utils/Helpers';
import {rwbApi} from '../../../../shared/apis/api';
import {Link, withRouter} from 'react-router-dom';
import FormattedPostText from './FormattedPostText';
import {
  logEventReactPost,
  logFeedReactPost,
} from '../../../../shared/models/Analytics';
import {userProfile} from '../../../../shared/models/UserProfile';
import ReportAndDeleteOverlay from '../ReportAndDeleteOverlay';
import {
  POST_BLOCK_ERROR,
  POST_DELETE_ERROR,
  STREAM_ERRORS,
} from '../../../../shared/constants/ErrorMessages';
import ListItemTitle from './ListItemTitle';
import PhotoView from './PhotoView';
import EagleLeaderIcon from '../svgs/EagleLeaderIcon.js';
import AdminIcon from '../svgs/AdminIcon';
import ShareChallengeBox from './ShareChallengeBox';
import {
  POST_BLOCK_WARNING,
  POST_DELETE_WARNING,
} from '../../../../shared/constants/OtherMessages';

class FeedListItem extends Component {
  constructor(props) {
    super(props);
    const {data, origin} = props;
    this.postType = this.props.data?.foreign_id?.split(':')[0];
    this.eventID = this.props.eventID || this.props.data.event?.id;
    this.streamID = this.props.data.id;
    this.origin = (data.origin && data.origin.split(':')[0]) || origin || null;
    this.state = {
      loaded: false,
      liked:
        this.props.data.own_reactions && this.props.data.own_reactions.like, // if own_reactions.like, that means the post has been liked
      likeAmount:
        (this.props.data.reaction_counts &&
          this.props.data.reaction_counts.like) ||
        0,
      deleted: false, // used to hide card after deleted
      commentAmount: this.props.data.reaction_counts?.comment || 0,
      isModalOpen: false,
    };
  }
  //navigating is used to differentiate between displaying on the card, and the value sent to the navigated page
  displayTitle = (navigating) => {
    // will need to add a check for event name after enrichment
    const {type, history} = this.props;
    const {verb, event, group, challenge} = this.props.data;
    return ListItemTitle(
      history,
      navigating,
      type,
      verb,
      event,
      group,
      challenge,
    );
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
    ) {
      this.eventPostLike(reactionKind);
    }
    // other postTypes might be "attend",
    else this.userPostLike(reactionKind);
  };

  onImgLoad = ({target: img}) => {
    if (img.offsetWidth / img.offsetHeight < 0.75) {
      this.setState({tallImg: true});
    }
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
          if (err === STREAM_ERRORS.ALREADY_REACTED)
            alert("You've already liked this post. Please refresh your feed.");
          else alert('Error liking post. Please try again later.');
          this.updateLikeStatus('unlike');
        });
    } else {
      this.updateLikeStatus('unlike');
      rwbApi
        .deleteEventReaction(this.eventID, this.streamID, reactionKind)
        .then(() => {})
        .catch((err) => {
          if (err === STREAM_ERRORS.REACTION_NOT_FOUND)
            alert(
              "You've already unliked this post or it was deleted. Please refresh your feed.",
            );
          else alert('Error unliking post. Please try again later.');
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
        .then(() => {
          logFeedReactPost();
        })
        .catch((err) => {
          if (err === STREAM_ERRORS.ALREADY_REACTED)
            alert("You've already liked this post. Please refresh your feed.");
          else alert('Error liking post. Please try again later.');
          this.updateLikeStatus('unlike');
        });
    } else {
      this.updateLikeStatus('unlike');
      rwbApi
        .deleteReaction(creatorID, this.streamID, reactionKind)
        .then(() => {})
        .catch((err) => {
          if (err === STREAM_ERRORS.REACTION_NOT_FOUND)
            alert(
              "You've already unliked this post or it was deleted. Please refresh your feed.",
            );
          else alert('Error unliking post. Please try again later.');
          this.updateLikeStatus('like');
        });
    }
  };

  canDelete = () => {
    const postCreator = this.props.data.actor.split(':')[1]; //ID of post creator
    const currentUserID = userProfile.getUserProfile().id.toString();
    return postCreator === currentUserID && this.props.type !== 'event';
  };

  deletePost = () => {
    if (window.confirm(`Delete Post: ${POST_DELETE_WARNING}`)) {
      this.setState({deleted: true});
      if (this.props.data.group_id) {
        rwbApi
          .deleteGroupPost(this.props.data.group_id, this.props.data.id)
          .then(() => {})
          .catch(() => {
            alert(POST_DELETE_ERROR);
            this.setState({deleted: false});
          });
      } else if (this.props.data.challenge_id) {
        rwbApi
          .deleteChallengePost(this.props.data.challenge_id, this.props.data.id)
          .then(() => {})
          .catch(() => {
            alert(POST_DELETE_ERROR);
            this.setState({deleted: false});
          });
      } else if (!this.props.data.event_id) {
        rwbApi
          .deleteUserPost(this.props.data.id)
          .then(() => {})
          .catch(() => {
            alert(POST_DELETE_ERROR);
            this.setState({deleted: false});
          });
      } else {
        rwbApi
          .deleteEventPost(this.props.data.event_id, this.props.data.id)
          .then(() => {})
          .catch(() => {
            alert(POST_DELETE_ERROR);
            this.setState({deleted: false});
          });
      }
    }
  };

  blockPost = () => {
    if (window.confirm(`Block Post: ${POST_BLOCK_WARNING}`)) {
      this.setState({deleted: true});
      rwbApi
        .blockPost(this.props.data.id)
        .then(() => {})
        .catch(() => {
          alert(POST_BLOCK_ERROR);
          this.setState({deleted: false});
        });
    }
  };

  determinePostRoute = () => {
    const {group_id, event_id, challenge_id, id} = this.props.data;
    const {origin} = this.props;
    if (group_id && origin !== 'user') {
      return `/groups/${group_id}/feed/${id}`;
    } else if (event_id && origin !== 'user') {
      return `/events/${event_id}/feed/${id}`;
    } else if (challenge_id && origin !== 'user') {
      return `/challenges/${challenge_id}/feed/${id}`;
    } else return `/feed/${id}`;
  };

  render() {
    const {
      id,
      user,
      time,
      text,
      event,
      media_url,
      tagged,
      actor,
      group_id,
    } = this.props.data;
    const {liked, likeAmount, deleted, commentAmount, isModalOpen} = this.state;
    const {type, history} = this.props;

    return !deleted && user.id && event?.id !== null ? (
      <div className={styles.container}>
        <div style={{display: 'flex', flex: 1, justifyContent: 'flex-end'}}>
          <ReportAndDeleteOverlay
            canDelete={this.canDelete}
            deletePost={this.deletePost}
            blockPost={this.blockPost}
            streamID={this.streamID}
            groupID={this.props.data.group_id}
            posterID={this.props.data.actor.split(':')[1]}
            workout={this.props.data.workout}
            text={text}
            image={media_url}
            type="post"
            eventStatusPost={type === 'event'}
            eventID={this.eventID || null}
            tagged={tagged}
            mergeNewPost={this.props.mergeNewPost}
          />
        </div>
        <div className={styles.userActivityContainer}>
          <div
            className={styles.userImageContainer}
            onClick={() => history.push(`/profile/${user.id}`)}>
            <img
              className={styles.profileImage}
              src={user?.profile_photo_url || DefaultProfileImg}
              alt="User Profile Image"
            />
            {/* only show on a sponsor group the poster is an admin of */}
            {this.props.isSponsor && user?.is_sponsor_admin && (
              <AdminIcon className={styles.sponsorAdminIcon} />
            )}
          </div>
          <p>
            <span
              className={`namesAndObjects ${styles.name}`}
              onClick={() => history.push(`/profile/${user.id}`)}>
              {`${user?.first_name} ${user?.last_name}`}&nbsp;
            </span>
            {this.displayTitle(false)}&nbsp;
            {/* <span className="namesAndObjects">Object&nbsp;</span> */}•{' '}
            {howLongAgo(time)}
            {this.props.data?.edited && <p className={'edited'}> Edited</p>}
          </p>
        </div>
        {type === 'event' && <EnhancedCard event={event} />}

        <Link
          to={{
            pathname: this.determinePostRoute(),
            state: {
              post_image: media_url,
              text,
              poster: user,
              time,
              tagged,
              eventID: this.eventID || null,
              streamID: id,
              liked,
              likeAmount,
              title: this.displayTitle(true),
              eventName: event ? event.name : null,
              actorID: actor.split(':')[1],
              activityID: id,
              commentAmount,
            },
          }}>
          {this.props.data.workout ? (
            <ShareChallengeBox
              eventName={this.props.data.workout.event_name}
              chapterName={this.props.data.workout.chapter_name}
              eventStartTime={this.props.data.workout.event_start_time}
              miles={this.props.data.workout.miles}
              steps={this.props.data.workout.steps}
              hours={Math.floor(this.props.data.workout.minutes / 60)}
              minutes={Math.floor(this.props.data.workout.minutes % 60)}
              seconds={Math.round((this.props.data.workout.minutes % 1) * 60)}
            />
          ) : null}
          <FormattedPostText
            text={text}
            tagged={tagged}
            linkableUsers={false}
            history={history}
            clickable={false}
          />
        </Link>
        {media_url && (
          <div
            className={
              this.state.tallImg
                ? `${styles.tallContainer} ${styles.postImageContainer}`
                : styles.postImageContainer
            }>
            <img
              className={[
                this.state.tallImg
                  ? `${styles.tallImage} ${styles.postImage}`
                  : styles.postImage,
              ]}
              src={media_url}
              alt="User Post Image"
              onClick={() => this.setState({isModalOpen: true})}
              onLoad={this.onImgLoad}
            />
          </div>
        )}
        <div className={styles.reactionContainer}>
          <div className={styles.likeContainer} onClick={this.handleLikePost}>
            <LikeIcon
              className={styles.likeIcon}
              tintColor={liked ? 'var(--magenta)' : null}
            />
            <p>{likeAmount > 0 && likeAmount}</p>
          </div>
          <div
            className={styles.commentsContainer}
            onClick={() =>
              this.props.history.push({
                pathname: this.determinePostRoute(),
                state: {
                  post_image: media_url,
                  text,
                  poster: user,
                  time,
                  tagged,
                  eventID: this.eventID || null,
                  streamID: id,
                  liked,
                  likeAmount,
                  title: this.displayTitle(true),
                  eventName: event ? event.name : null,
                  actorID: actor.split(':')[1],
                  activityID: id,
                  commentAmount,
                },
              })
            }>
            <p>{`${commentAmount} ${
              commentAmount > 1 ? 'comments' : 'comment'
            }`}</p>
          </div>
        </div>
        {isModalOpen && (
          <PhotoView
            post_image={media_url}
            onModalClose={() => this.setState({isModalOpen: false})}
            liked={liked}
            likeAmount={likeAmount}
            onLikeClicked={this.handleLikePost}
          />
        )}
      </div>
    ) : null;
  }
}

export default withRouter(FeedListItem);
