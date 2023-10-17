import React from 'react';
import styles from './ChallengeCard.module.css';
import moment from 'moment';
import RWBMark from '../svgs/RWBMark';
import {
  isUpcomingChallenge,
  howLongUntil,
} from '../../../../shared/utils/ChallengeHelpers';

const ChallengeCardHeader = ({title, endTime, ended, startTime, badgeURL}) => {
  return (
    <div className={styles.topContainer}>
      <div className={styles.titleAndTimeContainer}>
        <p className={styles.title}>{title}</p>
        {ended ? (
          <h5>Ended {moment(endTime).format('MMM DD, YYYY')}</h5>
        ) : (
          <h5>
            {startTime && isUpcomingChallenge(startTime)
              ? `Starts ${moment(startTime).format('MMM DD, YYYY')}`
              : `Ends ${howLongUntil(endTime)}`}
          </h5>
        )}{' '}
      </div>
      {badgeURL ? (
        <img className={styles.listBadgeIcon} src={badgeURL} />
      ) : (
        <RWBMark />
      )}
    </div>
  );
};

export default ChallengeCardHeader;
