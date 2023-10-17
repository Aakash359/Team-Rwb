import React from 'react';
import styles from './DetailHeader.module.css';
import ChevronBackIcon from './svgs/ChevronBackIcon';
import ShareIcon from './svgs/ShareIcon';
import {IconButton} from '@material-ui/core';

const DetailHeader = ({
  imageAlt,
  primaryImg,
  backupImg,
  goBack,
  copyClick,
  copyMessage,
}) => {
  return (
    <div className={styles.coverImgContainer}>
      <img alt={imageAlt} src={primaryImg || backupImg} />
      <div className={styles.navigation}>
        <div onClick={() => goBack()}>
          <IconButton edge="start" color="inherit">
            <ChevronBackIcon tintColor={'var(--magenta)'} />
          </IconButton>
        </div>
        {navigator.clipboard ? (
          <div onClick={copyClick}>
            <IconButton edge="end" color="inherit">
              <ShareIcon tintColor={'var(--magenta)'} />
            </IconButton>
            <p>{copyMessage}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default DetailHeader;
