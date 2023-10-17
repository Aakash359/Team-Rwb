import React from 'react';
import {Switch} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import styles from './CustomSwitch.module.css';

const _styles = {
  switchBase: {
    '&$checked': {
      color: 'seagreen',
    },
    '&$checked + $track': {
      backgroundColor: 'darkgreen',
    },
  },
  checked: {},
  track: {},
};

const CustomSwitch = ({classes, title, selectedValue, onSelect}) => {
  return (
    <div className={styles.container}>
      <p className={styles.label}>{title}</p>
      <Switch
        focusVisibleClassName={classes.focusVisible}
        disableRipple
        classes={{
          root: classes.root,
          switchBase: classes.switchBase,
          thumb: classes.thumb,
          track: classes.track,
          checked: classes.checked,
        }}
        checked={selectedValue}
        onChange={(_, value) => onSelect(value)}
      />
    </div>
  );
};

export default withStyles(_styles)(CustomSwitch);
