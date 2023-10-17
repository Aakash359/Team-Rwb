import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from './NavigationButton.module.css';
import HomeIcon from '../svgs/HomeIcon';
import GroupsIcon from '../svgs/GroupsIcon';
import EventIcon from '../svgs/EventsIcon';
import ChallengeIcon from '../svgs/ChallengeTabIcon';
import MyProfileIcon from '../svgs/MyProfileIcon';

const ACTIVE_TAB = '#bf0d3e';
const INACTIVE_TAB = '#828588';

export default class NavigationButton extends Component {
  render() {
    const {pathname} = window.location;
    const {url, exact, label} = this.props;
    return (
      //probably better to create some sort of js event listener? NavLink has isActive as well; could use that
      <div
        className={
          exact
            ? pathname === url
              ? styles.active
              : styles.button
            : pathname.startsWith(url)
            ? styles.active
            : styles.button
        }>
        {label === 'Feed' && (
          <HomeIcon
            className={styles.icon}
            tintColor={pathname.startsWith(url) ? ACTIVE_TAB : INACTIVE_TAB}
            filledIcon={pathname.startsWith(url)}
          />
        )}
        {label === 'Groups' && (
          <GroupsIcon
            className={styles.icon}
            tintColor={pathname.startsWith(url) ? ACTIVE_TAB : INACTIVE_TAB}
            filledIcon={pathname.startsWith(url)}
          />
        )}
        {label === 'Events' && (
          <EventIcon
            className={styles.icon}
            tintColor={pathname.startsWith(url) ? ACTIVE_TAB : INACTIVE_TAB}
            filledIcon={pathname.startsWith(url)}
          />
        )}
        {label === 'Challenges' && (
          <ChallengeIcon
            className={styles.icon}
            tintColor={pathname.startsWith(url) ? ACTIVE_TAB : INACTIVE_TAB}
            filledIcon={pathname.startsWith(url)}
          />
        )}
        {label === 'Profile' && (
          <MyProfileIcon
            className={styles.icon}
            tintColor={pathname === url ? ACTIVE_TAB : INACTIVE_TAB}
            filledIcon={pathname.startsWith(url)}
          />
        )}
        <p className="navItem">{label}</p>
      </div>
    );
  }
}

NavigationButton.propTypes = {
  label: PropTypes.string.isRequired,
  url: PropTypes.string,
};
