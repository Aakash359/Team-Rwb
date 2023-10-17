import React, {Component} from 'react';
import {MILITARY_PROPS} from '../../../../shared/constants/RadioProps';
import RWBButton from '../RWBButton';
import RadioForm from '../RadioForm';
import ToggleSwitch from '../ToggleSwitch';
import styles from './Registration.module.css';
import {userProfile} from '../../../../shared/models/UserProfile';
import {MILITARY_STATUSES} from '../../../../shared/constants/MilitaryStatusSlugs';
import moment from 'moment';
import RadioButtons from '../profile/RadioButtons';
import {
  ARMY_ENLISTED,
  ARMY_WARRANT,
  ARMY_OFFICER,
  MARINES_ENLISTED,
  MARINES_WARRANT,
  MARINES_OFFICER,
  NAVY_ENLISTED,
  NAVY_WARRANT,
  NAVY_OFFICER,
  AIRFORCE_ENLISTED,
  AIRFORCE_OFFICER,
  COASTGUARD_ENLISTED,
  COASTGUARD_WARRANT,
  COASTGUARD_OFFICER,
} from '../../../../shared/constants/military/ranks';
import {logMilitaryService} from '../../../../shared/models/Analytics';
import MenuButton from '../profile/MenuButton';
import {withRouter} from 'react-router-dom';

const {
  status_radio_props,
  branch_radio_props,
  disability_radio_props,
  zone_radio_props,
  deployment_radio_props,
} = MILITARY_PROPS;

const airForceRankData = {
  ...AIRFORCE_ENLISTED,
  ...AIRFORCE_OFFICER,
};
const armyRankData = {
  ...ARMY_ENLISTED,
  ...ARMY_WARRANT,
  ...ARMY_OFFICER,
};
const marinesRankData = {
  ...MARINES_ENLISTED,
  ...MARINES_WARRANT,
  ...MARINES_OFFICER,
};
const navyRankData = {
  ...NAVY_ENLISTED,
  ...NAVY_WARRANT,
  ...NAVY_OFFICER,
};
const coastGuardRankData = {
  ...COASTGUARD_ENLISTED,
  ...COASTGUARD_WARRANT,
  ...COASTGUARD_OFFICER,
};

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

class RegisterMilitaryService extends Component {
  constructor() {
    super();

    this.createDaysArray();
    this.createYearArray();
    const existing_profile = userProfile.getUserProfile();
    const {
      military_status,
      military_family_member,
      military_branch,
      military_ets,
      military_rank,
      has_disability,
      combat_zone,
      combat_deployment_operations,
      profile_completed,
    } = existing_profile;

    const default_state = {
      military_status: null,
      military_family_member: Boolean(military_family_member),
      military_branch,
      has_disability: false,
      etsd_month: '',
      etsd_day: '',
      etsd_year: '',
      military_rank,
      combat_zone: combat_zone,
      combat_deployment_operations: null,
      dayModalIsOpen: false,
      monthModalIsOpen: false,
      yearModalIsOpen: false,
      military_status_error: '',
      military_branch_error: '',
      disability_error: '',
      combat_zone_error: '',
      combat_deployment_operation_error: '',
      etsd_error: '',
      military_rank_error: '',
    };

    const assigned_state = Object.assign(
      default_state,
      military_status ? {military_status} : {},
      military_family_member ? {military_family_member} : {},
      military_branch ? {military_branch} : {},
      military_ets ? {military_ets} : {},
      military_rank ? {military_rank} : {},
      // until server sets has_disabilty as null by default, we want it to be null when the profile is not completed (registration flow)
      has_disability !== null && profile_completed ? {has_disability} : {},
      combat_zone ? {combat_zone: combat_zone} : {},
      combat_deployment_operations
        ? {combat_deployment_operations: combat_deployment_operations}
        : {},
    );

    this.state = assigned_state;
    this.nextPressed = this.nextPressed.bind(this);
  }

  getRanks = () => {
    switch (this.state.military_branch) {
      case 'Army':
        return armyRankData;
      case 'Air Force':
        return airForceRankData;
      case 'Marine Corps':
        return marinesRankData;
      case 'Navy':
        return navyRankData;
      case 'Coast Guard':
        return coastGuardRankData;
      default:
        return [];
    }
  };

  clearErrorWarnings = () => {
    this.setState({
      military_rank_error: '',
      military_branch_error: '',
      etsd_error: '',
      combat_zone_error: '',
      combat_deployment_operation_error: '',
      disability_error: '',
      military_status_error: '',
    });
  };

  nextPressed() {
    let analyticsObj = {};
    if (this.props.location.state && this.props.location.state.from)
      analyticsObj.previous_view = this.props.location.state.from;
    logMilitaryService(analyticsObj);
    this.clearErrorWarnings();
    const {
      military_status,
      military_family_member,
      military_branch,
      military_rank,
      combat_zone,
      combat_deployment_operations,
      has_disability,
      etsd_month,
      etsd_day,
      etsd_year,
    } = this.state;

    const field_is_required_string = 'THIS FIELD IS REQUIRED';
    const invalid_date = 'INVALID DATE';

    let hasError = false;
    let etsdDate = '';

    if (military_status === null) {
      this.setState({military_status_error: field_is_required_string});
      hasError = true;
    }

    if (military_status !== MILITARY_STATUSES.civilian) {
      if (military_branch === null) {
        this.setState({military_branch_error: field_is_required_string});
        hasError = true;
      }
      if (military_rank === null || military_rank === '') {
        this.setState({military_rank_error: field_is_required_string});
        hasError = true;
      }
      if (combat_zone === null) {
        this.setState({
          combat_zone_error: field_is_required_string,
        });
        hasError = true;
      }
      if (combat_zone && !combat_deployment_operations) {
        this.setState({
          combat_deployment_operation_error: field_is_required_string,
        });
        hasError = true;
      }
      if (has_disability === null) {
        this.setState({disability_error: field_is_required_string});
        hasError = true;
      }
      if (military_status === MILITARY_STATUSES.veteran) {
        if (etsd_month || etsd_day || etsd_year) {
          etsdDate = moment(
            `${etsd_month} ${etsd_day} ${etsd_year}`,
            'MMMM DD YYYY',
          );
          if (!etsdDate.isValid()) {
            this.setState({etsd_error: invalid_date});
            hasError = true;
          }
        } else {
          this.setState({etsd_error: invalid_date});
          hasError = true;
        }
      }
    }

    if (hasError) return;

    const {location} = this.props;
    let value = location.state?.value || {};

    value = Object.assign(
      value,
      {military_status},
      military_status === MILITARY_STATUSES.civilian
        ? {
            military_family_member,
          }
        : {
            military_branch,
            military_rank,
            has_disability,
            combat_zone,
            combat_deployment_operations,
          },
      military_status === MILITARY_STATUSES.veteran
        ? {
            military_ets: etsdDate.toISOString().slice(0, 10),
          }
        : {},
    );
    const profile = Object.assign({}, userProfile.getUserProfile(), value);
    userProfile.saveToUserProfile(profile);
    let incomplete = false;
    if (location.state && location.state.incomplete) incomplete = true;

    this.props.history.push({
      pathname: '/registration/privacy_info',
      state: {value: profile, incomplete, from : 'Military Service'},
    });
  }

  createDaysArray = () => {
    let daysArray = [];
    for (let i = 1; i < 32; i++) {
      daysArray.push(i.toString());
    }
    this.days = daysArray;
  };

  createYearArray = () => {
    let currentYear = new Date().getFullYear();
    let endYear = currentYear - 81;
    let years = [];
    for (let i = currentYear; i > endYear; i--) {
      years.push(i.toString());
    }
    this.years = years;
  };

  disabilityHandler = (value) => this.setState({has_disability: value});

  combatZoneHandler = (value) => this.setState({combat_zone: value});

  combatDeploymentHandler = (value) =>
    this.setState({combat_deployment_operations: value});

  militaryFamilyMemberHandler = () =>
    this.setState({military_family_member: !this.state.military_family_member});

  etsMonthHandler = (value) => this.setState({etsd_month: value});
  etsDayHandler = (value) => this.setState({etsd_day: value});
  etsYearHandler = (value) => this.setState({etsd_year: value});

  militaryRankHandler = (value) => this.setState({military_rank: value});

  militaryBranchHandler = (value) => {
    this.setState({military_branch: value, military_rank: null});
  };

  render() {
    const {
      military_branch_error,
      military_status_error,
      disability_error,
      combat_zone_error,
      combat_deployment_operation_error,
      etsd_error,
      military_rank_error,
      military_branch,
      military_status,
      has_disability,
      combat_zone,
      combat_deployment_operations,
      etsd_month,
      etsd_day,
      etsd_year,
      yearModalIsOpen,
      dayModalIsOpen,
      monthModalIsOpen,
      military_rank,
    } = this.state;

    return (
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h3 className="title">Military Service</h3>
          <p className="titleSubheader">Step 5 of 6</p>
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.formContainer}>
            <RadioForm
              inline
              radioProps={status_radio_props}
              label={'Status'}
              name={'status'}
              error={military_status_error}
              value={military_status}
              onValueChange={(value) =>
                this.setState({
                  military_status: value,
                })
              }
            />
            {military_status &&
              military_status !== MILITARY_STATUSES.civilian && (
                <RadioForm
                  inline
                  radioProps={branch_radio_props}
                  label={'Military Branch'}
                  name={'branch'}
                  error={military_branch_error}
                  value={military_branch}
                  onValueChange={(value) => this.militaryBranchHandler(value)}
                />
              )}
            {military_status === MILITARY_STATUSES.veteran && (
              <>
                <p className="formLabel">Expiration Term of Service Date</p>
                <div className={styles.ETSContainer}>
                  <div className={styles.ETSdropdownWrapper}>
                    <MenuButton
                      placeholder="Month"
                      data={months}
                      userProp={etsd_month}
                      setMilitaryValue={this.etsMonthHandler}
                    />
                  </div>
                  <div className={styles.ETSdropdownWrapper}>
                    <MenuButton
                      placeholder="Day"
                      data={this.days}
                      userProp={etsd_day}
                      setMilitaryValue={this.etsDayHandler}
                    />
                  </div>
                  <div className={styles.ETSdropdownWrapper}>
                    <MenuButton
                      placeholder="Year"
                      data={this.years}
                      userProp={etsd_year}
                      setMilitaryValue={this.etsYearHandler}
                    />
                  </div>
                </div>
                <p className={styles.errorMessage}>{etsd_error}</p>
              </>
            )}
            {military_branch && military_status !== MILITARY_STATUSES.civilian && (
              <div className={styles.rankDropdownWrapper}>
                <MenuButton
                  fullWidth={true}
                  label="Rank"
                  data={this.getRanks()}
                  userProp={military_rank}
                  setMilitaryValue={this.militaryRankHandler}
                />
                <p className={styles.errorMessage}>{military_rank_error}</p>
              </div>
            )}
            {military_status && military_status !== MILITARY_STATUSES.civilian && (
              <div className={styles.radioButtonsContainer}>
                <RadioButtons
                  data={disability_radio_props}
                  label="Disability"
                  setMilitaryValue={this.disabilityHandler}
                  userProp={has_disability}
                />
                <p className={styles.errorMessage}>{disability_error}</p>
                <RadioButtons
                  data={zone_radio_props}
                  label="Combat Zone Deployment"
                  setMilitaryValue={this.combatZoneHandler}
                  userProp={combat_zone}
                />
                <p className={styles.errorMessage}>{combat_zone_error}</p>
                {combat_zone && (
                  <div>
                    <RadioButtons
                      data={deployment_radio_props}
                      label="Combat Deployment Operation"
                      setMilitaryValue={this.combatDeploymentHandler}
                      userProp={combat_deployment_operations}
                    />
                    <p className={styles.errorMessage}>
                      {combat_deployment_operation_error}
                    </p>
                  </div>
                )}
              </div>
            )}
            {military_status === MILITARY_STATUSES.civilian && (
              <>
                <p className="bodyCopy">
                  Are you a Military Family Member? (Military family members are
                  related by blood, marriage, or adoption to an actively serving
                  member or veteran of the U.S. armed forces, including one who
                  is deceased.)
                </p>
                <ToggleSwitch
                  desc={"Yes, I'm a Military Family Member"}
                  value={this.state.military_family_member}
                  onChange={this.militaryFamilyMemberHandler}
                />
              </>
            )}
          </div>
          <div className={styles.buttonContainer}>
            <RWBButton
              onClick={this.nextPressed}
              label={'Next'}
              buttonStyle={'primary'}
            />
            <RWBButton
              link={true}
              to={'/registration/social_info'}
              label={'Back'}
              buttonStyle={'secondary'}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(RegisterMilitaryService);
