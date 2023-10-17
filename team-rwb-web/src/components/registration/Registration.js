import React, {useState} from 'react';
import {Switch, Route, useRouteMatch, useHistory} from 'react-router-dom';
import PrivateRoute from '../PrivateRoute';
import RegisterVerifyEmail from './RegisterVerifyEmail';
import RegisterPersonalInfo from './RegisterPersonalInfo';
import RegisterSocialProfile from './RegisterSocialProfile';
import RegisterMilitaryService from './RegisterMilitaryService';
import RegisterPrivacyWaiver from './RegisterPrivacyWaiver';
import RegisterRedShirt from './RegisterRedShirt';
import RegisterGetRedShirt from './RegisterGetRedShirt';
import RegisterRedShirtComplete from './RegisterRedShirtComplete';
import RegisterOrderConfirmation from './RegisterOrderConfirmation';
import TextInput from '../TextInput';
import RWBButton from '../RWBButton';
import styles from './Registration.module.css';
import LegalModal from '../profile/LegalModal';
import {rwbApi} from '../../../../shared/apis/api';
import {userProfile} from '../../../../shared/models/UserProfile';
import {isNullOrEmpty} from '../../../../shared/utils/Helpers';
import Loading from '../Loading';
import {
  COOKIE_POLICY_URL,
  COMMUNITY_GUIDELINES_URL,
  POLICY_TERMS_URL,
} from '../../../../shared/constants/TermURLs';
import {logCreateAccount} from '../../../../shared/models/Analytics';

export default function Registration() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [firstNameErrorText, setFirstNameErrorText] = useState('');
  const [lastNameErrorText, setLastNameErrorText] = useState('');
  const [emailErrorText, setEmailErrorText] = useState('');
  const [confirmEmailErrorText, setConfirmEmailErrorText] = useState('');
  const [passwordErrorText, setPasswordErrorText] = useState('');
  const [confirmPasswordErrorText, setConfirmPasswordErrorText] = useState('');
  const [serverErrorText, setServerErrorText] = useState('');
  const [isPrivacyModal, setIsPrivacyModal] = useState(false);

  const match = useRouteMatch();
  const history = useHistory();

  const privacyModalHandler = (state) => setIsPrivacyModal(state);

  const clearErrorWarnings = () => {
    setFirstNameErrorText('');
    setLastNameErrorText('');
    setEmailErrorText('');
    setConfirmEmailErrorText('');
    setPasswordErrorText('');
    setConfirmPasswordErrorText('');
    setServerErrorText('');
  };

  const createAccountPressed = () => {
    clearErrorWarnings();

    //Local error checking

    let field_is_required_string = 'THIS FIELD IS REQUIRED';
    let hasError = false;

    if (isNullOrEmpty(firstName)) {
      setFirstNameErrorText(field_is_required_string);
      hasError = true;
    }
    if (isNullOrEmpty(lastName)) {
      setLastNameErrorText(field_is_required_string);
      hasError = true;
    }
    if (isNullOrEmpty(email)) {
      setEmailErrorText(field_is_required_string);
      hasError = true;
    }
    if (email.endsWith('teamrwb.org')) {
      setEmailErrorText('PLEASE USE A NON-TEAMRWB EMAIL');
      hasError = true;
    }
    if (isNullOrEmpty(confirmEmail)) {
      setConfirmEmailErrorText(field_is_required_string);
      hasError = true;
    }
    if (email !== confirmEmail) {
      setConfirmEmailErrorText('EMAIL DOES NOT MATCH');
      hasError = true;
    }
    if (isNullOrEmpty(password)) {
      setPasswordErrorText(field_is_required_string);
      hasError = true;
    }
    if (!isNullOrEmpty(password) && password.length < 8) {
      setPasswordErrorText('PASSWORD MUST BE AT LEAST 8 CHARACTERS LONG');
      hasError = true;
    }
    if (isNullOrEmpty(confirmPassword)) {
      setConfirmPasswordErrorText(field_is_required_string);
      hasError = true;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordErrorText('PASSWORD DOES NOT MATCH');
      hasError = true;
    }

    if (hasError) return;
    let analyticsObj = {};
    // TODO figure out why history state is empty
    if (history.state && history.state.from)
      analyticsObj.previous_view = history.state.from;
    logCreateAccount(analyticsObj);
    createUser(firstName, lastName, email, password);
  };

  const createUser = (firstName, lastName, email, password) => {
    setIsLoading(true);
    return rwbApi
      .createNewUser(
        JSON.stringify({
          grant_type: 'client_credentials',
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
        }),
      )
      .then((response) => {
        if (response.status === 201) {
          response.json().then((jsonBody) => {
            setServerErrorText('');
            userProfile.setUserId(jsonBody.id);
            rwbApi
              .loginUser(email, password)
              .then((response) => {
                rwbApi.putUser(
                  JSON.stringify({registration_started_via_app: true}),
                );
                history.push({
                  pathname: `${match.path}/confirm_email`,
                  state: {from: 'Registration'},
                })
              })
              .catch((error) => {
                alert(
                  'Server error. Please try again. If the problem persists, please contact support@teamrwb.org',
                );
                setIsLoading(false);
              });
          });
        } else {
          response.json().then((jsonBody) => {
            setIsLoading(false);
            if (jsonBody.code === 'existing_user_login') {
              setEmailErrorText('AN ACCOUNT WITH THIS EMAIL ALREADY EXISTS');
            } else {
              setServerErrorText(
                'THERE WAS A PROBLEM WITH THE SERVER. PLEASE TRY AGAIN',
              );
            }
          });
        }
      })
      .catch(() => {
        setIsLoading(false);
        setServerErrorText(
          'THERE WAS A PROBLEM WITH THE SERVER, PLEASE TRY AGAIN',
        );
      });
  };

  return (
    <div>
      <Switch>
        <PrivateRoute
          path={`${match.path}/confirm_email`}
          component={RegisterVerifyEmail}
        />
        <PrivateRoute
          path={`${match.path}/personal_info`}
          component={RegisterPersonalInfo}
        />
        <PrivateRoute
          path={`${match.path}/social_info`}
          component={RegisterSocialProfile}
        />
        <PrivateRoute
          path={`${match.path}/military_info`}
          component={RegisterMilitaryService}
        />
        <PrivateRoute
          path={`${match.path}/privacy_info`}
          component={RegisterPrivacyWaiver}
        />
        <PrivateRoute
          path={`${match.path}/red_shirt`}
          component={RegisterRedShirt}
        />
        <PrivateRoute
          path={`${match.path}/shipping_info`}
          component={RegisterGetRedShirt}
        />
        <PrivateRoute
          path={`${match.path}/billing_info`}
          component={RegisterRedShirtComplete}
        />
        <PrivateRoute
          path={`${match.path}/order_confirmation`}
          component={RegisterOrderConfirmation}
        />
        {/* Next route is public -- they need to create an account before they can auth! */}
        <Route path={match.path}>
          <Loading size={100} color={'var(--white)'} loading={isLoading} />
          <div className={styles.container}>
            <div className={styles.headerContainer}>
              <h3 className="title">Signup</h3>
              <p className="titleSubheader">Step 1 of 6</p>
            </div>
            <div className={styles.contentContainer}>
              <div className={styles.formContainer}>
                <TextInput
                  label={'First Name'}
                  error={firstNameErrorText}
                  value={firstName}
                  onValueChange={(text) => setFirstName(text.target.value)}
                  onEnter={createAccountPressed}
                  autoFillLabel="given-name"
                />
                <TextInput
                  label={'Last Name'}
                  error={lastNameErrorText}
                  value={lastName}
                  onValueChange={(text) => setLastName(text.target.value)}
                  onEnter={createAccountPressed}
                  autoFillLabel="family-name"
                />
                <TextInput
                  label={'Email'}
                  type={'email'}
                  error={emailErrorText}
                  value={email}
                  onValueChange={(text) => setEmail(text.target.value)}
                  onEnter={createAccountPressed}
                />
                <p>
                  Please use a civilian or non-government email address. (Note:
                  Eagle Leaders, please do not use your @teamrwb.org email
                  address)
                </p>
                <TextInput
                  label={'Confirm Email'}
                  type={'email'}
                  error={confirmEmailErrorText}
                  value={confirmEmail}
                  onValueChange={(text) => setConfirmEmail(text.target.value)}
                  onEnter={createAccountPressed}
                />
                <TextInput
                  label={'Password'}
                  type={'password'}
                  error={passwordErrorText}
                  value={password}
                  onValueChange={(text) => setPassword(text.target.value)}
                  onEnter={createAccountPressed}
                />
                <TextInput
                  label={'Confirm Password'}
                  type={'password'}
                  error={confirmPasswordErrorText}
                  value={confirmPassword}
                  onValueChange={(text) =>
                    setConfirmPassword(text.target.value)
                  }
                  onEnter={createAccountPressed}
                />
              </div>
              <div className={styles.privacyPolicyContainer}>
                <p>
                  By creating an account, you agree to Team Red, White & Blue's{' '}
                  <a
                    className={`link ${styles.clickable}`}
                    target="_blank"
                    rel="noopener"
                    href={POLICY_TERMS_URL}>
                    Privacy Policy & Terms
                  </a>
                  &nbsp;and&nbsp;
                  <a
                    className={`link ${styles.clickable}`}
                    target="_blank"
                    rel="noopener"
                    href={COMMUNITY_GUIDELINES_URL}>
                    Community Guidelines
                  </a>
                </p>
              </div>
              {serverErrorText != '' && (
                <p className={`errorMessage ${styles.centerText}`}>
                  {serverErrorText}
                </p>
              )}
              <div className={styles.buttonContainer}>
                <RWBButton
                  onClick={createAccountPressed}
                  label="Create Account"
                  buttonStyle="primary"
                />
                <RWBButton
                  link={true}
                  to="/login"
                  label="Have an account? Login Here"
                  buttonStyle="secondary"
                />
              </div>
            </div>
          </div>
          {isPrivacyModal && (
            <LegalModal modalHandler={privacyModalHandler} type="privacy" />
          )}
        </Route>
      </Switch>
    </div>
  );
}
