import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  BackHandler,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {getRadioIndexForValue} from '../../shared/utils/Helpers';
import RWBButton from '../design_components/RWBButton';
import LinedRadioForm from '../design_components/LinedRadioForm';
import {rwbApi} from '../../shared/apis/api';
import {MILITARY_STATUSES} from '../../shared/constants/MilitaryStatusSlugs';
import {MILITARY_PROPS} from '../../shared/constants/RadioProps';
import {userProfile} from '../../shared/models/UserProfile';
import {
  militaryMonthPicker as MilitaryMonth,
  militaryDayPicker as MilitaryDay,
  militaryYearPicker as MilitaryYear,
} from '../design_components/MilitaryDatePicker';
import MOSPicker from '../design_components/MOSPicker';
import RankPicker from '../design_components/RankPicker';

//SVGs
import ChevronBack from '../../svgs/ChevronBack';
import ChevronDownIcon from '../../svgs/ChevronDownIcon';

import moment from 'moment';

import globalStyles, {RWBColors} from '../styles';
import NavigationService from '../models/NavigationService';
import {logUpdateMilitaryService} from '../../shared/models/Analytics';

const {
  status_radio_props,
  branch_radio_props,
  zone_radio_props,
  deployment_radio_props,
  disability_radio_props,
} = MILITARY_PROPS;

export default class ProfileMilitaryService extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerStyle: {
        backgroundColor: RWBColors.magenta,
      },
      headerTintColor: RWBColors.white,
      headerLeft: () => (
        <TouchableOpacity
          style={globalStyles.headerSave}
          onPress={() => {
            const backPressed = navigation.getParam('backPressed', null);
            if (backPressed === null) {
              navigation.goBack();
              return;
            }
            backPressed();
          }}
          accessibilityRole={'button'}
          accessible={true}
          accessibilityLabel={'Go Back'}>
          <ChevronBack style={globalStyles.chevronBackImage} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={globalStyles.headerSave}
          onPress={navigation.getParam('savePressed')}>
          <Text style={globalStyles.headerSaveText}>Save</Text>
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <Text style={[globalStyles.title, {top: 3}]}>Military Service</Text>
      ),
    };
  };
  constructor(props) {
    super(props);

    const {navigation} = this.props;
    const value = navigation.getParam('value', null);
    if (value === null)
      throw new Error('ProfileMilitaryService must be given navigation value.');
    const {
      military_status,
      military_family_member,
      military_branch,
      military_specialty,
      military_rank,
      military_ets,
      has_disability,
      combat_zone,
      combat_deployment_operations,
    } = value;

    const etsDate = moment(military_ets);
    const ets_date_valid = etsDate.isValid();

    this.state = {
      military_status,
      military_family_member,
      military_branch,
      etsd_month: ets_date_valid ? etsDate.format('MMMM') : '',
      etsd_day: ets_date_valid ? etsDate.format('DD') : '',
      etsd_year: ets_date_valid ? etsDate.format('YYYY') : '',
      military_specialty,
      military_rank,
      has_disability: has_disability ? true : false,
      combat_zone,
      combat_deployment_operations,

      military_status_error: '',
      military_branch_error: '',
      etsd_error: '',
      military_specialty_error: '',
      military_rank_error: '',
      has_disability_error: '',
      combat_deployment_operations_error: '',

      specialtyVisible: false,
      rankVisible: false,
      monthVisible: false,
      dayVisible: false,
      yearVisible: false,

      isLoading: false,
      needsToSave: false,
    };

    this.backPressed = this.backPressed.bind(this);
    this.savePressed = this.savePressed.bind(this);
    this.handleBackPress = this.handleBackPress.bind(this);
    this.onMonthSelect = this.onMonthSelect.bind(this);
    this.onDaySelect = this.onDaySelect.bind(this);
    this.onYearSelect = this.onYearSelect.bind(this);
  }

  componentDidMount() {
    const {navigation} = this.props;
    const {backPressed, savePressed} = this;
    navigation.setParams({
      backPressed,
      savePressed,
    });
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  handleBackPress() {
    this.backPressed();
    return true;
  }

  backPressed() {
    const {needsToSave} = this.state;
    if (needsToSave) {
      NavigationService.navigate('SaveModal', {
        save: this.savePressed,
      });
    } else {
      NavigationService.back();
    }
  }

  clearErrorWarnings = () => {
    this.setState({
      military_status_error: '',
      military_branch_error: '',
      etsd_error: '',
      military_specialty_error: '',
      military_rank_error: '',
      has_disability_error: '',
      combat_deployment_operations_error: '',
    });
  };

  validateProfile = () => {
    const {
      military_status,
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
    const REQUIRED_FIELD = 'THIS FIELD IS REQUIRED';
    const INVALID_DATE = 'INVALID DATE';

    let hasError = false;
    let etsdDate = '';
    if (military_status === null) {
      this.setState({military_status_error: REQUIRED_FIELD});
      hasError = true;
    }

    if (military_status !== MILITARY_STATUSES.civilian) {
      // server returns n\a and empty strings, so being extra safe
      if (
        military_branch === null ||
        military_branch === '' ||
        military_branch === 'n/a'
      ) {
        this.setState({military_branch_error: REQUIRED_FIELD});
        hasError = true;
      }
      // if (military_specialty === null || military_specialty === '') {
      //   this.setState({ military_specialty_error: REQUIRED_FIELD });
      //   hasError = true;
      // }
      if (military_rank === null || military_rank === '') {
        this.setState({military_rank_error: REQUIRED_FIELD});
        hasError = true;
      }
      if (
        combat_zone === true &&
        (combat_deployment_operations === null ||
          combat_deployment_operations === '' ||
          combat_deployment_operations === 'n/a')
      ) {
        this.setState({combat_deployment_operations_error: REQUIRED_FIELD});
        hasError = true;
      }
      if (has_disability === null) {
        this.setState({has_disability_error: REQUIRED_FIELD});
        hasError = true;
      }
      if (military_status === MILITARY_STATUSES.veteran) {
        if (etsd_month || etsd_day || etsd_year) {
          etsdDate = moment(
            `${etsd_month} ${etsd_day} ${etsd_year}`,
            'MMMM DD YYYY',
          );
          if (!etsdDate.isValid()) {
            this.setState({etsd_error: INVALID_DATE});
            hasError = true;
          }
        } else {
          this.setState({etsd_error: INVALID_DATE});
          hasError = true;
        }
      }
    }

    return !hasError;
  };

  savePressed = () => {
    this.clearErrorWarnings();
    if (this.validateProfile()) {
      this.makePayload();
    }
  };

  makePayload() {
    const {
      military_status,
      military_family_member,
      military_branch,
      combat_zone,
      combat_deployment_operations,
      has_disability,
      etsd_month,
      etsd_day,
      etsd_year,
      military_specialty,
      military_rank,
    } = this.state;
    const etsdDate = moment(
      `${etsd_month} ${etsd_day} ${etsd_year}`,
      'MMMM DD YYYY',
    );

    const payload = Object.assign(
      {military_status},
      military_status === MILITARY_STATUSES.civilian
        ? {
            military_family_member,
          }
        : {
            military_branch,
            has_disability,
            combat_zone,
            military_specialty,
            military_rank,
          },
      military_status === MILITARY_STATUSES.veteran
        ? {
            military_ets: etsdDate.toISOString().slice(0, 10),
          }
        : {},
      combat_zone
        ? {
            combat_deployment_operations,
          }
        : {},
    );
    this.updateUser(payload);
  }

  updateUser(payload) {
    this.setState({isLoading: true});

    let data = JSON.stringify(payload);

    return rwbApi
      .putUser(data)
      .then((response) => {
        logUpdateMilitaryService();
        this.setState({
          isLoading: false,
        });
        this.props.navigation.state.params.getUpdatedProfile();
        NavigationService.back();
      })
      .catch((error) => {
        console.error(error);
        this.setState({
          isLoading: false,
        });
        Alert.alert(
          'Error',
          'There was a problem contacting the server. Please try again later.',
        );
      });
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
    else this.setState({monthVisible: false});
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
      isLoading,

      military_status,
      military_family_member,
      military_branch,
      military_specialty,
      military_rank,
      has_disability,
      combat_zone,
      combat_deployment_operations,
      etsd_month,
      etsd_day,
      etsd_year,

      military_status_error,
      military_branch_error,
      military_specialty_error,
      military_rank_error,
      has_disability_error,
      combat_deployment_operations_error,
      etsd_error,
    } = this.state;

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: RWBColors.white}}>
        {isLoading && (
          <View style={globalStyles.spinnerOverLay}>
            <ActivityIndicator size="large" />
          </View>
        )}
        <ScrollView
          style={styles.scrollViewContainer}
          contentContainerStyle={styles.scrollViewContainerContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.formWrapper}>
            <View style={globalStyles.formBlock}>
              <Text style={[globalStyles.radioFormLabel, {marginTop: 25}]}>
                STATUS
              </Text>
              <LinedRadioForm
                ref={(input) => {
                  this.militaryStatusForm = input;
                }}
                radio_props={status_radio_props}
                arrayLength={status_radio_props.length}
                initial={getRadioIndexForValue(
                  status_radio_props,
                  military_status,
                  -1,
                )}
                value={military_status}
                error={military_status_error}
                onPress={(value) => {
                  this.setState({
                    military_status: value,
                    military_status_error: '',
                    needsToSave: true,
                  });
                }}
              />
              <Text style={globalStyles.errorMessage}>
                {military_status_error}
              </Text>
            </View>

            {military_status !== null && military_status === 'Civilian' ? (
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
                      this.setState({
                        military_family_member: value,
                        needsToSave: true,
                      });
                    }}
                  />
                  <Text style={[globalStyles.bodyCopyForm, styles.switchLabel]}>
                    Yes, I'm a Military Family Member!
                  </Text>
                </View>
              </View>
            ) : null}
            {military_status !== null && military_status !== 'Civilian' ? (
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
                        military_specialty: '',
                        military_rank: '',
                        needsToSave: true,
                      });
                    }}
                  />

                  <Text style={globalStyles.errorMessage}>
                    {military_branch_error}
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
                {/* DISABILITY */}
                <View style={[globalStyles.formBlock, {marginBottom: 40}]}>
                  <Text style={globalStyles.formLabel}>DISABILITY</Text>
                  <Text style={[globalStyles.bodyCopyForm, {paddingTop: 5}]}>
                    I am a veteran with a service-connected disability.
                  </Text>
                  <LinedRadioForm
                    radio_props={disability_radio_props}
                    arrayLength={disability_radio_props.length}
                    error={has_disability_error}
                    initial={has_disability ? 0 : 1}
                    onPress={(value) => {
                      this.setState({
                        has_disability: value,
                      });
                    }}
                  />
                </View>

                <Text style={globalStyles.radioFormLabel}>
                  COMBAT ZONE DEPLOYMENT
                </Text>
                <LinedRadioForm
                  ref={(input) => {
                    this.combatZoneForm = input;
                  }}
                  radio_props={zone_radio_props}
                  arrayLength={zone_radio_props.length}
                  initial={getRadioIndexForValue(
                    zone_radio_props,
                    combat_zone,
                    -1,
                  )}
                  onPress={(value) => {
                    this.setState({
                      combat_zone: value,
                      needsToSave: true,
                    });
                  }}
                />

                {combat_zone ? (
                  <View style={[globalStyles.formBlock, {marginTop: 40}]}>
                    <Text style={globalStyles.radioFormLabel}>
                      COMBAT DEPLOYMENT OPERATION
                    </Text>
                    <LinedRadioForm
                      ref={(input) => {
                        this.combatDeploymentForm = input;
                      }}
                      radio_props={deployment_radio_props}
                      arrayLength={deployment_radio_props.length}
                      initial={getRadioIndexForValue(
                        deployment_radio_props,
                        combat_deployment_operations,
                        -1,
                      )}
                      error={combat_deployment_operations_error}
                      onPress={(value) => {
                        this.setState({
                          combat_deployment_operations: value,
                          combat_deployment_operations_error: '',
                          needsToSave: true,
                        });
                      }}
                    />
                    <Text style={globalStyles.errorMessage}>
                      {combat_deployment_operations_error}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
          <View style={globalStyles.centerButtonWrapper}>
            <RWBButton
              buttonStyle="primary"
              text="Save"
              onPress={this.savePressed}
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
    flex: 1,
    width: '100%',
    height: 'auto',
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
  // dropDownWrapper: {
  //   flex: .9,
  // },
});
