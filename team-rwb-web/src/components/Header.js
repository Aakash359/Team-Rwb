import {IconButton} from '@material-ui/core';
import React from 'react';
import ChevronBackIcon from './svgs/ChevronBackIcon';
import styles from './Header.module.css';

const Header = ({
  title,
  subtitle,
  onBack,
  noBottomPadding,
  lessHeight,
  leftAlign,
}) => {
  return (
    <div
      className={`${styles.headerContainer} ${
        noBottomPadding && styles.noBottomPadding
      } ${lessHeight && styles.lessHeightContainer}`}>
      {onBack && (
        <IconButton edge="start" color="inherit" onClick={onBack}>
          <ChevronBackIcon tintColor={'var(--white)'} />
        </IconButton>
      )}
      <div
        className={`${styles.headerTextContainer} ${
          !onBack && styles.noRightTextPadding
        } ${leftAlign && styles.leftAlignText}`}>
        <p className="title">{title}</p>
        {subtitle && <p className="titleSubheader">{subtitle}</p>}
      </div>
    </div>
  );
};

export default Header;
