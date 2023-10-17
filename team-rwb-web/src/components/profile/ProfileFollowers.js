import React, {useState, useEffect} from 'react';
import styles from './ProfileFollowers.module.css';
import {
  Paper,
  Toolbar,
  IconButton,
  makeStyles,
  Tabs,
  Tab,
  Grid,
} from '@material-ui/core';
import XIcon from '../svgs/XIcon';
import {useHistory, useLocation} from 'react-router-dom';
import {userProfile} from '../../../../shared/models/UserProfile';
import {rwbApi} from '../../../../shared/apis/api';
import DefaultProfileImg from '../../../../shared/images/DefaultProfileImg.png';
import {MdStar as StarIcon} from 'react-icons/md';
import Loading from '../Loading';
import {ClipLoader} from 'react-spinners';
import {logUnfollow, logFollow} from '../../../../shared/models/Analytics';
import {hasReachedBottom} from '../../BrowserUtil';
import ReusableTabs from '../ReusableTabs';
import {isValidFollowing} from '../../../../shared/utils/Helpers';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    boxShadow: '0px 0px 0px 0px',
    position: 'sticky',
  },
  menuButton: {
    color: 'var(--white)',
  },
  title: {
    color: 'var(--white)',
    textTransform: 'capitalize',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    backgroundColor: 'var(--magenta)',
    height: 64,
  },
  button: {
    color: 'white',
    textTransform: 'capitalize',
  },
  iconLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    fontWeight: 'bold',
    color: 'var(--grey)',
  },
  iconLabelWrapperSelected: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    fontWeight: 'bold',
    color: 'var(--magenta)',
  },
  tabs: {
    borderBottom: '1px solid var(--grey20)',
  },
  indicator: {
    backgroundColor: 'var(--magenta)',
    border: null,
    borderColor: null,
  },
}));

const ProfileFollowers = () => {
  const location = useLocation();

  const [selectedValue, setSelectedValue] = useState(location.state.index);
  const [isLoading, setIsLoading] = useState(true);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [retrievedLastFollower, setRetrievedLastFollower] = useState(false);
  const [retrievedLastFollowing, setRetrievedLastFollowing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const classes = useStyles();
  const selectedUserID =
    location.state.selectedUserID || userProfile.getUserProfile().id;
  const loggedInID = userProfile.getUserProfile().id;
  const history = useHistory();

  // events are followed, but we don't want to display them
  // this is used to determine the length of valid following as we save the undisplayed ones to check for length
  const filterFollowing = (following) => {
    return following.filter((followingObj) => followingObj.user.first_name);
  };

  useEffect(() => {
    getFollowersList(0).then((followers) => {
      setFollowersList(followers);
      selectedValue === 0 && setIsLoading(false);
      getFollowingList(0).then((following) => {
        setFollowingList(following);
        setIsLoading(false);
        if (
          following.length > filterFollowing(following).length &&
          following.length === 10
        ) {
          handleInitialFollowing(following);
        }
      });
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', trackScrolling);
    return () => {
      window.removeEventListener('scroll', trackScrolling);
    };
  }, [followersList, followingList, selectedValue]);

  useEffect(() => {
    if (retrievedLastFollower) handleLoadMore('followers');
  }, [retrievedLastFollower]);

  useEffect(() => {
    if (retrievedLastFollowing) handleLoadMore('following');
  }, [retrievedLastFollowing]);

  const trackScrolling = (event) => {
    event.preventDefault();
    const wrappedElement = document.getElementById('root');
    if (hasReachedBottom(wrappedElement)) {
      selectedValue === 0
        ? setRetrievedLastFollower(true)
        : setRetrievedLastFollowing(true);
    }
  };

  const onChangeHandler = (index) => setSelectedValue(index);

  const getFollowersList = (offset) => {
    return rwbApi
      .getFollows(selectedUserID, 'followers', offset)
      .then((result) => {
        return result;
      });
  };

  const getFollowingList = (offset) => {
    return rwbApi
      .getFollows(selectedUserID, 'following', offset)
      .then((result) => {
        return result;
      });
  };

  const updateFollowStateFollowers = (id, isFollowing) => {
    if (isFollowing) {
      rwbApi
        .unfollowUser(id)
        .then(() => {
          let followersListTemp = followersList.filter((item) => {
            if (item.user.id === id) {
              item.following = false;
            }
            return item;
          });
          setFollowersList(followersListTemp);
          logUnfollow();
        })
        .catch((error) => {
          console.error(error);
          const callbackArr = setFollowersList(...followersList);
          setFollowersList(callbackArr);
        });
    } else {
      const followedUser = followersList.find((item) => item.user.id === id);
      followedUser.following = true;
      rwbApi
        .followUser(id)
        .then(() => {
          let followersListTemp = followersList.filter((item) => {
            if (item.user.id === id) item.following = true;
            return item;
          });
          setFollowersList(followersListTemp);
          logFollow();
        })
        .catch((error) => {
          console.error(error);
          followedUser.following = false;
          const newFollowersArr = [...followersList, followedUser];
          setFollowersList(newFollowersArr);
        });
    }
  };

  const updateFollowStateFollowing = (id, isFollowing) => {
    if (isFollowing) {
      rwbApi
        .unfollowUser(id)
        .then(() => {
          let followingListTemp = followingList.filter((item) => {
            if (item.user.id === id) {
              item.following = false;
            }
            return item;
          });
          setFollowingList(followingListTemp);
          logUnfollow();
        })
        .catch((error) => {
          console.error(error);
          const callbackArr = setFollowingList(...followingList);
          setFollowingList(callbackArr);
        });
    } else {
      const followedUser = followingList.find((item) => item.user.id === id);
      followedUser.following = true;
      rwbApi
        .followUser(id)
        .then(() => {
          let followingListTemp = followingList.filter((item) => {
            if (item.user.id === id) item.following = true;
            return item;
          });
          setFollowingList(followingListTemp);
          logFollow();
        })
        .catch((error) => {
          console.error(error);
          followedUser.following = false;
          const newFollowingArr = [...followingList, followedUser];
          setFollowingList(newFollowingArr);
        });
    }
  };

  const selectUserHandler = (user) => {
    if (!user.public_profile)
      alert('This user has set their profile to anonymous.');
    else history.push(`/profile/${user.id}`);
  };

  const handleLoadMore = (relation) => {
    if (relation === 'followers') {
      if (retrievedLastFollower) {
        setIsLoadingMore(true);
        getFollowersList(followersList.length).then((result) => {
          if (result.length > 0) {
            let newFollowersList = [...followersList, ...result];
            setFollowersList(newFollowersList);
            setRetrievedLastFollower(false);
            setIsLoadingMore(false);
          } else {
            setIsLoadingMore(false);
          }
        });
      }
    } else {
      if (retrievedLastFollowing) {
        setIsLoadingMore(true);
        getFollowingList(followingList.length).then((result) => {
          if (result.length > 0) {
            let newFollowingList = [...followingList, ...result];
            setFollowingList(newFollowingList);
            setRetrievedLastFollowing(false);
            setIsLoadingMore(false);
          } else {
            setIsLoadingMore(false);
          }
        });
      }
    }
  };

  // used at the start to ensure the following list is populated enough to be scrollable and continue loading more
  // this is needed because events are followed, but they should not be displayed
  const handleInitialFollowing = (following) => {
    setIsLoadingMore(true);
    getFollowingList(following.length).then((result) => {
      if (result.length > 0) {
        let newFollowingList = [...following, ...result];
        setFollowingList(newFollowingList);
        if (filterFollowing(newFollowingList).length < 10) {
          handleInitialFollowing(newFollowingList);
        } else {
          setRetrievedLastFollowing(false);
          setIsLoadingMore(false);
        }
      } else {
        setIsLoadingMore(false);
      }
    });
  };

  return (
    <Paper className={classes.root}>
      <Toolbar className={classes.toolbar}>
        <IconButton
          onClick={() => history.goBack()}
          className={classes.menuButton}
          color="inherit">
          <XIcon tintColor={'var(--white)'} />
        </IconButton>
      </Toolbar>
      <ReusableTabs
        selectedValue={selectedValue}
        values={['followers', 'following']}
        onChangeHandler={onChangeHandler}>
        <div id={'root'} className={styles.container}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <Loading
                size={60}
                color={'var(--grey40)'}
                loading={true}
                transparent
              />
            </div>
          ) : (
            <>
              {selectedValue === 0 ? (
                <>
                  {followersList.length > 0 &&
                    followersList.map((item, i) => {
                      const {user} = item;
                      return user.id ? (
                        <UserCard
                          user={user}
                          key={i}
                          onSelect={selectUserHandler}
                          followable={
                            loggedInID !== user.id && user.public_profile
                          }
                          following={item.following}
                          onFollow={updateFollowStateFollowers}
                        />
                      ) : null;
                    })}
                </>
              ) : (
                <>
                  {followingList.length > 0 &&
                    followingList.map((item, i) => {
                      const {user} = item;
                      // users follow events when they set a status on one
                      /* in order to keep the offset proper for loading more events, these event follows
                    will still be saved, but not displayed */
                      return isValidFollowing(item) && user.id ? (
                        <UserCard
                          user={user}
                          key={i}
                          onSelect={selectUserHandler}
                          followable={
                            loggedInID !== user.id && user.public_profile
                          }
                          following={item.following}
                          onFollow={updateFollowStateFollowing}
                        />
                      ) : null;
                    })}
                </>
              )}
              <Grid container justify={'center'}>
                <ClipLoader
                  size={60}
                  color={'var(--grey20)'}
                  loading={isLoadingMore}
                />
              </Grid>
            </>
          )}
        </div>
      </ReusableTabs>
    </Paper>
  );
};

const UserCard = ({user, onSelect, followable, following, onFollow}) => {
  return (
    <div className={styles.userContainer} onClick={() => onSelect(user)}>
      <div className={styles.leftContainer}>
        <img
          className={styles.profileImg}
          src={user.profile_photo_url || DefaultProfileImg}
          alt={'User Profile'}
        />
        <div className={styles.textContainer}>
          <div className={styles.inlineContainer}>
            <h3>{`${user.first_name} ${user.last_name}`}</h3>
            {user.eagle_leader && <StarIcon className={styles.starIcon} />}
          </div>
          {user.eagle_leader && (
            <h5 className={styles.eagleLeaderText}>{'Eagle Leader'}</h5>
          )}
          <p>{user.preferred_chapter.name}</p>
          <p>
            {`${
              user.military_status !== null &&
              user.military_status !== 'Unknown'
                ? user.military_status
                : ''
            } ${
              user.military_branch !== null && user.military_branch !== 'n/a'
                ? ` / ${user.military_branch}`
                : ''
            }`}
          </p>
        </div>
      </div>
      {followable && (
        <div
          className={`${styles.followContainer} ${
            !following && styles.unFollowContainer
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onFollow(user.id, following);
          }}>
          <p>{following ? 'Unfollow' : 'Follow'}</p>
        </div>
      )}
    </div>
  );
};

export default ProfileFollowers;
