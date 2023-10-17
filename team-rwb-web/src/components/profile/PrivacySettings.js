import React, {useState} from 'react';
import styles from './PasswordUpdate.module.css';
import {
  Paper,
  Toolbar,
  IconButton,
  Typography,
  withStyles,
  Divider,
} from '@material-ui/core';
import ChevronBackIcon from '../svgs/ChevronBackIcon';
import {withRouter, useHistory} from 'react-router-dom';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import {ANON_PROPS} from '../../../../shared/constants/RadioProps';
import {rwbApi} from '../../../../shared/apis/api';
import {userProfile} from '../../../../shared/models/UserProfile';
import Loading from '../Loading';
import {POLICY_TERMS_URL} from '../../../../shared/constants/TermURLs';
import {logUpdatePrivacySettings} from '../../../../shared/models/Analytics';

const {anon_radio_props} = ANON_PROPS;

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
  radioGroup: {
    margin: '20px 0',
  },
  radioItem: {
    position: 'relative',
    margin: '10px 0',
  },
  privacyPolicyLabel: {
    margin: '0 auto',
    color: 'var(--magenta)',
    cursor: 'pointer',
  },
};

const PrivacySettings = ({classes}) => {
  const history = useHistory();
  const [anonymousProfile, setAnonymousProfile] = useState(
    userProfile.getUserProfile().anonymous_profile.toString(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isPrivacyModal, setIsPrivacyModal] = useState(false);

  const handleChange = (e) => setAnonymousProfile(e.target.value);

  const privacyModalHandler = (state) => setIsPrivacyModal(state);

  const onSave = () => updateUser(anonymousProfile);

  const updateUser = (anonymous_profile) => {
    setIsLoading(true);

    let data = JSON.stringify({
      anonymous_profile,
    });

    return rwbApi
      .putUser(data)
      .then(() => {
        logUpdatePrivacySettings();
        setIsLoading(false);
        history.goBack();
      })
      .catch(() => {
        setIsLoading(false);
        alert(
          'Team RWB',
          'There was a problem contacting the Team RWB server. Please try again later.',
        );
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
            Privacy Settings
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
        <FormControl component="fieldset">
          <FormLabel component="legend">Profile privacy settings</FormLabel>
          <RadioGroup
            aria-label="privacy settings"
            value={anonymousProfile}
            onChange={handleChange}
            className={classes.radioGroup}>
            {anon_radio_props &&
              anon_radio_props.map((item, key) => (
                <>
                  <FormControlLabel
                    key={key.toString()}
                    value={item.value.toString()}
                    control={<Radio />}
                    label={item.label}
                    className={classes.radioItem}
                  />
                  <Divider />
                </>
              ))}
          </RadioGroup>
        </FormControl>
        <div className={classes.privacyPolicyLabel}>
          <a href={POLICY_TERMS_URL} target="_blank" rel="noopener">
            Privacy Policy & Terms
          </a>
        </div>
      </div>
    </div>
  );
};

export default withRouter(withStyles(useStyles)(PrivacySettings));
