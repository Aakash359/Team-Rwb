import React, {useReducer, useState} from 'react';
import styles from './DeleteAccount.module.css';
import {
  Paper,
  Toolbar,
  IconButton,
  Typography,
  withStyles,
} from '@material-ui/core';
import ChevronBackIcon from '../svgs/ChevronBackIcon';
import {withRouter, useHistory} from 'react-router-dom';
import Loading from '../Loading';
import {POLICY_TERMS_URL} from '../../../../shared/constants/TermURLs';
import TextInput from '../TextInput';
import RWBButton from '../RWBButton';
import DangerIcon from '../svgs/DangerIcon';
import {logLogout} from '../../../../shared/models/Analytics';
import {userLocation} from '../../../../shared/models/UserLocation';
import {userProfile} from '../../../../shared/models/UserProfile';
import {filters} from '../../models/Filters';
import {INVALID_PASSWORD_ERROR} from '../../../../shared/constants/ErrorMessages';
import {rwbApi} from '../../../../shared/apis/api';
import {Alert} from '@material-ui/lab';

const DeleteAccount = () => {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const reducer = (state, action) => {
    const {name, value} = action;
    return {...state, [name]: value};
  };
  const initialState = {
    password: '',
  };

  const [password, setPassword] = useReducer(reducer, initialState);

  const logout = () => {
    logLogout();
    userLocation.deleteUserLocation();
    userProfile.deleteUserProfile();
    history.replace('/login');
    filters.deleteFilters();
  };

  const deleteAccountPressed = () => {
    setIsLoading(true);
    const payload = JSON.stringify({
      id: userProfile.getUserProfile().id,
      password: password.password,
    });
    rwbApi
      .deleteAccount(payload)
      .then((result) => {
        if (result) {
          logout();
        } else {
          setPasswordError(INVALID_PASSWORD_ERROR.toUpperCase());
          alert(`Team RWB: ${INVALID_PASSWORD_ERROR}`);
        }
      })
      .catch((error) => {
        alert(
          'Team RWB: There was an error deleting your account. Please try again later.',
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className={styles.container}>
      <Loading size={100} color={'var(--white)'} loading={isLoading} />
      <Paper className={styles.root}>
        <Toolbar className={styles.toolbar}>
          <IconButton
            edge="start"
            className={styles.menuButton}
            color="inherit"
            onClick={() => history.goBack()}>
            <ChevronBackIcon />
          </IconButton>
          <Typography variant="h6" className={styles.title}>
            Delete Account
          </Typography>
        </Toolbar>
      </Paper>
      <div className={styles.contentContainer}>
        <div className={styles.dangerIconWrapper}>
          <DangerIcon />
        </div>
        <div className={styles.verticalMargin}>
          This will permanently delete your app account and all data associated
          with it.{' '}
          <b className={styles.tintColor}>
            Please note that there is no option to restore the account or its
            data once it is deleted.
          </b>
        </div>
        <div>To continue please enter your password bellow.</div>

        <div className={styles.verticalMargin}>
          <TextInput
            name="password"
            type="password"
            label={'Password'}
            value={password.password}
            onValueChange={(e) => setPassword(e.target)}
          />
        </div>
        <RWBButton
          disabled={password.password.length < 8}
          label={'DELETE ACCOUNT'}
          onClick={() => deleteAccountPressed()}
          buttonStyle={
            password.password.length >= 8 ? 'primary' : 'primaryDisabled'
          }
        />
        <div className={styles.privacyPolicyLabel}>
          <a href={POLICY_TERMS_URL} target="_blank" rel="noopener">
            Privacy Policy & Terms
          </a>
        </div>
      </div>
    </div>
  );
};

export default withRouter(DeleteAccount);
