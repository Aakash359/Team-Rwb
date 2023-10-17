import React, {Component} from 'react';
import RWBButton from '../RWBButton';
import ToggleSwitch from '../ToggleSwitch';
import styles from './Registration.module.css';
import RadioButtons from '../profile/RadioButtons';
import {ANON_PROPS} from '../../../../shared/constants/RadioProps';
import {userProfile} from '../../../../shared/models/UserProfile';
import LegalModal from '../profile/LegalModal';
import {rwbApi} from '../../../../shared/apis/api';
import {MILITARY_STATUSES} from '../../../../shared/constants/MilitaryStatusSlugs';
import {logCompleteRegistration} from '../../../../shared/models/Analytics';
import Loading from '../Loading';
import {withRouter} from 'react-router-dom';

const {anon_radio_props} = ANON_PROPS;

class RegisterPrivacyWaiver extends Component {
  constructor() {
    super();
    // on mobile there is a flow to make users who have stale data update. When that is implemented on web, this will need to be readressed
    // const existing_profile = userProfile.getUserProfile();
    this.state = {
      user: userProfile.getUserProfile(),
      anonymous_profile: false, // despite being set as null initially, the original instance of existing_profile has anonymous_profile as true (Even on the step directly after confirming email)
      legal_waiver: false,
      legal_waiver_error_text: '',
      isLegalWaiver: false,
      isLoading: false,
    };
  }

  legalWaiverHandler = (state) => this.setState({isLegalWaiver: state});

  legalWaiverStatusHandler = () =>
    this.setState({
      legal_waiver: !this.state.legal_waiver,
    });

  anonymousProfileHandler = (value) =>
    this.setState({anonymous_profile: value});

  nextPressed = () => {
    let analyticsObj = {};
    if (this.props.location.state && this.props.location.state.from)
      analyticsObj.previous_view = this.props.location.state.from;
    logCompleteRegistration(analyticsObj);
    const {anonymous_profile, legal_waiver} = this.state;

    if (!legal_waiver) {
      this.setState({
        legal_waiver_error_text: 'YOU MUST ACCEPT THE WAIVER TO CONTINUE',
      });
      return;
    } else {
      this.setState({legal_waiver_error_text: ''});
    }

    const {location} = this.props;
    let value = location.state?.value || {};

    value = Object.assign(value, {
      anonymous_profile,
      legal_waiver_signed: legal_waiver,
    });
    this.setState({isLoading: true});

    // Uncomment to test and not save the user profile
    // if (value.military_status !== MILITARY_STATUSES.civilian && value.registration_started_via_app) {
    //   this.props.history.push({
    //     pathname: '/registration/red_shirt',
    //     state: {value},
    //   });
    // }
    // return;

    this.updateUser(value)
      .then((response) => {
        this.setState({
          isLoading: false,
        });
        rwbApi.getUser().then((response) => {
          if (
            value.military_status !== MILITARY_STATUSES.civilian &&
            value.registration_started_via_app &&
            !response.stripe_transaction_date // default value seems to be an empty string, otherwise date in a string
          ) {
            this.props.history.push({
              pathname: '/registration/red_shirt',
              state: {value, from: 'Privacy/Waiver'},
            });
          } else
            this.props.history.push({
              pathname: '/feed',
              state: {newAccount: true},
            });
        });
      })
      .catch((error) => {
        alert('There was a problem contacting the server. Please try again.');
        this.setState({
          isLoading: false,
        });
      });
  };

  updateUser(value) {
    const {anonymous_profile, legal_waiver} = this.state;
    let payload = {
      //Profile Info
      first_name: value.first_name,
      last_name: value.last_name,
      profile_bio: value.profile_bio,
      street: value.location?.address,
      street_2: value.location?.apartment, //optional apartment field
      state: value.location?.address_state,
      address_type: value.location?.address_type,
      city: value.location?.city,
      zipcode: value.location?.zip,
      country: value.location?.country,
      address_verified: value.address_verified,
      international_address_verified: value?.international_address_verified,
      phone: value.phone,
      gender: value.gender,

      military_status: value.military_status,

      //Legal Waiver
      anonymous_profile: anonymous_profile,
      legal_waiver_signed: legal_waiver,
    };

    if (value.military_status === MILITARY_STATUSES.veteran) {
      payload.military_ets = value.military_ets;
    }
    if (value.military_status !== MILITARY_STATUSES.civilian) {
      payload.military_rank = value.military_rank;
      payload.combat_zone = value.combat_zone;
      payload.has_disability = value.has_disability;
      payload.military_branch = value.military_branch;
    } else payload.military_family_member = value.military_family_member;
    // extra chance to avoid salesforce syncing issues
    if (value.combat_zone)
      payload.combat_deployment_operations = value.combat_deployment_operations;
    return rwbApi.putUser(JSON.stringify(payload));
  }

  render() {
    const {
      isLoading,
      isLegalWaiver,
      anonymous_profile,
      legal_waiver,
      legal_waiver_error_text,
    } = this.state;
    return (
      <div className={styles.container}>
        <Loading size={100} color={'var(--white)'} loading={isLoading} />
        <div className={styles.headerContainer}>
          <h3 className="title">Privacy/Waiver</h3>
          <p className="titleSubheader">Step 6 of 6</p>
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.formContainer}>
            <p className="formLabel">Legal Waiver</p>
            <p className="bodyCopy">
              <span
                className={styles.link}
                onClick={() => this.legalWaiverHandler(true)}>
                Please read our Legal Waiver
              </span>
              . You must accept waiver to complete signup.
            </p>
            <div className={styles.legalVaiwerStatusSwitch}>
              <ToggleSwitch
                desc={'Yes, I accept.'}
                value={legal_waiver}
                onChange={this.legalWaiverStatusHandler}
              />
            </div>
            {<p className={styles.errorMessage}>{legal_waiver_error_text}</p>}
            {/* Privacy waiver buttons */}
            <RadioButtons
              data={anon_radio_props}
              label="Public Profile"
              setMilitaryValue={this.anonymousProfileHandler}
              userProp={anonymous_profile}
              extraMarginBottom={true}
            />
          </div>
          <div className={styles.buttonContainer}>
            <RWBButton
              label={'Complete Registration'}
              onClick={this.nextPressed}
              buttonStyle={'primary'}
            />
            <RWBButton
              link={true}
              to={'/registration/military_info'}
              label={'Back'}
              buttonStyle={'secondary'}
            />
          </div>
        </div>
        {isLegalWaiver && <LegalModal modalHandler={this.legalWaiverHandler} />}
      </div>
    );
  }
}

export default withRouter(RegisterPrivacyWaiver);
