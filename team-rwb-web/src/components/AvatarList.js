import React from 'react';
import {defaultUserPhoto} from '../../../shared/utils/Helpers';
import ChevronRightIcon from './svgs/ChevronRightIcon';
import styles from './AvatarList.module.css';

const AvatarList = ({avatars, total_count, containerStyle}) => (
  <div className={`${styles.attendeesContainer} ${containerStyle}`}>
    <div className={styles.attendees}>
      {avatars.slice(0, 9).map((item, i) => (
        <img
          src={item.profile_photo_url || defaultUserPhoto}
          key={i}
          alt={`User profile ${i}`}
        />
      ))}
      <div className={styles.attendeesCount}>{total_count}</div>
    </div>
    <div className={styles.attendeesCountIcon}>
      <ChevronRightIcon />
    </div>
  </div>
);

export default AvatarList;
