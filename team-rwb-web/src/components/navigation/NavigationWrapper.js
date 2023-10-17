import React from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import PrivateRoute from '../PrivateRoute';
import Events from '../events/Events';
import Feed from '../feed/Feed';
import Groups from '../groups/Groups';
import Notifications from '../notifications/Notifications';
import Profile from '../profile/Profile';
import Login from '../login/Login';
import Registration from '../registration/Registration';
import Home from '../home/Home';
import NavigationColumn from './NavigationColumn';
import Challenges from '../challenges/Challenges';
import RecordWorkout from '../recordWorkout/RecordWorkout';

export default function NavigationWrapper() {
  return (
    <Router>
      <NavigationColumn />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/registration" component={Registration} />
        <PrivateRoute path="/feed" component={Feed} />
        <PrivateRoute path="/groups" component={Groups} />
        <PrivateRoute path="/events" component={Events} />
        <PrivateRoute path="/notifications" component={Notifications} />
        <PrivateRoute path="/profile" component={Profile} />
        <PrivateRoute path="/challenges" component={Challenges} />
        <Route path="/" component={Home} />
      </Switch>
    </Router>
  );
}
