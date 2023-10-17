import React from 'react';
import {Switch, Link, Route, useRouteMatch} from 'react-router-dom';
import ProfileDetail from './ProfileDetail';
import MyProfileDetail from './MyProfileDetail';
import MyAppSettings from './MyAppSettings';
import styles from './Profile.module.css';
import PrivateRoute from '../PrivateRoute';
import ProfileFollowers from './ProfileFollowers';
import EditMyProfile from './EditMyProfile';
import ProfilePersonalInfo from './ProfilePersonalInfo';
import PasswordUpdate from './PasswordUpdate';
import PrivacySettings from './PrivacySettings';
import WorkoutLog from './WorkoutLog';
import TrophyCollection from './TrophyCollection';
import DeleteAccount from './DeleteAccount';
import BlockedUsers from './BlockedUsers';

export default function Profile() {
  let match = useRouteMatch();
  return (
    <div className={styles.container}>
      <Switch>
        <Route path={`${match.path}/edit`} exact>
          {/* My Profile */}
          {/* <Link to="/profile/13"> Test: go to profile with id 13.</Link> */}
          <EditMyProfile />
        </Route>
        <Route path={`${match.path}/workout-log`}>
          <WorkoutLog />
        </Route>
        <Route path={`${match.path}/:profileId?/trophy-collection`}>
          <TrophyCollection />
        </Route>

        <Route path={`${match.path}/settings`} exact>
          <MyAppSettings />
        </Route>
        <Route path={`${match.path}/settings/personal-info`} exact>
          <ProfilePersonalInfo />
        </Route>
        <Route path={`${match.path}/settings/password-update`} exact>
          <PasswordUpdate />
        </Route>
        <Route path={`${match.path}/settings/privacy-settings`} exact>
          <PrivacySettings />
        </Route>
        <Route path={`${match.path}/settings/delete-account`} exact>
          <DeleteAccount />
        </Route>
        <Route path={`${match.path}/settings/blocked-users`} exact>
          <BlockedUsers />
        </Route>

        {/* Designer-coded route in order to make and view a template */}
        <Route path={`${match.path}/:profileId?/followers`}>
          {/* Used for My Profile Followers/Following and for other profiles. */}
          <ProfileFollowers />
        </Route>
        <PrivateRoute
          path={`${match.path}/settings`}
          component={MyAppSettings}
        />
        <Route path={`${match.path}/:profileId`}>
          {/* Someone else's profile */}
          <ProfileDetail />
        </Route>

        <Route path={`${match.path}`}>
          {/* My Profile */}
          {/* <Link to="/profile/13"> Test: go to profile with id 13.</Link> */}
          <MyProfileDetail />
        </Route>
      </Switch>
    </div>
  );
}
