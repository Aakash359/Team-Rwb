import {IconButton, Paper, Toolbar, withStyles} from '@material-ui/core';
import debounce from 'lodash.debounce';
import React, {Component} from 'react';
import {rwbApi} from '../../../../shared/apis/api';
import {
  isNullOrEmpty,
  validTaggedUsers,
} from '../../../../shared/utils/Helpers';
import Loading from '../Loading';
import PostIcon from '../svgs/PostIcon';
import XIcon from '../svgs/XIcon';
import TextArea from '../TextArea';
import styles from './CreateComment.module.css';
import FormattedPostText from './FormattedPostText';
import ShareChallengeBox from './ShareChallengeBox';
import UsersList from './UsersList';

const DEBOUNCE_MS = 500;

const _styles = {
  root: {
    flexGrow: 1,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'var(--magenta)',
    height: 64,
  },
};

class CreateComment extends Component {
  state = {
    isLoading: false,
    commentText: this.props.posterText ? this.props.text : '',
    taggedUsers: this.props.tagged || [],
    atLocation: null,
    searchingUsers: false,
    userSearchLoading: null,
    userResults: [],
  };

  apiUserSearch = (text) => {
    rwbApi.searchUser(text).then((result) => {
      this.setState({userResults: result, userSearchLoading: false});
    });
  };

  handleTextInput = (text) => {
    const {searchingUsers, atLocation} = this.state;
    // TODO: Handle backspacing early in the post while searching for users
    // TODO: Highlight color of valid user, could not find colors specific parts of text input while making it editable.
    // Once this is determined, validTaggedUsers could be modified to display valid users with the proper color
    this.setState({commentText: text});
    // elastic search with value after @
    if (text.charAt(text.length - 1) === '@' && !searchingUsers) {
      this.setState({searchingUsers: true, atLocation: text.length});
    }

    if (searchingUsers) {
      // if the user deletes the "@" symbol, stop searching
      if (text.charAt(atLocation - 1) !== '@') {
        this.setState({searchingUsers: false, atLocation: null});
      } else this.searchUser(text.slice(atLocation));
    }
  };

  updateOptions = debounce(this.apiUserSearch, DEBOUNCE_MS);

  searchUser = (text) => {
    this.setState({inputText: text, userSearchLoading: true});
    this.updateOptions(text);
  };

  handleSelectedUser = (user) => {
    // access tagged users without mutating the array directly
    let taggedUsers = [...this.state.taggedUsers];
    let commentText = this.state.commentText;
    const name = user.name;
    user.first_name = name.split(' ').slice(0, -1).join(' ');
    user.last_name = name.split(' ').slice(-1).join(' ');
    taggedUsers.push(user);
    commentText = commentText.replace(this.state.inputText, user.name);
    this.setState({
      searchingUsers: false,
      userResults: [],
      taggedUsers,
      commentText,
    });
  };

  submitComment = () => {
    const {commentText, taggedUsers} = this.state;
    const {poster, streamID, closeModalHandler} = this.props;
    const validatedTaggedUsers = validTaggedUsers(taggedUsers, commentText);

    if (isNullOrEmpty(commentText)) {
      alert('Unable to post an empty comment.');
      return;
    }

    this.setState({isLoading: true});
    const data = {
      kind: 'comment',
      content: commentText,
      tagged: validatedTaggedUsers,
    };
    if (this.props.posterText) {
      rwbApi
        .updateReaction(
          poster.id,
          streamID,
          JSON.stringify(data),
          this.props.commentID,
        )
        .then((result) => {
          this.setState({isLoading: false});
          let commentData = result.reaction.data;
          commentData.tagged = taggedUsers;
          closeModalHandler(false, commentData);
        })
        .catch((err) => {
          this.setState({isLoading: false});
          alert('Unable to update your comment. Please try again later.');
        });
    } else {
      rwbApi
        .postReaction(poster.id, streamID, JSON.stringify(data))
        .then(() => {
          this.setState({isLoading: false});
          closeModalHandler(true);
        })
        .catch((err) => {
          this.setState({isLoading: false});
          alert('Unable to post your comment. Please try again later.');
        });
    }
  };

  render() {
    const {
      classes,
      closeModalHandler,
      poster,
      verbEvent,
      time,
      text,
      tagged,
      history,
      postImage,
    } = this.props;
    const {
      isLoading,
      commentText,
      searchingUsers,
      userResults,
      userSearchLoading,
    } = this.state;
    return (
      <div className={styles.container}>
        <Loading size={100} color={'var(--white)'} loading={isLoading} />
        <Paper className={classes.root}>
          <Toolbar className={classes.toolbar}>
            <IconButton
              onClick={() => closeModalHandler(false)}
              className={classes.menuButton}
              color="inherit">
              <XIcon tintColor="var(--white)" />
            </IconButton>
            <p className="title">Comment</p>
            <IconButton
              onClick={this.submitComment}
              className={classes.menuButton}
              color="inherit">
              <PostIcon />
            </IconButton>
          </Toolbar>
        </Paper>

        <div className={styles.content}>
          <div className={styles.postContainer}>
            <div className={styles.namePostContainer}>
              <div>
                <span className="namesAndObjects">
                  {`${poster.first_name} ${poster.last_name}`}&nbsp;
                </span>
                {verbEvent}&nbsp;•&nbsp;{time}
              </div>

              <div className={styles.textImageContainer}>
                {this.props?.workout?.eventName ? (
                  <ShareChallengeBox
                    eventName={this.props.workout.eventName}
                    chapterName={this.props.workout.chapterName}
                    eventStartTime={this.props.workout.eventStartTime}
                    miles={this.props.workout.miles}
                    steps={this.props.workout.steps}
                    hours={this.props.workout.hours}
                    minutes={this.props.workout.minutes}
                    seconds={this.props.workout.seconds}
                  />
                ) : null}
                <FormattedPostText
                  text={this.props.posterText || text}
                  tagged={tagged}
                  linkableUsers={false}
                  history={history}
                  clickable={true}
                />
                {postImage && (
                  <img
                    className={styles.postImage}
                    src={postImage}
                    alt="User Post Image"
                    onClick={() => this.setState({isModalOpen: true})}
                  />
                )}
              </div>
            </div>
          </div>
          <TextArea
            placeholder="Your comment"
            value={commentText}
            onChange={this.handleTextInput}
            autoFocus={true}
            taggedUsers={this.state.taggedUsers}
          />
          {searchingUsers && (
            <div className={styles.usersListContainer}>
              <UsersList
                usersSuggestions={userResults}
                loadingUsers={userSearchLoading}
                onSelect={this.handleSelectedUser}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(_styles)(CreateComment);
