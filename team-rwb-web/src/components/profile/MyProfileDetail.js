import React, {useState, useEffect} from 'react';
import RWBUserImages from '../RWBUserImages';
import styles from './ProfileDetail.module.css';
import {IconButton, Grid} from '@material-ui/core';
import SettingsIcon from '../svgs/SettingsIcon';
import {userProfile} from '../../../../shared/models/UserProfile';
import {rwbApi} from '../../../../shared/apis/api';
import FeedList from '../feed/FeedList';
import {ClipLoader} from 'react-spinners';
import {useRouteMatch, useHistory} from 'react-router-dom';
import ExpandingText from '../ExpandingText';
import {MILITARY_STATUSES} from '../../../../shared/constants/MilitaryStatusSlugs';

import {
  logEditButton,
  logAccessFollowers,
  logAccessFollowing,
  logAccessAppSettings,
} from '../../../../shared/models/Analytics';
import {hasReachedBottom} from '../../BrowserUtil';
import Loading from '../Loading';
import RWBMark from '../svgs/RWBMark';
import {PROFILE_TAB_LABELS} from '../../../../shared/constants/Labels';
import ChevronRightIcon from '../svgs/ChevronRightIcon';
import {insertLocaleSeperator} from '../../../../shared/utils/ChallengeHelpers';
import ChallengeBadges from './ChallengeBadges';

export default function ProfileDetail() {
  const [isFollowSummaryLoading, setIsFollowSummaryLoading] = useState(true);
  const [isInitialFeedLoading, setIsInitialFeedloading] = useState(true);
  const [isMoreFeedLoading, setIsMoreFeedLoading] = useState(false);
  const [isBadgesLoading, setIsBadgesLoading] = useState(true);
  const [isMetricsLoading, setIsMetricsLoading] = useState(true);
  const [followingAmount, setFollowingAmount] = useState('-');
  const [followersAmount, setFollowersAmount] = useState('-');
  const [userFeed, setUserFeed] = useState([]);
  const [retrievedLastPost, setRetrievedLastPost] = useState(false);
  const [userBadges, setUserBadges] = useState([]);
  const [userMetrics, setUserMetrics] = useState({});
  const user = userProfile.getUserProfile();
  const match = useRouteMatch();
  const history = useHistory();

  useEffect(() => {
    getUsersFollowSummary(user.id);
    getFeed();
    getBadges(userProfile.getUserProfile().id);
    getMetrics();
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

  const getBadges = (id) => {
    return rwbApi
      .getUserBadges(id)
      .then((result) => {
        setUserBadges(result.data.badges);
        setIsBadgesLoading(false);
      })
      .catch((error) => {
        console.warn(error);
        alert("Error retrieving user's badges.");
        setIsBadgesLoading(false);
      });
  };

  const getMetrics = () => {
    return rwbApi
      .getUserMetrics()
      .then((result) => {
        setUserMetrics(result.data);
        setIsMetricsLoading(false);
      })
      .catch((error) => {
        console.warn(error);
        alert("Error retrieving user's metrics.");
        setIsMetricsLoading(false);
      });
  };

  const getUsersFollowSummary = (id) => {
    return rwbApi
      .getFollowSummary(id)
      .then((result) => {
        const followingAmount = result.following;
        const followersAmount = result.followers;
        setFollowingAmount(followingAmount);
        setFollowersAmount(followersAmount);
        setIsFollowSummaryLoading(false);
      })
      .catch((error) => {
        console.warn(error);
        alert("Error retrieving user's following and follower count.");
      });
  };
  const getFeed = () => {
    rwbApi
      .getUserFeed(user.id)
      .then((result) => {
        setUserFeed(result.data.results);
        setIsInitialFeedloading(false);
        if (result.data.results.length === 0) setIsMoreFeedLoading(false);
      })
      .catch((error) => {
        console.warn('error getting feed: ', error);
        alert('There was an error retrieving your feed.');
        setIsInitialFeedloading(false);
      });
  };

  const handleLoadMore = () => {
    const lastPost = userFeed[userFeed.length - 1];
    if (retrievedLastPost && lastPost) {
      setIsMoreFeedLoading(true);
      rwbApi.getUserFeed(user.id, lastPost.id).then((result) => {
        if (result.data.results.length > 0) {
          setUserFeed([...userFeed, ...result.data.results]);
          setIsMoreFeedLoading(false);
          setRetrievedLastPost(false);
        } else setIsMoreFeedLoading(false);
      });
    }
  };

  return (
    <div id={'root'}>
      {!isFollowSummaryLoading &&
      !isInitialFeedLoading &&
      !isBadgesLoading &&
      !isMetricsLoading ? (
        <>
          <div className={styles.userImageContainer}>
            <RWBUserImages
              coverPhoto={user.cover_photo_url}
              profilePhoto={user.profile_photo_url}
            />

            <div
              className={styles.navigation}
              onClick={() => {
                logAccessAppSettings();
                history.push(`${match.path}/settings`);
              }}>
              <IconButton edge="start" color="inherit">
                <SettingsIcon />
              </IconButton>
            </div>
          </div>
          <div className={styles.contentContainer}>
            <div className={styles.nameContainer}>
              <h1>{`${user.first_name} ${user.last_name}`}</h1>
              {user.eagle_leader && (
                <RWBMark tintColor={'var(--navy)'} width={40} height={18} />
              )}
            </div>
            <h2>
              {(user.preferred_chapter && user.preferred_chapter.name) ||
                (user.home_chapter && user.home_chapter.name) ||
                ''}
            </h2>
            {user.eagle_leader && (
              <h5 className={styles.eagleLeaderText}>Eagle Leader</h5>
            )}

            <div className={styles.profileActions}>
              <div
                className={styles.editButton}
                onClick={() => {
                  logEditButton();
                  history.push({
                    pathname: `${match.path}/edit`,
                  });
                }}>
                Edit
              </div>
              <div
                className={styles.followCount}
                onClick={() => {
                  logAccessFollowers();
                  history.push({
                    pathname: `${match.path}/followers`,
                    state: {index: 0},
                  });
                }}>
                <strong>{followersAmount}</strong>
                followers
              </div>
              <div
                className={styles.followCount}
                onClick={() =>
                  logAccessFollowing() +
                  history.push({
                    pathname: `${match.path}/followers`,
                    state: {index: 1},
                  })
                }>
                <strong>{followingAmount}</strong>
                following
              </div>
            </div>

            <h2>
              {user.military_status}
              {user.military_status !== MILITARY_STATUSES.civilian &&
                ` / ${user.military_branch}`}
            </h2>
            {/* <p>
              {user.military_status === MILITARY_STATUSES.veteran &&
                `ETS: ${moment(user.military_ets).format('Y')}`}
            </p> */}
            <br />
            <ExpandingText text={user.profile_bio} />
            {/* Metrics */}
            <div className={styles.badgeStatLink}>
              <p
                style={{cursor: 'pointer'}}
                onClick={() =>
                  history.push({
                    pathname: `${match.path}/workout-log`,
                    state: {userMetrics},
                  })
                }
                className="link">
                {PROFILE_TAB_LABELS.EVENT_AND_WORKOUT_STATS}
              </p>
              <ChevronRightIcon />
            </div>
            <div className={styles.workoutContainer}>
              {/* TODO: get new data */}
              <div>
                <h1 className={styles.stat}>
                  {insertLocaleSeperator(
                    parseInt(userMetrics.all_time_challenges_participated),
                  )}
                </h1>
                <p className={styles.statName}>
                  {PROFILE_TAB_LABELS.ALL_TIME_CHALLENGES}
                </p>
              </div>
              <div>
                <h1 className={styles.stat}>
                  {insertLocaleSeperator(
                    parseInt(userMetrics.ytd_events_participated),
                  )}
                </h1>
                <p className={styles.statName}>
                  {PROFILE_TAB_LABELS.YTD_EVENTS}
                </p>
              </div>
              <div>
                <h1 className={styles.stat}>
                  {insertLocaleSeperator(
                    parseInt(userMetrics.mtd_events_participated),
                  )}
                </h1>
                <p className={styles.statName}>
                  {PROFILE_TAB_LABELS.MTD_EVENTS}
                </p>
              </div>
            </div>
            <br />
            {/* Badges */}
            <ChallengeBadges userBadges={userBadges} myProfile={true} />
          </div>

          <FeedList
            userFeed={userFeed}
            origin={'user'}
            mergeNewPost={getFeed}
          />
          <Grid container justify={'center'}>
            <ClipLoader
              size={60}
              color={'var(--grey20)'}
              loading={isMoreFeedLoading}
            />
          </Grid>
        </>
      ) : (
        <Loading size={100} color={'var(--white)'} loading={true} right />
      )}
    </div>
  );
}
