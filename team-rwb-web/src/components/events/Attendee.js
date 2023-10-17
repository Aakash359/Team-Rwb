import React from 'react';
import styles from './Attendee.module.css';
import DefaultProfileImg from '../../../../shared/images/DefaultProfileImg.png';
import RWBMark from '../svgs/RWBMark';
import AdminIcon from '../svgs/AdminIcon';

const Attendee = ({item, onSelect, sponsorAdmin}) => {
  const {
    profile_photo_url,
    first_name,
    last_name,
    eagle_leader,
    preferred_chapter,
    military_branch,
    military_status,
  } = item;
  return (
    <div
      className={styles.container}
      onClick={() => {
        onSelect(item);
      }}>
      <div className={styles.imgContainer}>
        <img
          src={!profile_photo_url ? DefaultProfileImg : profile_photo_url}
          className={styles.img}
          alt={'User profile'}
        />
        {sponsorAdmin && (
          <div className={styles.adminIconContainer}>
            <AdminIcon />
          </div>
        )}
      </div>
      <div className={styles.labelContainer}>
        <div className={styles.name}>
          <h3>{`${first_name} ${last_name}`}</h3>
          {eagle_leader && <RWBMark width={40} height={15} />}
        </div>
        {sponsorAdmin ? <h5>Group Leader</h5> : null}
        {eagle_leader ? <h5>Eagle Leader</h5> : null}
        <p>{preferred_chapter.name} </p>
        <p>
          {military_status}
          {military_status !== 'Civilian' && military_branch
            ? ` / ${military_branch}`
            : null}
        </p>
      </div>
    </div>
  );
};

export default Attendee;
