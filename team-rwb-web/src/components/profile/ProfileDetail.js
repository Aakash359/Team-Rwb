import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import RWBUserImages from '../RWBUserImages';
import styles from './ProfileDetail.module.css';
import {IconButton, Grid} from '@material-ui/core';
import {useHistory, useRouteMatch} from 'react-router-dom';
import {userProfile} from '../../../../shared/models/UserProfile';
import {rwbApi} from '../../../../shared/apis/api';
import Loading from '../Loading';
import RWBMark from '../svgs/RWBMark';
import ChevronBackIcon from '../svgs/ChevronBackIcon';
import ReportIcon from '../svgs/ReportIcon';
import moment from 'moment';
import {ClipLoader} from 'react-spinners';
import FeedList from '../feed/FeedList';
import ExpandingText from '../ExpandingText';
import {
  logAccessFollowers,
  logAccessFollowing,
  logUnfollow,
  logFollow,
} from '../../../../shared/models/Analytics';
import {hasReachedBottom} from '../../BrowserUtil';
import ChallengeBadges from './ChallengeBadges';
import BlockAndReportOverlay from '../BlockAndReportOverlay';

export default function ProfileDetail() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false); // server code to see if the person is being followed
  const [isFollowed, setIsFollowed] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [chapter, setChapter] = useState('');
  // const [title, setTitle] = useState('');
  const [militaryBranch, setMilitaryBranch] = useState('');
  const [militaryRank, setMilitaryRank] = useState('');
  // const [militarySpecialty, setMilitarySpecialty] = useState('');
  const [militaryStatus, setMilitaryStatus] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [followingAmount, setFollowingAmount] = useState('-');
  const [followersAmount, setFollowersAmount] = useState('-');
  const [isEagleLeader, setIsEagleLeader] = useState(false);
  const [expirationTermOfService, setExpirationTermOfService] = useState(null);
  const [anonymousProfile, setAnonymousProfile] = useState(false);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [userFeed, setUserFeed] = useState([]);
  const [retrievedLastPost, setRetrievedLastPost] = useState(false);
  const [userBadges, setUserBadges] = useState([]);

  const loggedInUser = userProfile.getUserProfile();
  const {profileId} = useParams();
  const history = useHistory();
  const match = useRouteMatch();

  useEffect(() => {
    setIsLoading(true);
    retrieveUser()
      .then((user) => {
        setIsEagleLeader(user.eagle_leader);
        setCoverPhoto(user.cover_photo_url);
        setProfilePhoto(user.profile_photo_url);
        setFirstName(user.first_name);
        setLastName(user.last_name);
        setChapter(user.preferred_chapter.name);
        setMilitaryBranch(user.military_branch);
        setMilitaryStatus(user.military_status);
        setExpirationTermOfService(user.military_ets);
        setMilitaryRank(user.military_rank);
        setProfileBio(user.profile_bio);
        setAnonymousProfile(user.anonymous_profile);
        getUsersFollowSummary().then((fData) => {
          setFollowingAmount(fData.following);
          setFollowersAmount(fData.followers);
          getFollowerRelationship().then((followed) => {
            setIsFollowed(followed);
            getFollowingRelationship().then((following) => {
              setIsFollowing(following);
              setIsLoading(false);
            });
          });
        });
        getBadges();
        if (user.anonymous_profile)
          alert('Team RWB: This user has set their profile to private.');
        else {
          getFeed()
            .then((feed) => {
              setUserFeed(feed);
              setIsLoadingFeed(false);
            })
            .catch(() => {
              setIsLoadingFeed(false);
              alert('Error retrieving the user feed');
            });
        }
      })
      .catch((error) => {
        console.warn(error);
        setIsLoading(false);
        if (error.toString().includes('403')) {
          alert('This user has set their profile to private.');
          history.goBack();
        } else alert('There was an error retrieving the user.');
      });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', trackScrolling);
    return () => {
      window.removeEventListener('scroll', trackScrolling);
    };
  }, [userFeed]);

  useEffect(() => {
    // replacement for setState callback
    if (retrievedLastPost) handleLoadMore();
  }, [retrievedLastPost]);

  const trackScrolling = (event) => {
    event.preventDefault();
    const wrappedElement = document.getElementById('root');
    if (hasReachedBottom(wrappedElement)) {
      setRetrievedLastPost(true);
    }
  };

  const getUsersFollowSummary = () => {
    return rwbApi.getFollowSummary(profileId);
  };

  // see if this profile is following the logged in user
  const getFollowerRelationship = () => {
    return rwbApi
      .getFollowingRelationships(profileId, loggedInUser.id)
      .then((isFollowed, isFollowing) => {
        return isFollowed;
      });
  };

  // see if the logged in user is following this profile
  const getFollowingRelationship = () => {
    return rwbApi
      .getFollowingRelationships(loggedInUser.id, profileId)
      .then((isFollowing) => {
        return isFollowing;
      });
  };

  const retrieveUser = () => {
    return rwbApi.getUserByID(profileId);
  };

  const getFeed = () => {
    return rwbApi
      .getUserFeed(profileId)
      .then((result) => {
        if (result.data) {
          // ensures editing posts on other users' profiles is updated
          setUserFeed(result.data.results);
          return result.data.results;
        }
        return [];
      })
      .catch((error) => {
        console.warn('error getting feed: ', error);
      });
  };

  const getBadges = () => {
    return rwbApi
      .getUserBadges(profileId)
      .then((result) => {
        setUserBadges(result.data.badges);
      })
      .catch((error) => {
        console.warn(error);
        alert("Error retrieving user's badges.");
      });
  };

  const handleLoadMore = () => {
    const lastPost = userFeed[userFeed.length - 1];
    setIsLoadingFeed(true);
    if (retrievedLastPost && lastPost) {
      rwbApi.getUserFeed(profileId, lastPost.id).then((result) => {
        if (result.data.results.length > 0) {
          setUserFeed([...userFeed, ...result.data.results]);
          setIsLoadingFeed(false);
          setRetrievedLastPost(false);
        } else setIsLoadingFeed(false);
      });
    }
  };

  const updateFollowState = () => {
    setIsLoading(true);
    if (isFollowing) {
      rwbApi
        .unfollowUser(profileId)
        .then((result) => {
          setIsFollowing(false);
          setFollowersAmount(followersAmount - 1);
          logUnfollow();
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      rwbApi
        .followUser(profileId)
        .then((result) => {
          setIsFollowing(true);
          setFollowersAmount(followersAmount + 1);
          logFollow();
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <div id={'root'}>
      {isLoading && (
        <Loading size={100} color={'var(--white)'} loading={true} right />
      )}
      <div className={styles.userImageContainer}>
        <RWBUserImages coverPhoto={coverPhoto} profilePhoto={profilePhoto} />

        <div className={styles.navigation}>
          <div onClick={() => history.goBack()}>
            <IconButton edge="start" color="inherit">
              <ChevronBackIcon tintColor={'var(--magenta)'} />
            </IconButton>
          </div>
          {profileId !== parseInt(loggedInUser.id) ? (
            <div style={{display: 'flex', flex: 1, justifyContent: 'flex-end'}}>
              <BlockAndReportOverlay
                loggedInUser={loggedInUser}
                profileId={profileId}
              />
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.inlineContainer}>
          <div className={styles.nameContainer}>
            <h1>{`${firstName} ${lastName} `}</h1>
            {isEagleLeader && (
              <RWBMark tintColor={'var(--navy)'} width={40} height={18} />
            )}
            {isFollowed && (
              <h5 className={styles.followsYouText}> follows you</h5>
            )}
          </div>
        </div>

        <h2>{chapter}</h2>
        {isEagleLeader && (
          <h5 className={styles.eagleLeaderText}>Eagle Leader</h5>
        )}

        <div className={styles.profileActions}>
          {!anonymousProfile && loggedInUser.id !== parseInt(profileId) && (
            <div
              className={`${styles.followButton} ${
                isFollowing && styles.followButtonFollowed
              }`}
              onClick={updateFollowState}>
              <div>{isFollowing ? 'Unfollow' : 'Follow'}</div>
            </div>
          )}
          <div
            className={styles.followCount}
            onClick={() =>
              logAccessFollowers() +
              history.push({
                pathname: `${match.path}/followers`,
                state: {index: 0, selectedUserID: profileId},
              })
            }>
            <strong>{followersAmount}</strong>
            followers
          </div>
          <div
            className={styles.followCount}
            onClick={() =>
              logAccessFollowing() +
              history.push({
                pathname: `${match.path}/followers`,
                state: {index: 1, selectedUserID: profileId},
              })
            }>
            <strong>{followingAmount}</strong>
            following
          </div>
        </div>
        {militaryStatus ? (
          <h2>
            {militaryStatus}
            {militaryStatus !== 'Civilian' && ` / ${militaryBranch}`}
          </h2>
        ) : null}
        {/* {militaryStatus === 'Veteran' && (
          <p>
            ETS:{' '}
            {expirationTermOfService
              ? moment(expirationTermOfService).format('Y')
              : 'N/A'}
          </p>
        )} */}
        {/* {militaryStatus !== 'Civilian' && militaryRank && (
          <p>Rank: {militaryRank}</p>
        )} */}
        <br />
        <ExpandingText text={profileBio} />
        <ChallengeBadges
          userBadges={userBadges}
          myProfile={false}
          userId={profileId}
        />
      </div>
      <FeedList userFeed={userFeed} origin={'user'} mergeNewPost={getFeed} />
      <Grid container justify={'center'}>
        <ClipLoader size={60} color={'var(--grey20)'} loading={isLoadingFeed} />
      </Grid>
    </div>
  );
}
