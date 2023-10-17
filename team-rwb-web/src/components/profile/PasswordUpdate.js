import React, {useReducer, useState} from 'react';
import styles from './PasswordUpdate.module.css';
import {
  Paper,
  Toolbar,
  IconButton,
  Typography,
  withStyles,
} from '@material-ui/core';
import ChevronBackIcon from '../svgs/ChevronBackIcon';
import {rwbApi} from '../../../../shared/apis/api';

import {withRouter, useHistory} from 'react-router-dom';
import Loading from '../Loading';
import TextInput from '../TextInput';
import {isNullOrEmpty} from '../../../../shared/utils/Helpers';
import {logUpdatePassword} from '../../../../shared/models/Analytics';

const useStyles = {
  root: {
    flexGrow: 1,
  },
  menuButton: {
    color: 'var(--white)',
  },
  title: {
    color: 'var(--white)',
    textTransform: 'capitalize',
    fontFamily: 'OpenSans-Bold',
    textAlign: 'center',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  toolbar: {
    position: 'relative',
    justifyContent: 'space-between',
    backgroundColor: 'var(--magenta)',
  },
  button: {
    color: 'white',
    textTransform: 'capitalize',
  },
  save: {
    color: 'var(--white)',
    textTransform: 'capitalize',
    fontWeight: 'bold',
  },
};

const PasswordUpdate = ({classes}) => {
  const history = useHistory();
  const initialState = {
    newPassword: '',
    newPasswordConfirm: '',
  };

  const reducer = (state, action) => {
    const {name, value} = action;
    return {...state, [name]: value};
  };

  const [password, setPassword] = useReducer(reducer, initialState);
  const [newPasswordError, setNewPasswordError] = useState('');
  const [newPasswordConfirmError, setNewPasswordConfirmError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const clearErrors = () => {
    setNewPasswordError('');
    setNewPasswordConfirmError('');
  };

  const onSave = () => {
    clearErrors();

    const {newPassword, newPasswordConfirm} = password;

    let hasError = false;

    if (isNullOrEmpty(newPassword)) {
      setNewPasswordError('THIS FIELD IS REQUIRED');
      hasError = true;
    }
    if (!isNullOrEmpty(newPassword) && newPassword.length < 8) {
      setNewPasswordError('PASSWORD MUST BE AT LEAST 8 CHARACTERS LONG');
      hasError = true;
    }
    if (isNullOrEmpty(newPasswordConfirm)) {
      setNewPasswordConfirmError('THIS FIELD IS REQUIRED');
      hasError = true;
    }
    if (
      !isNullOrEmpty(newPasswordConfirm) &&
      newPassword !== newPasswordConfirm
    ) {
      setNewPasswordConfirmError('PASSWORD DOES NOT MATCH');
      hasError = true;
    }

    if (hasError) return;
    else {
      updatePassword(newPassword);
    }
  };

  const updatePassword = (new_password) => {
    logUpdatePassword();
    setIsLoading(true);
    const payload = JSON.stringify({
      password: new_password,
    });
    rwbApi.putUser(payload).then((res) => {
      setIsLoading(false);
      history.goBack();
    });
  };

  return (
    <div className={styles.container}>
      <Loading size={100} color={'var(--white)'} loading={isLoading} />
      <Paper className={classes.root}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            onClick={() => history.goBack()}>
            <ChevronBackIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Update Password
          </Typography>
          <IconButton
            edge="end"
            className={classes.menuButton}
            color="inherit"
            onClick={onSave}>
            <Typography variant="h6" className={classes.save}>
              Save
            </Typography>
          </IconButton>
        </Toolbar>
      </Paper>
      <div className={styles.contentContainer}>
        <TextInput
          name="newPassword"
          type="password"
          label={'New password'}
          value={password.newPassword}
          error={newPasswordError}
          onValueChange={(e) => setPassword(e.target)}
        />
        <TextInput
          name="newPasswordConfirm"
          type="password"
          label={'Confirm new password'}
          value={password.newPasswordConfirm}
          error={newPasswordConfirmError}
          onValueChange={(e) => setPassword(e.target)}
        />
      </div>
    </div>
  );
};

export default withRouter(withStyles(useStyles)(PasswordUpdate));
