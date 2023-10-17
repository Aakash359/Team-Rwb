import React, {useState, useEffect} from 'react';
import {Route, Redirect} from 'react-router-dom';
// import fakeAuth from '../mock/isAuthed';
import {authentication} from '../../../shared/models/Authentication';
import {rwbApi} from '../../../shared/apis/api';
import Loading from './Loading';

export default function PrivateRoute({component: Component, ...rest}) {
  const [isAuth, setisAuth] = useState(false);
  const [isLoading, setisLoading] = useState(true);

  useEffect(() => {
    if (!authentication.loaded) {
      authentication
        .getAccessToken()
        .then((accessToken) => {
          if (accessToken) return accessToken;
          return Promise.reject('Missing Credentials');
        })
        .then(rwbApi.getAuthenticatedUser)
        .then((json) => {
          setisAuth(true);
          setisLoading(false);
        })
        .catch(() => {
          setisAuth(false);
          setisLoading(false);
        });
    } else {
      setisAuth(true);
      setisLoading(false);
    }
  }, []);

  return (
    <Route
      {...rest}
      render={(props) => {
        // TODO Use a proper authentication check
        return isLoading ? (
          <Loading size={100} color={'var(--white)'} loading={true} />
        ) : isAuth ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: {referrer: window.location.href},
            }}
          />
        );
      }}
    />
  );
}
