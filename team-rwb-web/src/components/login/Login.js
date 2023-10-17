import React, {Component} from 'react';
import TextInput from '../TextInput';
import RWBButton from '../RWBButton';
import styles from './Login.module.css';
import {TEAMRWB} from '../../../../shared/constants/URLs';

// SVGs
import RWBLogoVertical from '../svgs/RWBLogoVertical';
import FacebookLoginIcon from '../svgs/FacebookLoginIcon';
import LinkedInLoginIcon from '../svgs/LinkedInLoginIcon';
import GoogleLoginIcon from '../svgs/GoogleLoginIcon';

import {isNullOrEmpty, validateEmail} from '../../../../shared/utils/Helpers';
import {rwbApi} from '../../../../shared/apis/api';
import Loading from '../Loading';
import {OldSocialLogin as SocialLogin} from 'react-social-login';
import {
  GOOGLE_CLIENT_IDS,
  LINKEDIN_API_KEY,
} from '../../../../shared/constants/APIKeys-obfuscated';
import {logForgotPassword, logLogin} from '../../../../shared/models/Analytics';

import LoginLinkedin from './LoginLinkedin';
import {OAcreateUser} from '../../../../shared/apis/oneall-api';
import {authentication} from '../../../../shared/models/Authentication';
import {INVALID_LOGIN_ERROR} from '../../../../shared/constants/ErrorMessages';
import ApiInfo from '../ApiInfo';
import GoogleLoginButton from './GoogleLoginButton';

export default class Login extends Component {
  state = {
    value: 0,
    email: '',
    password: '',
    email_error_text: null,
    password_error_text: null,
    isLoading: false,
  };

  valueChangeHandler = (event, field) => {
    this.setState({[field]: event.target.value});
  };

  clearErrors() {
    this.setState({
      email_error_text: '',
      password_error_text: '',
    });
  }

  loginHandler = () => {
    logLogin();
    let {email, password} = this.state;
    const {history} = this.props;

    this.clearErrors();
    let hasError = false;

    if (isNullOrEmpty(email) || !validateEmail(email)) {
      this.setState({email_error_text: 'PLEASE ENTER A VALID EMAIL'});
      hasError = true;
    }
    if (!password || password === null || password === '') {
      this.setState({password_error_text: 'ENTER YOUR PASSWORD'});
      hasError = true;
    }

    if (hasError) {
      return;
    }

    this.setState({
      email: email.trim(),
      isLoading: true,
    });
    rwbApi
      .loginUser(email, password)
      .then((json) => {
        this.setState({isLoading: false});
        const {email_verified, profile_completed} = json;
        if (!email_verified) {
          history.push(`/registration/confirm_email`);
        } else if (email_verified && !profile_completed) {
          history.push('/registration/personal_info');
        } else {
          let referrer = this.props.location?.state?.referrer;
          if (referrer) {
            referrer = referrer.replace(window.location.origin, '');
            referrer = referrer.replace(window.port, '');
            history.replace(referrer);
          } else history.replace('/feeds');
        }
      })
      .catch((error) => {
        console.warn(error);
        this.setState({
          password_error_text: INVALID_LOGIN_ERROR.toUpperCase(),
          isLoading: false,
        });
      });
  };

  // Commented parts of the code for social logins
  handleFacebookLogin = (user, err) => {
    const {history} = this.props;

    OAcreateUser('facebook', '', user._token.accessToken, '') // no access token secret given for fb
      .then((response) => {
        const {email_verified, profile_completed} = response;
        if (!email_verified) {
          history.push(`/registration/confirm_email`);
        } else if (email_verified && !profile_completed) {
          history.push('/registration/personal_info');
        } else {
          history.push('/feed');
        }
      })
      .catch((error) => {
        console.warn(error);
        authentication.deleteAuthentication();
      });
  };

  handleGoogleLogin = (user, err) => {
    const {history} = this.props;
    return OAcreateUser('google', '', user.access_token, '')
      .then((response) => {
        const {email_verified, profile_completed} = response;
        if (!email_verified) {
          history.push(`/registration/confirm_email`);
        } else if (email_verified && !profile_completed) {
          history.push('/registration/personal_info');
        } else {
          history.replace('/events');
        }
        history.push('/feed');
      })
      .catch((error) => {
        authentication.deleteAuthentication();
        console.warn(error);
      });
  };

  handleLinkedinLogin = (user, err) => {
    const {history} = this.props;
    return OAcreateUser('linkedin', '', user._token.accessToken, '').then(
      (response) => {
        const {email_verified, profile_completed} = response;
        if (!email_verified) {
          history.push(`/registration/confirm_email`);
        } else if (email_verified && !profile_completed) {
          history.push('/registration/personal_info');
        } else {
          history.replace('/events');
        }
        history.push('/feed');
      },
    );
    // console.log('callback successs');
    // if (error) {
    //   // signin failed
    // } else {
    //   // Obtain authorization token from linkedin api
    //   // see https://developer.linkedin.com/docs/oauth2 for more info
    //   console.log('code', code);
    //   console.log('redirectUri', redirectUri);
    // }
  };

  render() {
    const {
      email,
      password,
      email_error_text,
      password_error_text,
      isLoading,
    } = this.state;
    return (
      <>
        <Loading size={100} color={'var(--white)'} loading={isLoading} />
        <div className="fullScreenContainer">
          {/* Added fullWidth prop to avoid error of Invalid prop `width` of type `string`  */}
          <RWBLogoVertical className={styles.logo} fullWidth height={250} />
          <TextInput
            label={'Email'}
            type={'text'}
            value={email}
            onValueChange={(event) => this.valueChangeHandler(event, 'email')}
            error={email_error_text}
            onEnter={this.loginHandler}
          />
          <TextInput
            label={'Password'}
            type={'password'}
            value={password}
            onValueChange={(event) =>
              this.valueChangeHandler(event, 'password')
            }
            error={password_error_text}
            onEnter={this.loginHandler}
          />

          <p className={styles.forgotPasswordText}>
            Forgot your password?{' '}
            <a
              className="link"
              onClick={logForgotPassword}
              href={TEAMRWB.lostpassword}>
              Click Here
            </a>
          </p>
          <RWBButton
            label="Log In"
            buttonStyle="primary"
            onClick={this.loginHandler}
          />
          {/* Use custom on-press here later to ensure auth goes through -before- redirect */}
          <div className={styles.socialLoginContainer}>
            {/* Commented parts of the code for social logins */}
            <SocialLogin
              provider="facebook"
              appId="1729973627311182"
              callback={this.handleFacebookLogin}
              triggerLogout={this.logoutHandler}>
              <FacebookLoginIcon className={styles.socialLoginIcons} />
            </SocialLogin>
            <GoogleLoginButton handleLogin={this.handleGoogleLogin}/>
            {/* <LoginLinkedin
              clientId={LINKEDIN_API_KEY.id}
              callback={this.handleLinkedinLogin}
              className={styles.socialLoginIcons}
              scope={['r_liteprofile', 'r_emailaddress']}
              text="Login With LinkedIn"
            /> */}
          </div>
          <RWBButton
            link={true}
            to="/registration"
            state={{from: 'Login'}}
            label="Create Account"
            buttonStyle="secondary"
          />
          <ApiInfo />
        </div>
      </>
    );
  }
}
