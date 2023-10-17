import React, {useState, useEffect} from 'react';
import styles from './ChallengeCard.module.css';
import ChallengeCardHeader from './ChallengeCardHeader';
import ChallengeProgressBar from './ChallengeProgressBar';
import {capitalizeFirstLetter} from '../../../../shared/utils/Helpers';
import {
  isUpcomingChallenge,
  insertLocaleSeperator,
  hoursMinutesSecondsFromMinutes,
} from '../../../../shared/utils/ChallengeHelpers';
import DefaultProfileImg from '../../../../shared/images/DefaultProfileImg.png';
import {userProfile} from '../../../../shared/models/UserProfile';
import {rwbApi} from '../../../../shared/apis/api';
import {CHALLENGE_TYPES} from '../../../../shared/constants/ChallengeTypes';

const JoinedChallengeCard = ({
  title,
  endTime,
  goal,
  metric,
  ended,
  startTime,
  challengeId,
  badgeURL,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [rank, setRank] = useState('');

  const getProgress = () => {
    setIsLoading(true);
    rwbApi
      .getLeaderboardRank(challengeId)
      .then((result) => {
        setRank(result.rank);
        setProgress(result.score);
      })
      .catch((err) => {
        // todo figure out how we want to handle errors on this
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getProgress();
  }, []);

  return (
    <div className={styles.container} style={{opacity: isLoading ? 0.5 : 1}}>
      <ChallengeCardHeader
        title={title}
        endTime={endTime}
        ended={ended}
        startTime={startTime}
        badgeURL={badgeURL}
      />
      {!isUpcomingChallenge(startTime) ? (
        goal && goal > 0 && metric !== CHALLENGE_TYPES.leastMinutes ? (
          <ChallengeProgressBar
            progress={progress || 0}
            place={rank}
            goal={goal}
            metric={metric}
          />
        ) : rank ? (
          <div className={styles.bottomContainer}>
            <div className={styles.placementContainer}>
              <p className="namesAndObjects">{rank}.</p>
              {/* profile_photo_url is different than what the server usually returns. Potentially have the server returning the user's photo. */}
              <img
                className={styles.profileImg}
                src={
                  userProfile.getUserProfile().profile_photo_url ||
                  DefaultProfileImg
                }
                alt="Your profile picture"
              />
              <p className="namesAndObjects">You</p>
            </div>
            <p className="namesAndObjects">
              {metric !== CHALLENGE_TYPES.leastMinutes
                ? `${insertLocaleSeperator(
                    parseFloat(progress),
                  )} ${capitalizeFirstLetter(metric)}`
                : `${hoursMinutesSecondsFromMinutes(progress).hours}:${
                    hoursMinutesSecondsFromMinutes(progress).minutes
                  }:${hoursMinutesSecondsFromMinutes(progress).seconds}`}
            </p>
          </div>
        ) : null
      ) : null}
    </div>
  );
};

export default JoinedChallengeCard;
