import React, {Component} from 'react';
import styles from './CommentView.module.css';
import DefaultProfileImg from '../../../../shared/images/DefaultProfileImg.png';
import LikeIcon from '../svgs/LikeIcon';
import ReportAndDeleteOverlay from '../ReportAndDeleteOverlay';
import {howLongAgo} from '../../../../shared/utils/Helpers';
import {withRouter} from 'react-router-dom';
import FormattedPostText from './FormattedPostText';
import {userProfile} from '../../../../shared/models/UserProfile';
import {rwbApi} from '../../../../shared/apis/api';

class CommentView extends Component {
  constructor(props) {
    super(props);
    const {content, tagged, edited} = this.props;
    this.state = {
      deleted: false,
      content,
      tagged,
      edited,
    };
  }

  // only the creator of a post can delete
  canDelete = () => {
    const commenterID = this.props.user.id.toString();
    const currentUserID = userProfile.getUserProfile().id.toString();
    return commenterID === currentUserID;
  };

  deleteComment = () => {
    if (
      window.confirm(
        'Delete Comment: Are you sure you want to delete your comment?',
      )
    ) {
      const reactionKind = JSON.stringify({kind: 'comment'});
      rwbApi
        .deleteReaction(
          this.props.posterID,
          this.props.postID,
          reactionKind,
          this.props.commentID,
        )
        .then(() => {
          this.props.handleCommentDeletion();
          this.setState({deleted: true});
        });
    }
  };

  updateComment = (data) => {
    this.setState({
      content: data.content,
      tagged: data.tagged,
      edited: true,
    });
  };

  render() {
    const {history, user, time} = this.props;
    const {content, tagged, edited} = this.state;
    return !this.state.deleted ? (
      <div className={styles.commentContainer}>
        <div className={styles.userCommentContainer}>
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
            <span
              className={`namesAndObjects ${styles.name}`}
              onClick={() => history.push(`/profile/${user.id}`)}>
              {`${user.first_name} ${user.last_name}`}&nbsp;
            </span>
            • {howLongAgo(time) || ''}
            {edited && <p className={'edited'}> Edited</p>}
          </p>
          <div className={styles.reportDeleteContainer}>
            <ReportAndDeleteOverlay
              updateComment={this.updateComment}
              canDelete={this.canDelete}
              deletePost={this.deleteComment}
              streamID={this.props.postID}
              posterID={this.props.posterID}
              commentID={this.props.commentID}
              text={content}
              type="comment"
              eventStatusPost={false}
              tagged={tagged}
              mergeNewPost={() => null}
              poster={this.props.poster}
              time={howLongAgo(this.props.time)}
              posterText={this.props.posterText}
              posterTagged={this.props.posterTagged}
              posterTime={this.props.posterTime}
              refreshReactions={this.props.refreshReactions}
            />
          </div>
        </div>
        <div className={styles.commentText}>
          <FormattedPostText
            text={content}
            tagged={tagged}
            linkableUsers={false}
            history={history}
            clickable={true}
          />
        </div>
      </div>
    ) : null;
  }
}

export default withRouter(CommentView);
