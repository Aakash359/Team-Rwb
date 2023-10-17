import React, {useEffect} from 'react';

import {authentication} from '../../../../shared/models/Authentication';
import {rwbApi} from '../../../../shared/apis/api';
import {useHistory} from 'react-router-dom';
import RWBLogoVertical from '../svgs/RWBLogoVertical';

const Home = (props) => {
  let history = useHistory();

  useEffect(() => {
    authentication
      .getAccessToken()
      .then((accessToken) => {
        if (accessToken) return accessToken;
        return Promise.reject('Missing Credentials');
      })
      .then(rwbApi.getAuthenticatedUser)
      .then((json) => {
        const {email_verified, profile_completed} = json;
        if (!email_verified) {
          history.push(`/registration/confirm_email`);
        } else if (email_verified && !profile_completed) {
          history.push('/registration/personal_info');
        } else {
          history.push('/feed');
        }
      })
      .catch(() => {
        history.push('login');
      });
  }, [history]);

  return (
    <div style={{height: '100vh', display: 'flex', justifyContent: 'center'}}>
      <div style={{marginTop: 60, padding: 40}}>
        <RWBLogoVertical fullWidth height={250} />
      </div>
    </div>
  );
};

export default Home;
