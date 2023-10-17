import React, {useState} from 'react';
import styles from './MyAppSettings.module.css';
import {
  Toolbar,
  IconButton,
  Typography,
  Button,
  makeStyles,
  Paper,
} from '@material-ui/core';
import {Close as CloseIcon} from '@material-ui/icons';
import {rwbApi} from '../../../../shared/apis/api';
import RWBRowButton from '../RWBRowButton';
import PrivacyIcon from '../svgs/PrivacyIcon';
import AccountIcon from '../svgs/AccountIcon';
import LogoutIcon from '../svgs/LogoutIcon';
import KeyIcon from '../svgs/KeyIcon';
import DocumentIcon from '../svgs/DocumentIcon';
import MailIcon from '../svgs/EmailIcon';
import {userLocation} from '../../../../shared/models/UserLocation';
import {userProfile} from '../../../../shared/models/UserProfile';
import {authentication} from '../../../../shared/models/Authentication';
import {logLogout} from '../../../../shared/models/Analytics';
import {useHistory, useRouteMatch} from 'react-router-dom';
import {filters} from '../../models/Filters';
import LegalModal from './LegalModal';
import {
  COOKIE_POLICY_URL,
  COMMUNITY_GUIDELINES_URL,
  POLICY_TERMS_URL,
} from '../../../../shared/constants/TermURLs';
import {isDev} from '../../../../shared/utils/IsDev';
import {NEWSLETTER_PREFERENCES} from '../../../../shared/constants/URLs';
import TrashIcon from '../svgs/TrashIcon';
import BlockIcon from '../svgs/BlockIcon';

const MyAppSettings = () => {
  const useStyles = makeStyles(() => ({
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
      // title should always center, regardless of length of siblings
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
    bottomRow: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '10px',
    },
  }));
  const classes = useStyles();

  const history = useHistory();
  const match = useRouteMatch();
  const [isLegalWaiver, setIsLegalWaiver] = useState(false);

  const legalWaiverHandler = (state) => setIsLegalWaiver(state);

  // Temporary logout logic
  const logoutHandler = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logLogout();
      userLocation.deleteUserLocation();
      userProfile.deleteUserProfile();
      filters.deleteFilters();
      await authentication.deleteAuthentication();
      history.replace('/login');
      // FBLoginManager.logOut();
      // GoogleSignin.signOut();
    }
  };

  return (
    <div className={styles.container}>
      <Paper className={classes.root}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            className={classes.menuButton + ' ' + classes.firstItem}
            color="inherit"
            onClick={() => history.goBack()}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            App Settings
          </Typography>
        </Toolbar>
      </Paper>
      <div className={styles.content} style={{height: '80%'}}>
        <RWBRowButton
          label="Personal Information"
          onClick={() => history.push(`${match.path}/personal-info`)}>
          <AccountIcon />
        </RWBRowButton>
        <RWBRowButton
          label="Privacy Settings"
          onClick={() => history.push(`${match.path}/privacy-settings`)}>
          <PrivacyIcon />
        </RWBRowButton>
        <RWBRowButton
          label="Blocked Users"
          onClick={() => history.push(`${match.path}/blocked-users`)}>
          <BlockIcon />
        </RWBRowButton>
        <RWBRowButton
          label="Update Password"
          onClick={() => history.push(`${match.path}/password-update`)}>
          <KeyIcon />
        </RWBRowButton>
        <RWBRowButton
          label="Legal Waiver"
          onClick={() => legalWaiverHandler(true)}>
          <DocumentIcon />
        </RWBRowButton>
        <RWBRowButton
          label="Delete Account"
          onClick={() => history.push(`${match.path}/delete-account`)}>
          <TrashIcon />
        </RWBRowButton>
        <RWBRowButton
          label="Newsletter Preferences"
          onClick={() => {
            // no preferences on staging, so use acccount 176249 (Daniel Ellman) on prod
            isDev()
              ? window.open(`${NEWSLETTER_PREFERENCES}0033h00000OZ5dBAAT`)
              : window.open(
                  `${NEWSLETTER_PREFERENCES}${userProfile.salesforce_contact_id}`,
                );
          }}>
          {/* fix size */}
          <MailIcon />
        </RWBRowButton>
        <RWBRowButton label="Logout" onClick={logoutHandler}>
          <LogoutIcon />
        </RWBRowButton>
        {isLegalWaiver && <LegalModal modalHandler={legalWaiverHandler} />}
      </div>
      {/* links and version number */}
      <div className={classes.bottomRow}>
        <a
          className="link"
          href={POLICY_TERMS_URL}
          target="_blank"
          rel="noreferrer noopener">
          Privacy Policy & Terms
        </a>
        <a
          className="link"
          href={COMMUNITY_GUIDELINES_URL}
          target="_blank"
          rel="noreferrer noopener">
          Community Guidelines
        </a>
        <a
          className="link"
          href={COOKIE_POLICY_URL}
          target="_blank"
          rel="noreferrer noopener">
          Cookie Policy
        </a>
        {/* TODO add version number */}
      </div>
    </div>
  );
};
export default MyAppSettings;
