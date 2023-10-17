import React, {Component} from 'react';
import styles from './NotificationListItem.module.css';
import DefaultProfileImg from '../../../../shared/images/DefaultProfileImg.png';
import {howLongAgo} from '../../../../shared/utils/Helpers';
import {withRouter} from 'react-router-dom';
import Loading from '../Loading';
import {userProfile} from '../../../../shared/models/UserProfile';
import {logAccessNotification} from '../../../../shared/models/Analytics';

class NotificationListItem extends Component {
  constructor(props) {
    super(props);

    const data = props.item.activities[0];
    this.state = {
      data,
      photoClickable: data.actor_user
        ? data.actor_user.public_profile
        : data.user.public_profile,
      photoClickId: data.actor_user ? data.actor_user.id : data.user.id,
      isFollowing: data.is_following || null,
    };

    this.currentUser = userProfile.getUserProfile();
  }

  renderProfilePhoto = (data) =>
    data.actor_user
      ? data.actor_user.profile_photo_url
      : data.user.profile_photo_url;

  renderActorName = (data) => {
    const actorUserName = data.actor_user?.first_name
      ? `${data.actor_user.first_name} ${data.actor_user.last_name}`
      : 'Deleted Member';
    const userName = data.user?.first_name
      ? `${data.user.first_name} ${data.user.last_name}`
      : 'Deleted Member';
    if (data.verb === 'follow') {
      return `${actorUserName}`;
    } else if (
      data.verb === 'update' ||
      data.verb === 'cancel' ||
      data.verb === 'post'
    )
      return `${userName}`;
    else if (data.verb === 'like' || data.verb === 'comment')
      return `${userName}`;
    else if (data.verb === 'tag') return `${actorUserName}`;
  };

  renderAction = (data) => {
    if (data.verb === 'follow') return 'started following you';
    else if (data.verb === 'update' || data.verb === 'cancel')
      return `${data.verb === 'update' ? 'updated' : 'canceled'} the event`;
    else if (data.verb === 'like' || data.verb === 'comment')
      return `${data.verb === 'like' ? 'liked' : 'commented on'} your post`;
    else if (data.verb === 'tag') {
      const type = data.comment_id ? 'comment' : 'post';
      let mentionText;
      if (data.event_id) mentionText = 'on an event';
      else if (data.group_id) mentionText = 'in a group';
      else mentionText = `in a ${type}`;
      return `mentioned you ${mentionText}`;
    } else if (data.verb === 'post') {
      return 'posted on your event';
    }
  };

  renderSpecificText = (data) => {
    if (
      data.verb === 'update' ||
      data.verb === 'cancel' ||
      data.verb === 'post'
    )
      return data.event.name;
    else return '';
  };

  userProfileClickHandler = () => {
    const {photoClickable, photoClickId, data} = this.state;
    if (!data.actor_user?.id && !data.user?.id) {
      return;
    }
    if (photoClickable && photoClickId) {
      this.props.history.push(`/profile/${photoClickId}`);
    } else {
      alert('This user has set their profile to anonymous.');
    }
  };

  notificationClickHandler = () => {
    const {data} = this.state;
    const {history} = this.props;
    // actor_user.id or user.id could be null because of a deleted account
    if (
      (!data.actor_user?.id &&
        (data.verb === 'follow' || data.verb === 'tag')) ||
      (!data.user?.id &&
        (data.verb === 'update' ||
          data.verb === 'cancel' ||
          data.verb === 'like' ||
          data.verb === 'comment' ||
          data.verb === 'replied' ||
          data.verb === 'post'))
    ) {
      return;
    }
    logAccessNotification();
    if (data.verb === 'follow') {
      this.userProfileClickHandler();
    }
    // both update and cancel navigate to an event
    else if (data.verb === 'update' || data.verb === 'cancel') {
      history.push(`/events/${data.event.id}`);
    } else if (
      data.verb === 'like' ||
      data.verb === 'comment' ||
      data.verb === 'replied'
    ) {
      const streamID = data.object.split(':')[1];
      history.push({
        pathname: `/feed/${streamID}`,
        state: {
          poster: this.currentUser,
          time: data.time,
          streamID,
          postID: data.id,
          previousScreen: 'notifications',
        },
      });
    } else if (data.verb === 'tag') {
      if (data.event_id) {
        history.push(`/events/${data.event.id}`);
      } else {
        const streamID = data.post_id;
        history.push({
          pathname: `/feed/${streamID}`,
          state: {
            poster: data.comment_id ? {id: data.author_id} : data.actor_user,
            time: data.time,
            streamID,
            postID: data.id,
            previousScreen: 'notifications',
            commentID: data.comment_id,
          },
        });
      }
    } else if (data.verb === 'post') {
      const streamID = data.post_id;
      history.push({
        pathname: `/feed/${streamID}`,
        state: {
          poster: data.user,
          time: data.time,
          streamID,
          postID: data.id,
          previousScreen: 'notifications',
        },
      });
    }
  };

  render() {
    const {data, isFollowing} = this.state;
    return (
      <div className={styles.container} onClick={this.notificationClickHandler}>
        <div
          className={styles.userImageContainer}
          onClick={(e) => {
            e.stopPropagation();
            this.userProfileClickHandler();
          }}>
          <img
            className={styles.profileImage}
            src={this.renderProfilePhoto(data) || DefaultProfileImg}
            alt="User Profile Image"
          />
        </div>
        <p className={styles.textContainer}>
          <span
            className="namesAndObjects"
            onClick={(e) => {
              e.stopPropagation();
              this.userProfileClickHandler();
            }}>
            {this.renderActorName(data)}&nbsp;
          </span>
          {this.renderAction(data)}&nbsp;
          <span className="namesAndObjects">
            {this.renderSpecificText(data)}&nbsp;
          </span>
          • {howLongAgo(data.time)}
        </p>
        {data.verb === 'follow' && data.actor_user.public_profile && (
          <div
            className={`${styles.followContainer} ${
              !isFollowing && styles.unFollowContainer
            }`}
            onClick={(e) => {
              e.stopPropagation();
              this.props.updateFollowingStatus(data.actor_user.id, isFollowing);
            }}>
            <p>{isFollowing ? 'Unfollow' : 'Follow'}</p>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(NotificationListItem);
