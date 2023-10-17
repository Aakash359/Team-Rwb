import React, {Component} from 'react';
import styles from './PostView.module.css';
import DefaultProfileImg from '../../../../shared/images/DefaultProfileImg.png';
import LikeIcon from '../svgs/LikeIcon';
import ChevronBackIcon from '../svgs/ChevronBackIcon';
import ReplyIcon from '../svgs/ReplyIcon';
import {withRouter} from 'react-router-dom';
import {rwbApi} from '../../../../shared/apis/api';
import {howLongAgo} from '../../../../shared/utils/Helpers';
import PhotoView from './PhotoView';
import FormattedPostText from './FormattedPostText';
import Loading from '../Loading';
import {logNotificationsLike} from '../../../../shared/models/Analytics';
import ReportAndDeleteOverlay from '../ReportAndDeleteOverlay';
import {userProfile} from '../../../../shared/models/UserProfile';
import CommentView from './CommentView';
import CreateCommentBar from './CreateCommentBar';
import {ClipLoader} from 'react-spinners';
import ShareChallengeBox from './ShareChallengeBox';
import {
  POST_BLOCK_WARNING,
  POST_DELETE_WARNING,
} from '../../../../shared/constants/OtherMessages';
import {
  POST_BLOCK_ERROR,
  POST_DELETE_ERROR,
} from '../../../../shared/constants/ErrorMessages';

function Reply() {
  return (
    <div className={styles.replyContainer}>
      <div className={styles.userReplyContainer}>
        <ReplyIcon className={styles.replyIcon} />
        <p>
          <span className="namesAndObjects">User&nbsp;</span>• Time
        </p>
      </div>
      <p className={`bodyCopy ${styles.postText}`}>Text</p>
      <div className={styles.reactionContainer}>
        <div className={styles.likeContainer}>
          <LikeIcon className={styles.likeIcon} />
          <p>#</p>
        </div>
      </div>
    </div>
  );
}

function Comment() {
  return (
    <div className={styles.commentContainer}>
      <div className={styles.userCommentContainer}>
        <div className={styles.userImageContainer}>
          <img
            className={styles.profileImage}
            src={DefaultProfileImg}
            alt="User Profile Image"
          />
        </div>
        <p>
          <span className="namesAndObjects">User&nbsp;</span>• Time
        </p>
      </div>
      <p className={`bodyCopy ${styles.postText}`}>Text</p>
      <div className={styles.reactionContainer}>
        <div className={styles.likeContainer}>
          <LikeIcon className={styles.likeIcon} />
          <p>#</p>
        </div>
        <p># Reply</p>
      </div>
      <Reply />
    </div>
  );
}

const SeePreviousComments = ({refreshing, onClick, allCommentsLoaded}) => (
  <div
    className={[
      styles.previousCommentsContainer,
      allCommentsLoaded && styles.displayNone,
    ].join(' ')}>
    {refreshing ? (
      <ClipLoader size={30} color={'var(--grey80)'} loading={true} />
    ) : (
      <h3 className={styles.previousCommentsText} onClick={onClick}>
        See Previous Comments
      </h3>
    )}
  </div>
);

class PostView extends Component {
  constructor(props) {
    super(props);
    const {
      eventID,
      eventName,
      groupName,
      likeAmount,
      liked,
      post_image,
      poster,
      streamID,
      tagged,
      text,
      time,
      title,
      postID,
      previousScreen,
      actorID,
      activityID,
      commentAmount,
      commentID,
    } = this.props.location.state;

    this.state = {
      eventID,
      eventName: eventName || 'posted',
      groupName: groupName || 'posted',
      likeAmount: likeAmount || 0,
      liked: liked || false,
      post_image,
      poster,
      streamID,
      tagged,
      text,
      time,
      title,
      postID,
      previousScreen,
      loading: true,
      imageFocused: false,
      refreshing: false,
      isModalOpen: false,
      actorID: actorID || null,
      activityID: activityID || null,
      comments: [],
      commentAmount,
      page: 1,
      allCommentsLoaded: commentAmount === 0 ? true : false,
      loadingPoster: commentID ? true : false, // requires fetching poster data
      edited: false,
      workoutEventName: '',
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
    this.refreshReactions();
  }

  initializeScreen = () => {
    const {poster, streamID} = this.state;
    if (!streamID) this.setState({loading: false});
    else {
      rwbApi
        .getSpecificPost(poster.id, streamID)
        .then((result) => {
          const data = result.data.results[0];
          // If loading the specific post has a name (meaning it was an event), display it. Otherwise it was a post
          let eventName, verb, eventID, groupName, groupID;
          if (data.name) eventName = data.name;
          else if (data.event && data.event.name) {
            eventName = data.event.name;
            verb = data.verb;
            eventID = data.event.id;
          } else if (data.group && data.group.name) {
            groupName = data.group.name;
            verb = data.verb;
            groupID = data.group.id;
          } else {
            eventName = 'posted';
          }
          this.setState({
            eventName,
            groupName,
            verb,
            text: data.text,
            post_image: data.media_url,
            likeAmount: data.reaction_counts.like || 0,
            commentAmount: data.reaction_counts.comment || 0,
            liked: data.own_reactions.like || false,
            loading: false,
            tagged: data.tagged,
            eventID: eventID || this.state.eventID,
            groupID: groupID || this.state.groupID,
            poster: data.user,
            time: data.time,
            loadingPoster: false,
            edited: data.edited,
          });
          if (data.workout) {
            this.setState({
              workoutEventName: data.workout.event_name || '',
              chapterName: data.workout.chapter_name || '',
              eventStartTime: data.workout.event_start_time || '',
              miles: data.workout.miles || 0,
              steps: data.workout.steps || 0,
              hours: Math.floor(data.workout.minutes / 60) || 0,
              minutes: Math.floor(data.workout.minutes % 60) || 0,
              seconds: Math.round((data.workout.minutes % 1) * 60) || 0,
            });
          }
        })
        .catch((err) => {
          console.warn(err);
          this.setState({loading: false});
          this.props.history.goBack();
        });
    }
  };

  // Refresh how many comments/likes on the post
  refreshReactions = (newComment = false) => {
    const {poster, streamID} = this.state;
    this.setState({refreshing: true});
    rwbApi
      .getReactions(poster.id, streamID, null, 'comment')
      .then((result) => {
        let comments = [];
        result.data.reactions.forEach((item) =>
          comments.push({
            content: item.data.content,
            time: item.created_at,
            comment_id: item.id,
            user: item.user,
            tagged: item.tagged,
            edited: item.data.edited,
          }),
        );
        this.setState(
          {
            comments,
            allCommentsLoaded:
              comments.length === 0 ||
              comments.length >= result.data.reaction_counts.comment
                ? true
                : false,
            refreshing: false,
          },
          () =>
            newComment &&
            this.commentsRef.scrollIntoView({
              block: 'end',
              behavior: 'smooth',
            }),
        );
      })
      .catch((err) => {
        console.warn(err);
        this.setState({refreshing: false});
        alert('Error refreshing post. Post not found. Please try again later');
        this.props.history.goBack();
      });
  };

  loadMoreReactions = () => {
    const {poster, streamID, page, comments} = this.state;
    this.setState({refreshing: true});
    const oldestCommentID = comments[0].comment_id;
    rwbApi
      .getReactions(poster.id, streamID, oldestCommentID, 'comment')
      .then((result) => {
        const newComments = [];
        result.data.reactions.forEach((item) =>
          newComments.push({
            content: item.data.content,
            time: item.created_at,
            comment_id: item.id,
            user: item.user,
            tagged: item.tagged,
            edited: item.data.edited,
          }),
        );
        const mergedComments = [...newComments, ...comments];
        this.setState({
          comments: mergedComments,
          likeAmount: result.data.reaction_counts.like || 0,
          commentAmount: result.data.reaction_counts.comment || 0,
          page: page + 1,
          allCommentsLoaded:
            mergedComments.length >= result.data.reaction_counts.comment
              ? true
              : false,
          refreshing: false,
        });
      })
      .catch((err) => {
        console.warn(err);
        this.setState({refreshing: false});
        alert('Error loading more comments. Please try again later');
      });
  };

  updateLikeStatus = (action) => {
    if (action === 'like')
      this.setState({liked: true, likeAmount: this.state.likeAmount + 1});
    else if (action === 'unlike')
      this.setState({liked: false, likeAmount: this.state.likeAmount - 1});
  };

  handleLikeClicked = () => {
    const reactionKind = JSON.stringify({kind: 'like'});
    if (this.state.eventID) this.handleEventLike(reactionKind);
    else this.handleUserLike(reactionKind);
  };

  handleUserLike = (reactionKind) => {
    const {liked, poster, streamID, previousScreen} = this.state;
    if (!liked) {
      this.updateLikeStatus('like');
      rwbApi
        .postReaction(poster.id, streamID, reactionKind)
        .then(() => {
          if (previousScreen === 'notifications') logNotificationsLike();
        })
        .catch((err) => {
          alert('Error liking post. Please try again later.');
          this.updateLikeStatus('unlike');
        });
    } else {
      this.updateLikeStatus('unlike');
      rwbApi
        .deleteReaction(poster.id, streamID, reactionKind)
        .then(() => {})
        .catch((err) => {
          this.updateLikeStatus('like');
          alert('Error unliking post. Please try again later.');
        });
    }
  };

  handleEventLike = (reactionKind) => {
    const {liked, eventID, streamID, previousScreen} = this.state;
    if (!liked) {
      this.updateLikeStatus('like');
      rwbApi
        .postEventReaction(eventID, streamID, reactionKind)
        .then(() => {
          if (previousScreen === 'notifications') logNotificationsLike();
        })
        .catch((err) => {
          console.warn(err);
          alert('Error liking post. Please try again later.');
          this.updateLikeStatus('unlike');
        });
    } else {
      this.updateLikeStatus('unlike');
      rwbApi
        .deleteEventReaction(eventID, streamID, reactionKind)
        .then(() => {})
        .catch((err) => {
          this.updateLikeStatus('like');
          alert('Error unliking post. Please try again later.');
        });
    }
  };

  // only the creator of a post can delete
  // "event" types are statuses, and those cannot be deleted
  canDelete = () => {
    const postCreator = this.state.actorID; //ID of post creator
    const currentUserID = userProfile.getUserProfile().id.toString();
    return postCreator === currentUserID && this.props.type !== 'event';
  };

  deletePost = () => {
    if (window.confirm(`Delete Post: ${POST_DELETE_WARNING}`)) {
      const {eventID, activityID} = this.state;
      if (!eventID) {
        this.setState({deleted: true});
        rwbApi
          .deleteUserPost(activityID)
          .then(() => {
            this.props.history.goBack();
            // TODO: Remove post on feed page by passing function which will set delete to true
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
      const {eventID, activityID} = this.state;
      if (!eventID) {
        this.setState({deleted: true});
        rwbApi
          .blockPost(activityID)
          .then(() => {
            this.props.history.goBack();
          })
          .catch(() => {
            alert(POST_BLOCK_ERROR);
            this.setState({deleted: false});
          });
      }
    }
  };

  handleCommentDeletion = () =>
    this.setState({commentAmount: this.state.commentAmount - 1});

  render() {
    const {
      eventName,
      groupName,
      likeAmount,
      liked,
      post_image,
      poster,
      streamID,
      tagged,
      text,
      time,
      title,
      isModalOpen,
      loading,
      verb,
      eventID,
      groupID,
      actorID,
      comments,
      refreshing,
      commentAmount,
      allCommentsLoaded,
      loadingPoster,
      edited,
      workoutEventName,
      chapterName,
      eventStartTime,
      miles,
      steps,
      hours,
      minutes,
      seconds,
    } = this.state;
    const {history} = this.props;

    return !loadingPoster ? (
      <>
        <Loading
          size={100}
          color={'var(--white)'}
          loading={loading}
          right
          transparent={false}
        />
        <div className={styles.container}>
          <div className={styles.userActivityContainer}>
            <div onClick={() => history.goBack()} className={styles.backIcon}>
              <ChevronBackIcon tintColor={'var(--magenta)'} />
            </div>
            <div
              className={styles.userImageContainer}
              onClick={() => history.push(`/profile/${poster.id}`)}>
              <img
                className={styles.profileImage}
                src={poster.profile_photo_url || DefaultProfileImg}
                alt="User Profile Image"
              />
            </div>
            <p>
              <span
                className={`namesAndObjects ${styles.selectable}`}
                onClick={() => history.push(`/profile/${poster.id}`)}>
                {`${poster.first_name} ${poster.last_name}`}&nbsp;
              </span>
              {eventID ? (
                <span
                  className={`namesAndObjects ${styles.selectable}`}
                  onClick={() => history.push(`/events/${eventID}`)}>
                  {`> ${eventName || ''}`}
                </span>
              ) : groupID ? (
                <span
                  className={`namesAndObjects ${styles.selectable}`}
                  onClick={() => history.push(`/groups/${groupID}`)}>
                  {`> ${groupName || ''}`}
                </span>
              ) : (
                eventName
              )}
              &nbsp; • {howLongAgo(time)}
              {edited && <p className={'edited'}> Edited</p>}
            </p>
            <div className={styles.reportDeleteContainer}>
              <ReportAndDeleteOverlay
                canDelete={this.canDelete}
                deletePost={this.deletePost}
                blockPost={this.blockPost}
                streamID={streamID}
                posterID={actorID}
                type="post"
                text={text}
                tagged={tagged}
                image={post_image}
                eventStatusPost={eventID === true}
                eventID={eventID || null}
                groupID={groupID || null}
                mergeNewPost={this.initializeScreen}
              />
            </div>
          </div>
          <div className={styles.userPostContainer}>
            {workoutEventName ? (
              <ShareChallengeBox
                eventName={workoutEventName}
                chapterName={chapterName}
                eventStartTime={eventStartTime}
                miles={miles}
                steps={steps}
                hours={hours}
                minutes={minutes}
                seconds={seconds}
              />
            ) : null}
            <FormattedPostText
              text={text}
              tagged={tagged}
              linkableUsers={false}
              history={history}
              clickable={true}
            />
            {post_image && (
              <img
                className={styles.postImage}
                src={post_image}
                alt="User Post Image"
                onClick={() => this.setState({isModalOpen: true})}
              />
            )}
            <div className={styles.reactionContainer}>
              <div
                className={styles.likeContainer}
                onClick={this.handleLikeClicked}>
                <LikeIcon
                  className={styles.likeIcon}
                  tintColor={liked ? 'var(--magenta)' : null}
                />
                <p>{likeAmount > 0 && likeAmount}</p>
              </div>
              {commentAmount !== undefined && (
                <p>{`${commentAmount} ${
                  commentAmount != 1 ? 'comments' : 'comment'
                }`}</p>
              )}
            </div>
          </div>

          <SeePreviousComments
            refreshing={refreshing}
            onClick={this.loadMoreReactions}
            allCommentsLoaded={allCommentsLoaded}
          />

          <div
            className={styles.commentsContainer}
            ref={(el) => (this.commentsRef = el)}>
            {comments.length > 0 &&
              comments.map((comm) => (
                <CommentView
                  key={comm.comment_id}
                  user={comm.user}
                  time={comm.time}
                  content={comm.content}
                  tagged={comm.tagged}
                  postID={streamID}
                  commentID={comm.comment_id}
                  posterID={poster.id}
                  eventID={eventID || null}
                  handleCommentDeletion={this.handleCommentDeletion}
                  poster={poster}
                  posterText={text}
                  posterTagged={tagged}
                  posterTime={time}
                  refreshReactions={this.refreshReactions}
                  edited={comm.edited}
                />
              ))}
          </div>
        </div>
        {!userProfile.getUserProfile().anonymous_profile && (
          <CreateCommentBar
            poster={poster}
            streamID={streamID}
            verbEvent={title || eventName}
            time={howLongAgo(time)}
            text={text}
            tagged={tagged}
            history={history}
            postImage={post_image}
            refreshReactions={this.refreshReactions}
            workout={{
              eventName: workoutEventName,
              chapterName: chapterName,
              eventStartTime: eventStartTime,
              miles: miles,
              steps: steps,
              hours: hours,
              minutes: minutes,
              seconds: seconds,
            }}
          />
        )}
        {isModalOpen && (
          <PhotoView
            post_image={post_image}
            onModalClose={() => this.setState({isModalOpen: false})}
            liked={liked}
            likeAmount={likeAmount}
            onLikeClicked={this.handleLikeClicked}
          />
        )}
      </>
    ) : null;
  }
}

export default withRouter(PostView);
