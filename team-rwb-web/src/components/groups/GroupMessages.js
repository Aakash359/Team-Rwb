import React, {Component} from 'react';
import {
  CHAPTER_GROUP,
  MORE_GROUPS,
} from '../../../../shared/constants/OnboardingMessages';
import HandPointerIcon from '../svgs/HandPointerIcon';
import styles from './GroupMessages.module.css';

const ICON_WIDTH = 50; // width of the icon is 83% of its height
const ICON_HEIGHT = 60;

export default class GroupMessages extends Component {
  render() {
    return (
      <div className={styles.container}>
        <div className={styles.topHandContainer}>
          <HandPointerIcon width={ICON_WIDTH} height={ICON_HEIGHT} />
        </div>
        <h2>{CHAPTER_GROUP}</h2>
        <h2 className={styles.bottomText}>{MORE_GROUPS}</h2>
        <div className={styles.bottomHandContainer}>
          <HandPointerIcon width={ICON_WIDTH} height={ICON_HEIGHT} />
        </div>
      </div>
    );
  }
}
