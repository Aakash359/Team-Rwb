import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  SafeAreaView,
  StatusBar,
  Modal,
  TouchableOpacity,
} from 'react-native';
import RWBButton from '../design_components/RWBButton';
import RegisterHeader from './RegisterHeader';
import LinedRadioForm from '../design_components/LinedRadioForm';
import {MILITARY_STATUSES} from '../../shared/constants/MilitaryStatusSlugs';
import {MILITARY_PROPS} from '../../shared/constants/RadioProps';
import {getRadioIndexForValue} from '../../shared/utils/Helpers';
import {userProfile} from '../../shared/models/UserProfile';
import {
  logMilitaryService,
  logUpdateMilitaryService,
} from '../../shared/models/Analytics';
import {
  militaryMonthPicker as MilitaryMonth,
  militaryDayPicker as MilitaryDay,
  militaryYearPicker as MilitaryYear,
} from '../design_components/MilitaryDatePicker';
import MOSPicker from '../design_components/MOSPicker';
import RankPicker from '../design_components/RankPicker';

import ChevronDownIcon from '../../svgs/ChevronDownIcon';

import moment from 'moment';

import globalStyles, {RWBColors} from '../styles';
import NavigationService from '../models/NavigationService';

const {
  status_radio_props,
  branch_radio_props,
  disability_radio_props,
  zone_radio_props,
  deployment_radio_props,
} = MILITARY_PROPS;

export default class RegisterMilitaryServiceView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: () => (
        <RegisterHeader headerText="Military Service" stepText="STEP 5 of 6" />
      ),
      headerLeft: () => null,
      headerStyle: {
        backgroundColor: RWBColors.magenta,
      },
      headerTintColor: RWBColors.white,
    };
  };

  constructor() {
    super();

    const existing_profile = userProfile.getUserProfile();
    const {
      military_status,
      military_family_member,
      military_branch,
      military_ets,
      military_specialty,
      military_rank,
      has_disability,
      combat_zone,
      combat_deployment_operations,
      profile_completed,
    } = existing_profile;

    const default_state = {
      military_status: null,
      military_family_member: false,
      military_branch: null,
      has_disability: null, // what should be the default value
      etsd_month: '',
      etsd_day: '',
      etsd_year: '',
      military_specialty: '',
      military_rank: '',
      combat_zone: null,
      combat_deployment_operations: null,

      military_status_error: '',
      military_branch_error: '',
      disability_error: '',
      combat_deployment_operation_error: '',
      etsd_error: '',
      military_specialty_error: '',
      military_rank_error: '',

      specialtyVisible: false,
      rankVisible: false,
      monthVisible: false,
      dayVisible: false,
      yearVisible: false,
    };

    let etsd_month;
    let etsd_day;
    let etsd_year;
    // extract ets month, day, year if that info is there
    if (military_ets) {
      const momentDate = moment(military_ets);
      etsd_month = momentDate.format('MM');
      etsd_day = momentDate.format('DD');
      etsd_year = momentDate.format('YYYY');
    }

    const assigned_state = Object.assign(
      default_state,
      military_status ? {military_status} : {},
      military_family_member ? {military_family_member} : {},
      military_branch ? {military_branch} : {},
      etsd_month ? {etsd_month} : {},
      etsd_day ? {etsd_day} : {},
      etsd_year ? {etsd_year} : {},
      military_specialty ? {military_specialty} : {},
      military_rank ? {military_rank} : {},
      // until server sets has_disabilty as null by default, we want it to be null when the profile is not completed (registration flow)
      has_disability !== null && profile_completed ? {has_disability} : {},
      combat_zone ? {combat_zone: combat_zone} : {},
      combat_deployment_operations
        ? {combat_deployment_operations: combat_deployment_operations}
        : {},
    );

    this.state = assigned_state;
    this.onMonthSelect = this.onMonthSelect.bind(this);
    this.onDaySelect = this.onDaySelect.bind(this);
    this.onYearSelect = this.onYearSelect.bind(this);
    this.nextPressed = this.nextPressed.bind(this);
  }

  nextPressed() {
    const {
      military_status,
      military_family_member,
      military_branch,
      military_specialty,
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
      // if (military_specialty === null || military_specialty === '') {
      //   this.setState({ military_specialty_error: field_is_required_string });
      //   hasError = true;
      // }
      if (military_rank === null || military_rank === '') {
        this.setState({military_rank_error: field_is_required_string});
        hasError = true;
      }
      if (combat_zone === true && combat_deployment_operations === null) {
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

    let {navigation} = this.props;
    let value = navigation.getParam('value', {});
    value = Object.assign(
      value,
      {military_status},
      military_status === MILITARY_STATUSES.civilian
        ? {
            military_family_member,
          }
        : {
            military_branch,
            // military_specialty,
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
    if (
      this.props.navigation.state.params &&
      this.props.navigation.state.params.incomplete
    )
      incomplete = true;
    if (profile.legal_waiver_signed) logUpdateMilitaryService();
    // log it as updating when going through the registration flow again for updates
    else {
      let analyticsObj = {};
          if (
            this.props.navigation.state.params &&
            this.props.navigation.state.params.from
          )
            analyticsObj.previous_view = this.props.navigation.state.params.from;
      logMilitaryService(analyticsObj);
    }
    NavigationService.navigate('PrivacyWaiver', {value: profile, incomplete, from: 'Military Service'});
  }

  onSpecialtySelect = (specialty) => {
    if (specialty) {
      this.setState({military_specialty: specialty});
    }
    this.setState({specialtyVisible: false, military_specialty_error: false});
  };

  onRankSelect = (rank) => {
    if (rank) {
      this.setState({military_rank: rank});
    }
    this.setState({rankVisible: false, military_rank_error: false});
  };

  onMonthSelect(month) {
    if (month) this.setState({etsd_month: month, monthVisible: false});
    else this.setState({monthVisible: false, military_specialty_error: false});
  }

  onDaySelect(day) {
    if (day) this.setState({etsd_day: day, dayVisible: false});
    else this.setState({dayVisible: false});
  }

  onYearSelect(year) {
    if (year) this.setState({etsd_year: year, yearVisible: false});
    else this.setState({yearVisible: false});
  }

  render() {
    const {
      military_branch_error,
      military_status_error,
      disability_error,
      combat_deployment_operation_error,
      etsd_error,
      military_specialty_error,
      military_rank_error,
    } = this.state;

    const {
      military_branch,
      military_status,
      military_family_member,
      has_disability,
      combat_zone,
      combat_deployment_operations,
      etsd_month,
      etsd_day,
      etsd_year,
      military_specialty,
      military_rank,
    } = this.state;
    return (
      <SafeAreaView style={globalStyles.registrationScreenContainer}>
        <StatusBar
          barStyle="light-content"
          animated={true}
          translucent={false}
          backgroundColor={RWBColors.magenta}
        />
        <ScrollView
          style={styles.scrollViewContainer}
          contentContainerStyle={styles.scrollViewContainerContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.formWrapper}>
            <View style={globalStyles.formBlock}>
              <Text style={globalStyles.radioFormLabel}>STATUS</Text>
              <LinedRadioForm
                radio_props={status_radio_props}
                arrayLength={status_radio_props.length}
                initial={getRadioIndexForValue(
                  status_radio_props,
                  military_status,
                  -1,
                )}
                error={military_status_error}
                onPress={(value) => {
                  this.setState({
                    military_status: value,
                  });
                }}
              />
              <Text style={globalStyles.errorMessage}>
                {military_status_error}
              </Text>
            </View>
            {military_status === 'Civilian' ? (
              <View style={globalStyles.formBlock}>
                <Text style={globalStyles.bodyCopy}>
                  Are you a Military Family Member? (Military family members are
                  related by blood, marriage, or adoption to an actively serving
                  member or veteran of the U.S. armed forces, including one who
                  is deceased.)
                </Text>
                <View style={styles.switchView}>
                  <Switch
                    value={military_family_member}
                    onValueChange={(value) => {
                      this.setState({military_family_member: value});
                    }}
                  />
                  <Text style={[globalStyles.bodyCopyForm, styles.switchLabel]}>
                    Yes, I'm a Military Family Member!
                  </Text>
                </View>
              </View>
            ) : null}

            {military_status && military_status !== 'Civilian' ? (
              <View style={{marginBottom: 40}}>
                <View style={globalStyles.formBlock}>
                  <Text style={globalStyles.radioFormLabel}>
                    MILITARY BRANCH
                  </Text>
                  <LinedRadioForm
                    radio_props={branch_radio_props}
                    arrayLength={branch_radio_props.length}
                    initial={getRadioIndexForValue(
                      branch_radio_props,
                      military_branch,
                      -1,
                    )}
                    error={military_branch_error}
                    onPress={(value) => {
                      this.setState({
                        military_branch: value,
                        military_branch_error: '',
                      });
                    }}
                  />

                  <Text style={globalStyles.errorMessage}>
                    {this.state.military_branch_error}
                  </Text>
                </View>
                {/* ETS */}
                {military_status === 'Veteran' ? (
                  <View style={globalStyles.formBlock}>
                    <Text style={[globalStyles.formLabel, {textAlign: 'left'}]}>
                      EXPIRATION TERM OF SERVICE
                    </Text>
                    <View style={styles.dropdownWrapper}>
                      {etsd_error ? (
                        <View style={globalStyles.errorBar} />
                      ) : null}
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <TouchableOpacity
                          style={[styles.dropdownButton, {width: '35%'}]}
                          onPress={() =>
                            this.setState({
                              etsd_error: false,
                              monthVisible: true,
                            })
                          }>
                          <View style={styles.dropdownText}>
                            <Text style={globalStyles.bodyCopyForm}>
                              {etsd_month ? etsd_month : 'Month'}
                            </Text>
                            <ChevronDownIcon
                              style={styles.iconView}
                              tintColor={RWBColors.magenta}
                            />
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.dropdownButton, {width: '25%'}]}
                          onPress={() =>
                            this.setState({etsd_error: false, dayVisible: true})
                          }>
                          <View style={styles.dropdownText}>
                            <Text style={globalStyles.bodyCopyForm}>
                              {etsd_day ? etsd_day : 'Day'}
                            </Text>
                            <ChevronDownIcon
                              style={styles.iconView}
                              tintColor={RWBColors.magenta}
                            />
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.dropdownButton, {width: '30%'}]}
                          onPress={() =>
                            this.setState({
                              etsd_error: false,
                              yearVisible: true,
                            })
                          }>
                          <View style={styles.dropdownText}>
                            <Text style={globalStyles.bodyCopyForm}>
                              {etsd_year ? etsd_year : 'Year'}
                            </Text>
                            <ChevronDownIcon
                              style={styles.iconView}
                              tintColor={RWBColors.magenta}
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ) : null}
                {/* MOS */}
                {/* {military_branch && military_branch !== 'n/a'
                  ? <View style={globalStyles.formBlock}>
                    <Text style={[globalStyles.formLabel, { textAlign: 'left' }]} >MILITARY OCCUPATIONAL SPECIALTY</Text>
                    <View style={styles.dropdownWrapper}>
                      {military_specialty_error ? <View style={globalStyles.errorBar} /> : null}
                      <View style={{ flex: 1 }}>
                        <TouchableOpacity style={styles.dropdownButton} onPress={() => this.setState({ specialtyVisible: true })}>
                          <View style={styles.dropdownText}>
                            <Text style={globalStyles.bodyCopyForm}>
                              {military_specialty ? military_specialty : 'Select MOS'}
                            </Text>
                            <ChevronDownIcon style={styles.iconView} tintColor={RWBColors.magenta} />
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  : null} */}
                {/* RANK */}
                {military_branch && military_branch !== 'n/a' ? (
                  <View style={globalStyles.formBlock}>
                    <Text style={[globalStyles.formLabel, {textAlign: 'left'}]}>
                      RANK
                    </Text>
                    <View style={styles.dropdownWrapper}>
                      {military_rank_error ? (
                        <View style={globalStyles.errorBar} />
                      ) : null}
                      <View style={{flex: 1}}>
                        <TouchableOpacity
                          style={styles.dropdownButton}
                          onPress={() => this.setState({rankVisible: true})}>
                          <View style={styles.dropdownText}>
                            <Text style={globalStyles.bodyCopyForm}>
                              {military_rank ? military_rank : 'Select Rank'}
                            </Text>
                            <ChevronDownIcon
                              style={styles.iconView}
                              tintColor={RWBColors.magenta}
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ) : null}
                <View style={globalStyles.formBlock}>
                  <Text style={globalStyles.formLabel}>DISABILITY</Text>
                  <Text style={[globalStyles.bodyCopyForm, {paddingTop: 5}]}>
                    I am a veteran with a service-connected disability.
                  </Text>
                  <LinedRadioForm
                    radio_props={disability_radio_props}
                    arrayLength={disability_radio_props.length}
                    error={disability_error}
                    initial={
                      has_disability === null ? -1 : has_disability ? 0 : 1
                    }
                    onPress={(value) => {
                      this.setState({
                        has_disability: value,
                        disability_error: '',
                      });
                    }}
                  />
                  <Text style={globalStyles.errorMessage}>
                    {disability_error}
                  </Text>
                </View>
                <Text style={globalStyles.radioFormLabel}>
                  COMBAT ZONE DEPLOYMENT
                </Text>
                <LinedRadioForm
                  radio_props={zone_radio_props}
                  arrayLength={zone_radio_props.length}
                  initial={getRadioIndexForValue(
                    zone_radio_props,
                    combat_zone,
                    1,
                  )}
                  onPress={(value) => {
                    this.setState({
                      combat_zone: value,
                    });
                  }}
                />
              </View>
            ) : null}
            {military_status &&
            military_status !== MILITARY_STATUSES.civilian &&
            combat_zone === true ? (
              <View style={globalStyles.formBlock}>
                <Text style={globalStyles.radioFormLabel}>
                  COMBAT DEPLOYMENT OPERATION
                </Text>
                <LinedRadioForm
                  radio_props={deployment_radio_props}
                  arrayLength={deployment_radio_props.length}
                  initial={getRadioIndexForValue(
                    deployment_radio_props,
                    combat_deployment_operations,
                    -1,
                  )}
                  error={combat_deployment_operation_error}
                  onPress={(value) => {
                    this.setState({
                      combat_deployment_operations: value,
                      combat_deployment_operation_error: '',
                    });
                  }}
                />
                <Text style={globalStyles.errorMessage}>
                  {combat_deployment_operation_error}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={globalStyles.centerButtonWrapper}>
            <RWBButton
              buttonStyle="primary"
              text="NEXT"
              onPress={this.nextPressed}
            />
            <RWBButton
              buttonStyle="secondary"
              text="Back"
              onPress={() => {
                this.props.navigation.goBack();
              }}
            />
          </View>
          <Modal
            onRequestClose={() => this.setState({specialtyVisible: false})}
            visible={this.state.specialtyVisible}>
            <MOSPicker selectMOS={this.onSpecialtySelect} />
          </Modal>
          <Modal
            onRequestClose={() => this.setState({rankVisible: false})}
            visible={this.state.rankVisible}>
            <RankPicker
              selectRank={this.onRankSelect}
              branch={military_branch}
            />
          </Modal>
          <Modal
            onRequestClose={() => this.setState({monthVisible: false})}
            visible={this.state.monthVisible}>
            <MilitaryMonth selectMonth={this.onMonthSelect} />
          </Modal>
          <Modal
            onRequestClose={() => this.setState({dayVisible: false})}
            visible={this.state.dayVisible}>
            <MilitaryDay selectDay={this.onDaySelect} />
          </Modal>
          <Modal
            onRequestClose={() => this.setState({yearVisible: false})}
            visible={this.state.yearVisible}>
            <MilitaryYear selectYear={this.onYearSelect} />
          </Modal>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    width: '100%',
    paddingHorizontal: '5%',
  },
  scrollViewContainerContent: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  formWrapper: {
    height: 'auto',
    marginTop: 15,
  },
  logoView: {
    width: '100%',
    padding: 50,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  back: {
    textAlign: 'center',
    margin: 25,
  },
  footerText: {
    fontSize: 10,
    textAlign: 'center',
    width: '65%',
  },
  switchView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    width: '90%',
  },
  switchLabel: {
    marginLeft: 15,
  },
  dropdownWrapper: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dropdownButton: {
    height: 32,
    width: '100%',
    borderBottomWidth: 1,
    borderColor: RWBColors.grey8,
    paddingTop: 5,
    paddingBottom: 5,
    flexDirection: 'row',
  },
  dropdownText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconView: {
    width: 16,
    height: 16,
  },
});
