import React from 'react';
import PropTypes from 'prop-types';
import styles from './RWBUserImages.module.css';
import UploadPhotoIcon from './svgs/UploadPhotoIcon';
import DefaultProfileImg from '../../../shared/images/DefaultProfileImg.png';

function RWBUserImages({
  edit,
  coverPhoto,
  profilePhoto,
  onChangeCover,
  onChangeProfile,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.coverImageContainer}>
        <img
          style={{backgroundColor: 'var(--blue)'}}
          src={coverPhoto || null}
        />
        {edit ? (
          <div className={styles.uploadCoverImage}>
            <label>
              <UploadPhotoIcon tintColor={'white'} />
              <input
                type="file"
                accept="image/*"
                className={styles.hideDefaultUpload}
                onChange={onChangeCover}
              />
            </label>
          </div>
        ) : null}
      </div>
      <div className={styles.profileImageContainer}>
        <div className={styles.profileImageCrop}>
          <img src={profilePhoto || DefaultProfileImg} />
        </div>
        {edit ? (
          <div className={styles.uploadProfileImage}>
            <label>
              <UploadPhotoIcon tintColor={'white'} />
              <input
                type="file"
                accept="image/*"
                className={styles.hideDefaultUpload}
                onChange={onChangeProfile}
              />
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
}

RWBUserImages.defaultProps = {
  edit: false,
};

RWBUserImages.propTypes = {
  edit: PropTypes.bool,
};

export default RWBUserImages;
