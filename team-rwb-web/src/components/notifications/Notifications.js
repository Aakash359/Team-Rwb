import React from 'react';
import {Switch, Route, useRouteMatch, useHistory} from 'react-router-dom';
import NotificationsList from './NotificationsList';
import styles from './Notifications.module.css';
import Header from '../Header';

export default function Notifications(props) {
  let match = useRouteMatch();

  const history = useHistory();

  return (
    <div className={styles.container}>
      <Header title={'Notifications'} onBack={() => history.goBack()} />
      <Switch>
        <Route path={match.path}>
          <NotificationsList />
        </Route>
      </Switch>
    </div>
  );
}
