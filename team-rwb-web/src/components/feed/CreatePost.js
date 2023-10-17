import React, {useState} from 'react';
import styles from './CreatePost.module.css';
import feedListItemStyles from './FeedListItem.module.css';

import {Toolbar, IconButton, makeStyles, Paper} from '@material-ui/core';
import TextArea from '../TextArea';

import PostIcon from '../svgs/PostIcon';
import XIcon from '../svgs/XIcon';
import GalleryIcon from '../svgs/GalleryIcon';

import {rwbApi} from '../../../../shared/apis/api';
import {
  getBlobFromLocalURI,
  isNullOrEmpty,
} from '../../../../shared/utils/Helpers';
import Loading from '../Loading';
import UsersList from './UsersList';
import {userProfile} from '../../../../shared/models/UserProfile';
import imageHandler from '../ImageHandler';
import {
  logFeedCreatePost,
  logEventCreatePost,
} from '../../../../shared/models/Analytics';
import ShareChallengeBox from './ShareChallengeBox';

const CreatePost = ({
  eventID = null,
  groupID = null,
  challengeID = null,
  type,
  mergeNewPost,
  closeModalHandler,
  text,
  image,
  tagged,
  id,
  eventName,
  chapterName,
  eventStartTime,
  miles,
  steps,
  hours,
  minutes,
  seconds,
}) => {
  const [postText, setPostText] = useState(text || '');
  const [postImage, setPostImage] = useState(image || null);
  const [postImageName, setPostImageName] = useState('');
  const [postImageFile, setPostImageFile] = useState({});
  const [postTagged, setPostTagged] = useState(tagged || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(null);
  const [userInput, setUserInput] = useState(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [tallImg, setTallImg] = useState(false);
  const [postID, setPostID] = useState(id || null);

  const useStyles = makeStyles(() => ({
    root: {
      flexGrow: 1,
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      backgroundColor: 'var(--magenta)',
      height: 64,
    },
  }));
  const classes = useStyles();

  const onImgLoad = ({target: img}) => {
    setTallImg(img.offsetWidth / img.offsetHeight < 0.75);
  };

  const textChangeHandler = (value) => {
    // TODO: Handle backspacing early in the post while searching for users
    // TODO: Highlight color of valid user, could not find colors specific parts of text input while making it editable.
    // Once this is determined, validTaggedUsers could be modified to display valid users with the proper color
    setPostText(value);

    // elastic search with value after @
    if (value.charAt(value.length - 1) === '@' && !searchingUsers) {
      setSearchingUsers(true);
      setSearchingLocation(value.length);
    }

    if (searchingUsers) {
      // if the user deletes the "@" symbol, stop searching
      if (value.charAt(searchingLocation - 1) !== '@') {
        setSearchingUsers(false);
        setSearchingLocation(null);
      } else searchUser(value.slice(searchingLocation));
    }
  };

  const searchUser = (text) => {
    setIsLoadingUsers(true);
    rwbApi.searchUser(text).then((result) => {
      setUserInput(text);
      setUserResults(result);
      setIsLoadingUsers(false);
    });
  };

  const handleSelectedUser = (user) => {
    let taggedUsers = postTagged;
    let fullPostText = postText;
    taggedUsers.push(user);
    const lastIndex = fullPostText.lastIndexOf(`@${userInput}`);
    fullPostText = fullPostText.slice(0, lastIndex) + `@${user.name}`;
    // the font looks like a space is added, which could cause users to send invalid data
    // to prevent this, add an space after selecitng a tagged user
    fullPostText += ' ';
    setSearchingUsers(false);
    setUserResults([]);
    setPostTagged(taggedUsers);
    setPostText(fullPostText);
  };

  const addImageHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
      reader.onload = () => {
        setPostImage(reader.result);
        setPostImageName(file.name);
        setPostImageFile(file);
      };
      reader.onloadstart = () => setIsLoadingImage(true);
      reader.onloadend = () => {
        setIsLoadingImage(false);
      };
    }
  };

  const removeImageHandler = () => {
    setPostImage(null);
    setPostImageName('');
  };

  // only return users who did not have their name partially deleted and did not have the "@" sign removed
  const validTaggedUsers = () => {
    const taggedUsers = postTagged;
    const fullPostText = postText;
    let validIDs = [];
    for (let i = 0; i < taggedUsers.length; i++) {
      if (fullPostText.includes(`@${taggedUsers[i].name}`))
        validIDs.push(taggedUsers[i].id);
    }
    return validIDs;
  };

  const createPostHandler = () => {
    const tagged = validTaggedUsers();
    // image files objects have a name field, so only try and go through the upload flow if it is present
    if (postImageFile && postImageFile.name) {
      setIsLoading(true);
      imageHandler(postImageFile, 'post')
        .then((result) => {
          const data = {
            media_url: result,
            text: postText,
            tagged: tagged,
          };
          if (postID) updateFeed(data);
          else putFeed(data);
        })
        .catch((error) => {
          // Unable to retrieve the upload URL
          setIsLoading(false);
          alert('Error uploading post image to Team RWB Servers.');
        });
    } else if (!isNullOrEmpty(postText)) {
      setIsLoading(true);
      const data = {
        text: postText,
        tagged: tagged,
      };
      if (challengeID) {
        const duration = (
          parseInt(hours || 0) * 60 +
          parseInt(minutes || 0) +
          parseInt(seconds || 0) / 60
        ).toString();
        const workout = {
          event_id: parseInt(eventID),
          event_name: eventName,
          chapter_name: chapterName,
          event_start_time: eventStartTime,
          miles: miles,
          steps: steps,
          minutes: duration,
        };
        data.workout = workout;
      }
      if (postID) {
        if (postImage) updateFeed({...data, media_url: postImage});
        else updateFeed(data);
      } else putFeed(data);
    } else {
      alert('Unable to upload an empty post!');
      setIsLoading(false);
      return;
    }
  };

  const handlePostMade = (user) => {
    // retrieving the feed after so the post is in existence and can be reacted to
    // (small delay to ensure stream gets the post)
    setTimeout(
      () =>
        rwbApi.getUserFeed(user.id).then(() => {
          setIsLoading(false);
          mergeNewPost();
          closeModalHandler();
        }),
      100,
    );
  };

  const putFeed = (data) => {
    const user = userProfile.getUserProfile();
    if (type === 'user') {
      return rwbApi
        .putFeed(JSON.stringify(data))
        .then(() => {
          logFeedCreatePost();
          handlePostMade(user);
        })
        .catch((err) => {
          setIsLoading(false);
          alert('Unable to upload post to RWB Servers.');
        });
    } else if (type === 'event') {
      return rwbApi
        .createEventPost(JSON.stringify(data), eventID)
        .then(() => {
          logEventCreatePost();
          handlePostMade(user);
        })
        .catch((error) => {
          setIsLoading(false);
          alert('Unable to upload post to RWB Servers.');
        });
    } else if (type === 'group') {
      return rwbApi
        .createGroupPost(JSON.stringify(data), groupID)
        .then(() => {
          handlePostMade(user);
        })
        .catch(() => {
          setIsLoading(false);
          alert('Unable to upload post to RWB Servers.');
        });
    } else if (type === 'challenge') {
      return rwbApi
        .createChallengePost(JSON.stringify(data), challengeID)
        .then(() => {
          handlePostMade(user);
        })
        .catch(() => {
          setIsLoading(false);
          alert('Unable to upload post to RWB Servers.');
        });
    }
  };

  const updateFeed = (data) => {
    const user = userProfile.getUserProfile();
    return rwbApi
      .updatePost(JSON.stringify(data), postID)
      .then((result) => {
        handlePostMade(user);
      })
      .catch((error) => {
        setIsLoading(false);
        alert('Unable to update post to RWB Servers.');
      });
  };

  return (
    <div className={styles.container}>
      <Loading size={100} color={'var(--white)'} loading={isLoading} />
      <Paper className={classes.root}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            onClick={closeModalHandler}
            className={classes.menuButton}
            color="inherit">
            <XIcon tintColor="var(--white)" />
          </IconButton>
          <p className="title">Post</p>
          <IconButton
            onClick={createPostHandler}
            className={classes.menuButton}
            color="inherit">
            <PostIcon />
          </IconButton>
        </Toolbar>
      </Paper>
      <div className={styles.content}>
        {eventName && (
          <div className={styles.shareChallengeBoxWrapper}>
            <ShareChallengeBox
              eventName={eventName}
              chapterName={chapterName}
              eventStartTime={eventStartTime}
              miles={miles}
              steps={steps}
              hours={hours}
              minutes={minutes}
              seconds={seconds}
            />
          </div>
        )}
        <TextArea
          placeholder="Write a post"
          value={postText}
          onChange={textChangeHandler}
        />
        {searchingUsers ? (
          <div className={styles.usersListContainer}>
            <UsersList
              usersSuggestions={userResults}
              loadingUsers={isLoadingUsers}
              onSelect={(user) => handleSelectedUser(user)}
            />
          </div>
        ) : null}
        {postImage && (
          <div className={styles.imgPreviewContainer}>
            <div
              className={styles.modalXContainer}
              onClick={removeImageHandler}>
              <XIcon tintColor={'var(--magenta)'} />
            </div>
            <div
              className={
                tallImg
                  ? `${feedListItemStyles.tallContainer} ${feedListItemStyles.postImageContainer}`
                  : feedListItemStyles.postImageContainer
              }>
              <img
                src={postImage}
                alt={'Post Image'}
                className={[
                  tallImg
                    ? `${feedListItemStyles.tallImage} ${feedListItemStyles.postImage}`
                    : feedListItemStyles.postImage,
                ]}
                onLoad={onImgLoad}
              />
            </div>
          </div>
        )}
      </div>
      {!eventName && (
        <div className={styles.attachPhotoContainer}>
          <label className={styles.attachPhotoButton}>
            <GalleryIcon tintColor="var(--white)" />
            <span className={`formLabel ${styles.attachPhotoText}`}>
              Add a photo to your post
            </span>

            <input
              type="file"
              accept="image/*"
              className={styles.hideDefaultUpload}
              onChange={addImageHandler}
              onClick={(event) => {
                event.target.value = null; // this allows the same image to be selected if the user clicks the "X"
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
