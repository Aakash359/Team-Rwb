import React from 'react';
import {NavLink, useLocation} from 'react-router-dom';
import styles from './NavigationColumn.module.css';
import NavigationButton from './NavigationButton';
import RWBLogoHorizontal from '../svgs/RWBLogoHorizontal';
import {
  logAccessFeed,
  logAccessEvents,
  logAccessMyProfile,
} from '../../../../shared/models/Analytics';
import {
  COMMUNITY_GUIDELINES_URL,
  POLICY_TERMS_URL,
} from '../../../../shared/constants/TermURLs';
import ApiInfo from '../ApiInfo';
const pJSON = require('../../../package.json');

export default function NavigationColumn() {
  const location = useLocation();
  function isNavBarDisplayed(location) {
    const {pathname} = location;
    const allowedPaths = [
      '/feed',
      '/groups',
      '/events',
      '/challenges',
      '/profile',
      '/notifications',
      // '/login',
      // '/registration',
    ];
    for (const allowedPath of allowedPaths) {
      if (pathname.startsWith(allowedPath)) {
        return true;
      }
    }
    return false;
  }
  const showNavBar = isNavBarDisplayed(location);
  return (
    <div className={showNavBar ? styles.container : styles.none}>
      <div className={styles.navLinkContainer}>
        <div className={styles.navLogo}>
          <RWBLogoHorizontal className={styles.navLogo} />
        </div>
        {/* <NavLink to="/">
          <NavigationButton label={'Home'} url={'/'} />
        </NavLink> */}
        <NavLink onClick={logAccessFeed} to="/feed">
          <NavigationButton label={'Feed'} url={'/feed'} />
        </NavLink>
        {/* onClick={logAccessGroups} */}
        <NavLink to="/groups">
          <NavigationButton label={'Groups'} url={'/groups'} />
        </NavLink>
        <NavLink onClick={logAccessEvents} to="/events">
          <NavigationButton label={'Events'} url={'/events'} />
        </NavLink>
        <NavLink onClick={() => null} to='/challenges'>
          <NavigationButton label={'Challenges'} url={'/challenges'} />
        </NavLink>

        <NavLink onClick={logAccessMyProfile} to="/profile">
          <NavigationButton label={'Profile'} url={'/profile'} exact />
        </NavLink>
      </div>

      <div className={styles.settingsContainer}>
        <div>Team Red, White and Blue</div>
        <div>
          <a
            className="link"
            href={POLICY_TERMS_URL}
            target="_blank"
            rel="noreferrer noopener">
            Privacy Policy & Terms
          </a>
        </div>
        <div>
          <a
            className="link"
            href={COMMUNITY_GUIDELINES_URL}
            target="_blank"
            rel="noreferrer noopener">
            Community Guidelines
          </a>
        </div>
        <div>
          <p style={{fontSize: 12}}>Version: {pJSON.version}</p>
        </div>
        <ApiInfo />
      </div>
    </div>
  );
}
