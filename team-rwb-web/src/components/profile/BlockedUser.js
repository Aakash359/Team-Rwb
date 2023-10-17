import React from 'react';
import styles from './BlockedUser.module.css';
import DefaultProfileImg from '../../../../shared/images/DefaultProfileImg.png';
import AdminIcon from '../svgs/AdminIcon';
import RWBButton from '../RWBButton';
import {rwbApi} from '../../../../shared/apis/api';

const BlockedUser = ({item, sponsorAdmin, setNewData}) => {
  const {profile_photo_url, first_name, last_name, id} = item;

  const unblockUser = () => {
    if (window.confirm(`Team RWB: Would you like to unblock this user?`)) {
      rwbApi
        .unblockUser(id)
        .then((res) => {
          window.alert(res.success);
          rwbApi
            .getListOfBlockedUsers()
            .then((res) => {
              setNewData(res.data);
            })
            .catch((err) => console.warn(err));
        })
        .catch((err) => {
          console.warn('error', err);
        });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
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
          </div>
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <RWBButton
          className={styles.unblock}
          buttonStyle="primary"
          label="Unblock"
          onClick={() => unblockUser()}
        />
      </div>
    </div>
  );
};

export default BlockedUser;
