import React from 'react';
import styles from './MetricsYTD.module.css';

const MetricsYTD = (props) => {
  const {events, miles, steps} = props;
  return (
    <div className={styles.ytdContainer}>
      <div className={styles.workoutInfoContainer}>
        <div>
          <h1 className={styles.workoutInfoText}>{events}</h1>
          <span className={styles.workoutInfoLabelText}>EVENTS (YTD)</span>
        </div>
        <div>
          <h1 className={styles.workoutInfoText}>{miles}</h1>
          <span className={styles.workoutInfoLabelText}>MILES (YTD)</span>
        </div>
        <div>
          <h1 className={styles.workoutInfoText}>{steps}</h1>
          <span className={styles.workoutInfoLabelText}>STEPS (YTD)</span>
        </div>
      </div>
    </div>
  );
};

export default MetricsYTD;
