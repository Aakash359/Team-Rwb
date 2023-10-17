import React from 'react';
import styles from './Attendee.module.css';
import DefaultProfileImg from '../../../../shared/images/DefaultProfileImg.png';
import RWBMark from '../svgs/RWBMark';

const EventHost = ({item, onSelect}) => {
  const {photo_url, first_name, last_name, is_eagle_leader, title} = item;
  return (
    <div
      className={styles.container}
      style={{backgroundColor: 'var(--grey8)'}}
      onClick={onSelect}>
      <img
        src={!photo_url ? DefaultProfileImg : photo_url}
        className={styles.img}
        alt={'User profile'}
      />
      <div className={styles.labelContainer}>
        <div>
          <h3>{`${first_name} ${last_name}`}</h3>
          {is_eagle_leader && <RWBMark width={40} height={15} />}
        </div>
        {is_eagle_leader ? (
          <>
            <h5>Eagle Leader</h5>
            <h5>{title}</h5>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default EventHost;
