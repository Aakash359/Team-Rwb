import React from 'react';
import styles from './ShareChallengeBox.module.css';
import moment from 'moment';
import {insertLocaleSeperator} from '../../../../shared/utils/ChallengeHelpers';

export default class ShareChallengeBox extends React.Component {
  render() {
    const {
      eventName,
      chapterName,
      eventStartTime,
      miles,
      steps,
      hours,
      minutes,
      seconds,
    } = this.props;

    return (
      <div className={styles.container}>
        <h1 className={styles.eventTitle}>{eventName?.toUpperCase()}</h1>
        <h5>{chapterName}</h5>
        <h6 className={styles.eventDate}>
          {moment(eventStartTime).format('dddd, MMMM DD, YYYY')}
        </h6>

        <div className={styles.detailsContainer}>
          <span>
            <h1 className={styles.workoutInfoText}>
              {insertLocaleSeperator(parseFloat(miles))}
            </h1>
            <h6 className={styles.workoutInfoLabelText}>MILES</h6>
          </span>
          <span>
            <h1 className={styles.workoutInfoText}>
              {insertLocaleSeperator(parseInt(steps))}
            </h1>
            <h6 className={styles.workoutInfoLabelText}>STEPS</h6>
          </span>
          <span>
            <h1 className={styles.workoutInfoText}>
              {hours}:{minutes}:{seconds}
            </h1>
            <h6 className={styles.workoutInfoLabelText}>DURATION</h6>
          </span>
        </div>
      </div>
    );
  }
}
