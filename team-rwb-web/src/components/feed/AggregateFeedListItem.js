import React, {Component} from 'react';
import styles from './FeedListItem.module.css';
import DefaultProfileImg from '../../../../shared/images/DefaultProfileImg.png';
import LikeIcon from '../svgs/LikeIcon';
import EnhancedCard from './EnhancedCard';
import {howLongAgo} from '../../../../shared/utils/Helpers';
import {rwbApi} from '../../../../shared/apis/api';
import {Link, withRouter} from 'react-router-dom';
import FormattedPostText from './FormattedPostText';
import AggregatePostTitle from './AggregatePostTitle';
import {userProfile} from '../../../../shared/models/UserProfile';
import {
  logEventReactPost,
  logFeedReactPost,
} from '../../../../shared/models/Analytics';
import ReportAndDeleteOverlay from '../ReportAndDeleteOverlay';
import {
  POST_BLOCK_ERROR,
  POST_DELETE_ERROR,
  STREAM_ERRORS,
} from '../../../../shared/constants/ErrorMessages';
import ListItemTitle from './ListItemTitle';
import PhotoView from './PhotoView';
import PinnedPostIcon from '../svgs/PinnedPostIcon';
import ShareChallengeBox from './ShareChallengeBox';
import {
  POST_BLOCK_WARNING,
  POST_DELETE_WARNING,
} from '../../../../shared/constants/OtherMessages';

class AggregateFeedListItem extends Component {
  constructor(props) {
    super(props);
    const {data, origin} = props;
    this.postType = data.activities[0].foreign_id.split(':')[0];
    this.eventID = this.props.eventID || (data.event && data.event.id);
    this.streamID = data.activities[0].id;
    this.reactable = this.postType !== 'attend'; // can only react to posts that can only be "single" (create, post, etc)
    this.origin =
      (data.activities[0].origin && data.activities[0].origin.split(':')[0]) ||
      origin ||
      null;
    this.state = {
      loaded: false,
      deleted: false, //set to true when deleting and reverted on server failure
      liked:
        this.props.data.activities[0].own_reactions &&
        this.props.data.activities[0].own_reactions.like, // if own_reactions.like, that means the post has been liked
      likeAmount:
        (this.props.data.activities[0].reaction_counts &&
          this.props.data.activities[0].reaction_counts.like) ||
        0,
      commentAmount:
        this.props.data.activities[0].reaction_counts?.comment || 0,
      isModalOpen: false,
      tallImg: false,
    };
  }

  // navigating means the value is being sent to a different page
  displayTitle = (navigating) => {
    // will need to add a check for event name after enrichment
    const {type, history} = this.props;
    const {verb, event, group} = this.props.data.activities[0];
    return ListItemTitle(history, navigating, type, verb, event, group);
  };

  // only the creator of a post can delete
  // "event" types are statuses, and those cannot be deleted
  canDelete = () => {
    const postCreator = this.props.data.activities[0].actor.split(':')[1]; //ID of post creator
    const currentUserID = userProfile.getUserProfile().id.toString();
    return postCreator === currentUserID && this.props.type !== 'event';
  };

  deletePost = () => {
    if (window.confirm(`Delete Post: ${POST_DELETE_WARNING}`)) {
      if (!this.props.data.event_id) {
        this.setState({deleted: true});
        rwbApi
          .deleteUserPost(this.props.data.activities[0].id)
          .then(() => {
            // hide post
          })
          .catch(() => {
            alert(POST_DELETE_ERROR);
            this.setState({deleted: false});
          });
      }
    }
  };

  blockPost = () => {
    if (window.confirm(`Block Post: ${POST_BLOCK_WARNING}`)) {
      if (!this.props.data.event_id) {
        this.setState({deleted: true});
        rwbApi
          .blockPost(this.props.data.activities[0].id)
          .then(() => {
            // hide post
          })
          .catch(() => {
            alert(POST_BLOCK_ERROR);
            this.setState({deleted: false});
          });
      }
    }
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

  // NOTE: This function is not called on web despite liking the same event post as on mobile (where it is called)
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
    const creatorID = this.props.data.activities[0].user.id;
    if (!this.state.liked) {
      this.updateLikeStatus('like');
      rwbApi
        .postReaction(creatorID, this.streamID, reactionKind)
        .then((result) => {
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

  render() {
    const {
      id,
      user,
      time,
      text,
      event,
      media_url,
      tagged,
      is_pinned,
    } = this.props.data.activities[0];
    const {liked, likeAmount, deleted, commentAmount, isModalOpen} = this.state;
    const {type, history} = this.props;

    return !deleted && user.id ? (
      <div className={styles.container}>
        <div className={styles.userActivityContainer}>
          <div className={styles.imageAndTextContainer}>
            <div
              className={styles.userImageContainer}
              onClick={() => history.push(`/profile/${user.id}`)}>
              <img
                className={styles.profileImage}
                src={user.profile_photo_url || DefaultProfileImg}
                alt="User Profile Image"
              />
            </div>
            <p>
              {this.reactable ? (
                <span>
                  <span
                    className={`namesAndObjects ${styles.name}`}
                    onClick={() => history.push(`/profile/${user.id}`)}>
                    {`${user.first_name} ${user.last_name}`}&nbsp;
                  </span>
                  {this.displayTitle(false)}&nbsp;
                </span>
              ) : (
                <AggregatePostTitle
                  activities={this.props.data.activities}
                  history={history}
                />
              )}
              <span className="namesAndObjects">&nbsp;</span>•{' '}
              {howLongAgo(time)}
              {this.props.data.activities[0]?.edited && (
                <p className={'edited'}> Edited</p>
              )}
            </p>
          </div>
          <div style={{alignSelf: 'flex-start', display: 'flex'}}>
            {is_pinned ? (
              <div className={styles.pinnedContainer}>
                <h4 className={styles.pinnedPostText}>PINNED POST</h4>
                {/* placeholder svg */}
                <PinnedPostIcon width="20px" height="20px" />
              </div>
            ) : null}
            <ReportAndDeleteOverlay
              canDelete={this.canDelete}
              deletePost={this.deletePost}
              blockPost={this.blockPost}
              streamID={this.streamID}
              posterID={this.props.data.activities[0].actor.split(':')[1]}
              workout={this.props.data.activities[0].workout}
              text={text}
              image={media_url}
              type="post"
              eventStatusPost={type === 'event'}
              groupID={this.props.data.activities[0]?.group}
              eventID={this.eventID || null}
              tagged={tagged}
              mergeNewPost={this.props.mergeNewPost}
            />
          </div>
        </div>
        {type === 'event' && <EnhancedCard event={event} />}

        <Link
          to={{
            pathname: `/feed/${id}`,
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
              actorID: this.props.data.activities[0].actor.split(':')[1],
              activityID: this.props.data.activities[0].id,
              commentAmount,
            },
          }}>
          {this.props.data.activities[0].workout ? (
            <ShareChallengeBox
              eventName={this.props.data.activities[0].workout.event_name}
              chapterName={this.props.data.activities[0].workout.chapter_name}
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
                (this.props.data.activities[0].workout.minutes % 1) * 60,
              )}
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
        {this.reactable ? (
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
                history.push({
                  pathname: `/feed/${id}`,
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
                    actorID: this.props.data.activities[0].actor.split(':')[1],
                    activityID: this.props.data.activities[0].id,
                    commentAmount,
                  },
                })
              }>
              <p>{`${commentAmount} ${
                commentAmount > 1 ? 'comments' : 'comment'
              }`}</p>
            </div>
          </div>
        ) : null}
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

export default withRouter(AggregateFeedListItem);
