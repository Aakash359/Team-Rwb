import React from 'react';
import {defaultUserPhoto} from '../../../../shared/utils/Helpers';
import styles from './CreateEvent.module.css';
import RWBMark from '../svgs/RWBMark';

const InvitedUsersSearchList = ({user, onInviteUserHandler}) => {
  const {
    full_name,
    profile_photo_url,
    preferred_chapter,
    military_branch,
    military_status,
    eagle_leader,
  } = user._source;
  return (
    <li onClick={() => onInviteUserHandler(full_name)}>
      <img
        src={profile_photo_url || defaultUserPhoto}
        className={styles.invitedUsersItem}
      />
      <div>
        <div>
          <h3>{full_name}</h3>
          {eagle_leader && <RWBMark width={40} height={15} />}
        </div>
        {eagle_leader && (
          <h5 className={styles.eagleLeaderText}>{'Eagle Leader'}</h5>
        )}
        <p>{preferred_chapter.name}</p>
        <p>
          {military_status}
          {military_status !== 'Civilian' ? ` / ${military_branch}` : null}
        </p>
      </div>
    </li>
  );
};

export default InvitedUsersSearchList;
