import React, {Component} from 'react';
import {TEAMRWB} from '../../../../shared/constants/URLs';
import RWBButton from '../RWBButton';
import styles from './Registration.module.css';
import VerifyEmailIcon from '../svgs/VerifyEmailIcon';
import {authentication} from '../../../../shared/models/Authentication';
import {logVerifyEmail} from '../../../../shared/models/Analytics';
import {withRouter} from 'react-router-dom';
import {rwbApi} from '../../../../shared/apis/api';
import AlertDialog from '../AlertDialog';
import Loading from '../Loading';

class RegisterVerifyEmail extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      showDialog: false,
    };
  }

  logout = () => {
    authentication.deleteAuthentication();
    this.props.history.replace('/login');
  };

  checkVerification = () => {
    let analyticsObj = {};
    if (this.props.location.state && this.props.location.state.from)
      analyticsObj.previous_view = this.props.location.state.from;
    logVerifyEmail(analyticsObj);
    const {history} = this.props;
    this.setState({
      isLoading: true,
    });
    rwbApi
      .getUser()
      .then((response) => {
        const {email_verified, profile_completed} = response;
        if (email_verified === true && profile_completed === false) {
          history.push({
            pathname: '/registration/personal_info',
            state: {from: 'Verify Email'}
          });
        } else if (email_verified === true && profile_completed === true) {
          this.props.history.replace('/feed');
        } else {
          this.setState({
            showDialog: true,
            isLoading: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          isLoading: false,
        });
        alert('There was an error contacting the server. Please try again.');
      });
  };

  render() {
    const {isLoading, showDialog} = this.state;

    return (
      <div className={styles.container}>
        <Loading size={100} color={'var(--white)'} loading={isLoading} />
        <div className={styles.headerContainer}>
          <h3 className="title">Verify Your Email</h3>
          <p className="titleSubheader">Step 2 of 6</p>
        </div>
        <div className={styles.contentContainer}>
          <div>
            <VerifyEmailIcon width="100%" height={65} />
            <div className={styles.verifyEmailContent}>
              <p>
                To keep your information safe and secure, <br />
                an email has been sent to you.
              </p>
              <p>
                Didn&apos;t receive the email? <br />
                Check your spam folder or{' '}
                <a className="link" href={TEAMRWB.contact}>
                  contact us
                </a>{' '}
                for help.
              </p>
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <RWBButton
              onClick={this.checkVerification}
              label={"I've Verified My Email"}
              buttonStyle={'primary'}
            />
            <RWBButton
              onClick={this.logout}
              label={'Not you? Back to login.'}
              buttonStyle={'secondary'}
            />
          </div>
        </div>
        <AlertDialog
          text={
            "Please check your email inbox for a link from Team RWB. If you're still having trouble, contact support."
          }
          open={showDialog}
          handleClose={() => this.setState({showDialog: false})}
        />
      </div>
    );
  }
}

export default withRouter(RegisterVerifyEmail);
