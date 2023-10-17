import React from 'react';
import styles from './RankingRow.module.css';
import DefaultProfileImg from '../../../../shared/images/DefaultProfileImg.png';
import {userProfile} from '../../../../shared/models/UserProfile';
import {
  formatMetric,
  insertLocaleSeperator,
  hoursMinutesSecondsFromMinutes,
} from '../../../../shared/utils/ChallengeHelpers';
import {CHALLENGE_TYPES} from '../../../../shared/constants/ChallengeTypes';

const isCurrentUser = (userId) => {
  const curUser = userProfile.getUserProfile();
  return curUser.id === userId;
};

// ignoreEmphasis is user when viewing a challenge detail without a goal. It will always be the current user but should not be magenta
const RankingRow = ({place, user, progress, metric, ignoreEmphasis}) => {
  if (!user) user = userProfile.getUserProfile();
  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        <h3
          style={{
            color:
              isCurrentUser(user.id) && !ignoreEmphasis
                ? 'var(--magenta)'
                : null,
          }}>{`${place}. `}</h3>
        <div
          className={styles.imgContainer}
          style={{
            backgroundColor:
              isCurrentUser(user.id) && !ignoreEmphasis
                ? 'var(--magenta)'
                : null,
          }}>
          <img
            src={user.profile_photo_url || DefaultProfileImg}
            className={styles.profilePhoto}
            alt={`${user.first_name} ${user.last_name}'s profile photo`}
          />
        </div>
        <h3
          style={{
            color:
              isCurrentUser(user.id) && !ignoreEmphasis
                ? 'var(--magenta)'
                : null,
          }}>
          {isCurrentUser(user.id)
            ? 'You'
            : `${user.first_name} ${user.last_name}`}
        </h3>
      </div>
      <div>
        <h3
          style={{
            color:
              isCurrentUser(user.id) && !ignoreEmphasis
                ? 'var(--magenta)'
                : null,
          }}>
          {metric !== CHALLENGE_TYPES.leastMinutes
            ? `${insertLocaleSeperator(parseFloat(progress))} ${formatMetric(
                metric,
              )}`
            : `${hoursMinutesSecondsFromMinutes(progress).hours}:${
                hoursMinutesSecondsFromMinutes(progress).minutes
              }:${hoursMinutesSecondsFromMinutes(progress).seconds}`}
        </h3>
      </div>
    </div>
  );
};

export default RankingRow;
