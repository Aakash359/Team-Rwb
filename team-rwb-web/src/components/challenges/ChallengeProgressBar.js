import React from 'react';
import {
  CHALLENGE_DISPLAY,
  CHALLENGE_TYPES,
} from '../../../../shared/constants/ChallengeTypes';
import {insertLocaleSeperator} from '../../../../shared/utils/ChallengeHelpers';
import {
  getPercentage,
  ordinalIndicator,
} from '../../../../shared/utils/Helpers';
import styles from './ChallengeCard.module.css';

const ChallengeProgressBar = ({progress, place, goal, metric}) => {
  return (
    <>
      <div className={styles.barContainer}>
        <div
          className={styles.barContainer}
          style={{
            backgroundColor: 'var(--navy)',
            width: getPercentage(progress, goal),
          }}>
          {parseFloat(progress) >= parseFloat(goal) && (
            <p className={styles.percentageText}>100%</p>
          )}
        </div>
      </div>
      <div className={styles.bottomContainer}>
        <p className="namesAndObjects">
          {parseFloat(progress) >= parseFloat(goal)
            ? insertLocaleSeperator(parseFloat(progress))
            : `${insertLocaleSeperator(parseFloat(progress || 0))}/${goal}`}
          {` ${CHALLENGE_DISPLAY[metric]}`}
        </p>
        {metric !== CHALLENGE_TYPES.checkins && (
          <p className="namesAndObjects">
            {place ? ordinalIndicator(place) : null}
          </p>
        )}
      </div>
    </>
  );
};

export default ChallengeProgressBar;
