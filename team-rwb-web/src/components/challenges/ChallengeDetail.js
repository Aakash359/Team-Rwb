import React, {useState, useEffect} from 'react';
import {useParams, Link, useHistory} from 'react-router-dom';
import {userProfile} from '../../../../shared/models/UserProfile';
import {putUserFirst} from '../../../../shared/utils/Helpers';
import DetailHeader from '../DetailHeader';
import Loading from '../Loading';
import styles from './ChallengeDetail.module.css';
import AvatarList from '../AvatarList';
import {rwbApi} from '../../../../shared/apis/api';
import ChallengeProgressBar from './ChallengeProgressBar';
import {
  JOIN_CHALLENGE_ERROR,
  LOAD_CHALLENGE_ERROR,
} from '../../../../shared/constants/ErrorMessages';
import {isDev} from '../../../../shared/utils/IsDev';
import RankingRow from './RankingRow';
import FeedList from '../feed/FeedList';
import CreatePostButton from '../feed/CreatePostButton';
import {hasReachedBottom} from '../../BrowserUtil';
import {getChallengeStatusText} from '../../../../shared/utils/ChallengeHelpers';
import {CHALLENGE_TYPES} from '../../../../shared/constants/ChallengeTypes';
import { EXECUTION_STATUS, logJoinChallenge, logLeaveChallenge, logViewChallengeEvents } from '../../../../shared/models/Analytics';

const ChallengeDetail = ({updateJoined}) => {
  const {challengeId} = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState();
  const [endTime, setEndTime] = useState();
  const [startTime, setStartTime] = useState();
  const [coverPhoto, setCoverPhoto] = useState();
  const [description, setDescription] = useState();
  const [copyMessage, setCopyMessage] = useState();
  const [eventCount, setEventcount] = useState(0);
  const [changingChallengeStatus, setChangingChallengeStatus] = useState(false);
  const [joinedChallenge, setJoinedChallenge] = useState(false);
  const [totalUsers, setTotalUsers] = useState([]);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [badgeURL, setBadgeUrl] = useState();
  const [hasBadge, setHasBadge] = useState(false);
  const [badgeName, setBadgeName] = useState();
  const [progress, setProgress] = useState(0);
  const [goal, setGoal] = useState(0);
  const [place, setPlace] = useState(0);
  const [metric, setMetric] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [feed, setFeed] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [retrievedLastPost, setRetrievedLastPost] = useState(false);
  const [links, setLinks] = useState([]);
  const [earnedBadge, setEarnedBadge] = useState(false);

  const user = userProfile.getUserProfile();
  const history = useHistory();

  const copyChallengeURL = () => {
    // todo, figure out url
    navigator.clipboard.writeText(
      isDev()
        ? `https://members-staging.teamrwb.org/challenge/${challengeId}`
        : `https://members.teamrwb.org/challenge/${challengeId}`,
    );
    setCopyMessage('Copied!');
    setTimeout(() => {
      setCopyMessage('');
    }, 3000);
  };

  const joinChallenge = () => {
    const analyticsObj = {
      'challenge_id': `${challengeId}`,
      previous_view: 'hub',
      click_text: 'Join Challenge',
    }
    if (!changingChallengeStatus) {
      setChangingChallengeStatus(true);
      userJoined();
      rwbApi
        .joinChallenge(challengeId)
        .then(() => {
          analyticsObj.execution_status = EXECUTION_STATUS.success;
          logJoinChallenge(analyticsObj);
          // update the active challenges list on the challenges tab
          if (updateJoined) updateJoined();
          Promise.all([loadChallengeRank(), loadTopParticipants()]).then(
            ([rank, topParticipants]) => {
              setPlace(rank.rank);
              setProgress(rank.score);
              setLeaderboard(topParticipants.data || []);
              setChangingChallengeStatus(false);
            },
          );
        })
        .catch(() => {
          analyticsObj.execution_status = EXECUTION_STATUS.failure;
          logJoinChallenge(analyticsObj);
          userLeft();
          setJoinedChallenge(false);
          alert(`Team RWB: ${JOIN_CHALLENGE_ERROR}`);
          setChangingChallengeStatus(false);
        });
    }
  };

  const userJoined = () => {
    setJoinedChallenge(true);
    const user = userProfile.getUserProfile();
    let userList = Array.from(putUserFirst(totalUsers, joinedChallenge));
    userList.unshift(user);
    setTotalUsers(userList);
    setTotalUsersCount(totalUsersCount + 1);
  };

  const leaveChallenge = () => {
    const analyticsObj = {
      'challenge_id': `${challengeId}`,
      previous_view: 'hub',
      click_text: 'Leave Challenge',
    }
    if (!changingChallengeStatus) {
      setChangingChallengeStatus(true);
      userLeft();
      rwbApi
        .leaveChallenge(challengeId)
        .then((result) => {
          analyticsObj.execution_status = EXECUTION_STATUS.success;
          logLeaveChallenge(analyticsObj);
          if (updateJoined) updateJoined();
          loadTopParticipants().then((topParticipants) => {
            setLeaderboard(topParticipants.data || []);
            setChangingChallengeStatus(false);
          });
        })
        .catch((err) => {
          analyticsObj.execution_status = EXECUTION_STATUS.failure;
          logLeaveChallenge(analyticsObj);
          setChangingChallengeStatus(false);
          console.warn(err);
          userJoined();
          alert('Team RWB: Error leaving challenge');
        });
    }
  };

  const userLeft = () => {
    setJoinedChallenge(false);
    let userList = Array.from(putUserFirst(totalUsers, joinedChallenge));
    userList.shift();
    setTotalUsers(userList);
    setTotalUsersCount(totalUsersCount - 1);
  };

  const viewEvents = () => {
    const analyticsObj = {
      'challenge_id': `${challengeId}`,
      previous_view: 'hub',
      click_text: `${eventCount} ${eventCount !== 1 ? 'Events' : 'Event'}`,
    }
    logViewChallengeEvents(analyticsObj);
    history.push({
      pathname: `${challengeId}/events`,
      state: {
        challengeName: name,
      },
    });
  };

  const userJoinedChallenge = () => {
    return rwbApi
      .hasJoinedChallenge(challengeId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      loadChallenge(),
      userJoinedChallenge(),
      loadChallengeRank(),
      loadTopParticipants(),
      loadChallengeFeed(),
      getChallengeParticipants(),
      getBadgeStatus(),
    ])
      .then(
        ([
          challenge,
          joined,
          rank,
          topParticipants,
          feed,
          participants,
          badgeStatus,
        ]) => {
          setBadgeName(challenge.badge_name);
          setBadgeUrl(challenge.badge_image_url);
          setStartTime(challenge.start_date);
          setEndTime(challenge.end_date);
          setName(challenge.name);
          setDescription(challenge.description);
          setEventcount(challenge.event_count);
          setCoverPhoto(challenge.cover_image_url);
          setGoal(challenge.goal);
          setMetric(challenge.required_unit);
          setLinks(challenge.links || []);
          setJoinedChallenge(joined);
          setIsLoading(false);
          setPlace(rank.rank);
          setProgress(rank.score);
          setLeaderboard(topParticipants.data || []);
          setFeed([...feed.data?.results]);
          setTotalUsers(participants.participants);
          setTotalUsersCount(participants.total_count);
          setEarnedBadge(badgeStatus);
        },
      )
      .catch((err) => {
        alert(`Team RWB: ${LOAD_CHALLENGE_ERROR}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const getBadgeStatus = () => {
    return rwbApi
      .getBadgeStatus(challengeId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  const getChallengeParticipants = () => {
    return rwbApi
      .getChallengeParticipants(challengeId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  const loadChallenge = () => {
    return rwbApi
      .getChallenge(challengeId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  const loadChallengeRank = () => {
    return rwbApi
      .getLeaderboardRank(challengeId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  const loadTopParticipants = () => {
    return rwbApi
      .getLeaderboardTop(challengeId)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  const loadChallengeFeed = (offset) => {
    setFeed([]);
    return rwbApi
      .getChallengeFeed(challengeId, offset)
      .then((result) => {
        return result;
      })
      .catch((err) => {});
  };

  const handleNewPost = () => {
    loadChallengeFeed().then((result) => {
      setFeed([...result.data.results]);
    });
  };

  const trackScrolling = (event) => {
    event.preventDefault();
    const wrappedElement = document.getElementById('root');
    if (hasReachedBottom(wrappedElement)) {
      loadMorePosts();
    }
  };

  const loadMorePosts = () => {
    // only try to retrieve more from the feed if it is not already retrieving
    if (!isLoadingMore) {
      const posts = feed;
      const lastPost = posts[posts.length - 1];
      if (!retrievedLastPost && challengeId && lastPost?.id) {
        setIsLoadingMore(true);
        rwbApi.getChallengeFeed(challengeId, lastPost.id).then((result) => {
          if (result.data.results.length > 0) {
            setFeed([...feed, ...result.data.results]);
            setIsLoadingMore(false);
          } else {
            setIsLoadingMore(false);
            setRetrievedLastPost(true);
          }
        });
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', trackScrolling);
    return () => {
      window.removeEventListener('scroll', trackScrolling);
    };
  }, [loadMorePosts]);

  return (
    <>
      {isLoading ? (
        <Loading size={100} color={'var(--white)'} loading={isLoading} right />
      ) : (
        <>
          <DetailHeader
            imageAlt={'Challenge Cover Photo'}
            primaryImg={coverPhoto}
            backupImg={null}
            goBack={history.goBack}
            copyClick={copyChallengeURL}
            copyMessage={copyMessage}
          />
          <div className={styles.challengeDetailContainer}>
            {joinedChallenge &&
            goal &&
            goal > 0 &&
            metric !== CHALLENGE_TYPES.leastMinutes ? (
              <div style={{width: '50%'}}>
                <ChallengeProgressBar
                  progress={progress}
                  goal={goal}
                  place={place}
                  metric={metric}
                />
              </div>
            ) : null}
            <div
              className={styles.badgeContainer}
              style={{
                backgroundColor: earnedBadge ? 'var(--gold)' : null,
              }}>
              <img
                alt={`${badgeName} badge`}
                className={styles.badgeIcon}
                src={badgeURL}
              />
            </div>
            <div>
              <h1>{name}</h1>
              <h5>{getChallengeStatusText(startTime, endTime)}</h5>
            </div>
            <p className={styles.description}>{description}</p>
            {links !== null &&
              links.length > 0 &&
              links.map((link, i) => (
                <div style={{marginBottom: 30}} key={'linkContainer' + i}>
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href={link.url}
                    className="link"
                    key={'link' + i}>
                    {link.text}
                  </a>
                </div>
              ))}
            <div className={styles.buttonContainer}>
              {joinedChallenge ? (
                <>
                  <div
                    onClick={leaveChallenge}
                    className={styles.button}
                    style={{
                      width: '40%',
                      backgroundColor: 'var(--navy)',
                      opacity: changingChallengeStatus ? 0.5 : null,
                    }}>
                    Leave challenge
                  </div>

                  <div
                    className={styles.button}
                    style={{width: '40%'}}
                    onClick={viewEvents}>
                    {eventCount} {eventCount !== 1 ? 'Events' : 'Event'}
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={styles.button}
                    style={{opacity: changingChallengeStatus ? 0.5 : null}}
                    onClick={joinChallenge}>
                    Join Challenge
                  </div>
                  <div className={styles.button} onClick={viewEvents}>
                    {eventCount} {eventCount !== 1 ? 'Events' : 'Event'}
                  </div>
                </>
              )}
            </div>
            <div className={styles.avatarContainer}>
              <Link
                to={{
                  pathname: `/challenges/${challengeId}/participants`,
                  state: {
                    challengeName: name,
                    challengeId: challengeId,
                    participants: totalUsers,
                    totalUsersCount: totalUsersCount,
                  },
                }}>
                <AvatarList
                  avatars={putUserFirst(totalUsers, joinedChallenge)}
                  total_count={totalUsersCount}
                />
              </Link>
            </div>
          </div>
          {joinedChallenge &&
          parseInt(goal) === 0 &&
          place &&
          metric !== CHALLENGE_TYPES.checkins ? (
            <div className={styles.leaderboardContainer}>
              <RankingRow
                place={place}
                progress={progress}
                metric={metric}
                ignoreEmphasis={true}
              />
            </div>
          ) : null}
          {leaderboard.length > 0 && metric !== CHALLENGE_TYPES.checkins && (
            <div className={styles.leaderboardContainer}>
              <h3>Leaderboard</h3>
              {leaderboard.slice(0, 5).map((ranking, i) => {
                return (
                  <RankingRow
                    key={`ranked-row-${i}`}
                    place={ranking.rank}
                    user={ranking.user}
                    progress={ranking.score}
                    metric={metric}
                  />
                );
              })}
              <div style={{display: 'flex', justifyContent: 'center'}}>
                <Link
                  className={styles.seeMoreLink}
                  to={{
                    pathname: `/challenges/${challengeId}/leaderboard`,
                    state: {
                      challengeId: challengeId,
                      challengeName: name,
                      metric: metric,
                      rank: place,
                      data: leaderboard,
                    },
                  }}>
                  <p>See More</p>
                </Link>
              </div>
            </div>
          )}

          {feed.length > 0 && (
            <FeedList userFeed={feed} mergeNewPost={handleNewPost} />
          )}
          {!user.anonymous_profile &&
            joinedChallenge &&
            !changingChallengeStatus && (
              <CreatePostButton
                type={'challenge'}
                challengeID={challengeId}
                mergeNewPost={handleNewPost}
              />
            )}
        </>
      )}
    </>
  );
};

export default ChallengeDetail;
