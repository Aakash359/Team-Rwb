import React from 'react';
import styles from './PhotoView.module.css';
import XIcon from '../svgs/XIcon';
import LikeIcon from '../svgs/LikeIcon';

const PhotoView = ({
  post_image,
  onModalClose,
  liked,
  likeAmount,
  onLikeClicked,
}) => (
  <div className={styles.imgModalContainer}>
    <div className={styles.modalXContainer} onClick={onModalClose}>
      <XIcon width={50} height={50} tintColor={'var(--white)'} />
    </div>
    <img className={styles.postImage} src={post_image} alt="User Post Image" />
    <div className={styles.likeContainer} onClick={onLikeClicked}>
      <LikeIcon
        className={styles.likeIcon}
        tintColor={liked ? 'var(--magenta)' : null}
      />
      <p>{likeAmount > 0 && likeAmount}</p>
    </div>
  </div>
);

export default PhotoView;
