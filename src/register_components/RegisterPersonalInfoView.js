import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Text,
  View,
  Keyboard,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  BackHandler,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  isNullOrEmpty,
  getRadioIndexForValue,
  isPhoneNumber,
} from '../../shared/utils/Helpers';
import RWBButton from '../design_components/RWBButton';
import RWBTextField from '../design_components/RWBTextField';
import RegisterHeader from './RegisterHeader';
import LinedRadioForm from '../design_components/LinedRadioForm';
import {userProfile} from '../../shared/models/UserProfile';
import {NavigationEvents} from 'react-navigation';
import {PERSONAL_INFO_PROPS} from '../../shared/constants/RadioProps';
import {COUNTRY_OPTIONS} from '../../shared/constants/Countries';
import {
  logPersonalInfo,
  logUpdatePersonalInformation,
} from '../../shared/models/Analytics';
import AutoCompleteMelissa from '../autocomplete_components/AutoCompleteMelissa';
import {melissaVerify, error_codes} from '../../shared/apis/api';
import NavigationService from '../models/NavigationService';
import CountrySelect from '../design_components/CountrySelect';

import globalStyles, {RWBColors} from '../styles';
import {userLocation} from '../../shared/models/UserLocation';
import SelectableScrollList from '../design_components/SelectableScrollList';
import {ADDRESS_VERIFICATION_ERROR} from '../../shared/constants/ErrorMessages';

const FIELD_IS_REQUIRED_STRING = 'THIS FIELD IS REQUIRED';

const {gender_radio_props, address_type_radio_props} = PERSONAL_INFO_PROPS;

export default class RegisterPersonalInfoView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: () => (
        <RegisterHeader
          headerText="Personal Information"
          stepText="STEP 3 OF 6"
        />
      ),
      headerLeft: () => null,
      headerStyle: {
        backgroundColor: RWBColors.magenta,
      },
      headerTintColor: RWBColors.white,
    };
  };

  constructor(props) {
    super(props);

    const existing_profile = userProfile.getUserProfile();
    const {gender, registration_started_via_app} = existing_profile;

    const {
      address_type,
      address,
      apartment,
      city,
      address_state,
      zip,
      country,
    } = existing_profile.location;

    const default_state = {
      showAndroidImageSheet: false,
      showCountryModal: false,
      showMelissaModal: false,
      showApartmentModal: false,
      apartmentList: [],

      address_type: 'domestic',
      manual_address_entry: false,
      gender: undefined,
      country: '',
      address: '',
      apartment: '',
      city: '',
      address_state: '',
      zip: '',
      fullAddress: '',

      phone_error: '',
      gender_error: '',
      address_error: '',
      keyboardIsShowing: false,
    };
    const assigned_state = Object.assign(
      {},
      default_state,
      address ? {address} : {},
      apartment ? {apartment} : {},
      city ? {city} : {},
      address_state ? {address_state} : {},
      zip ? {zip} : {},
      country ? {country} : {},
      address_type ? {address_type} : {},
      gender ? {gender} : {},
      registration_started_via_app ? {registration_started_via_app} : {},
    );

    this.state = assigned_state;
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this._keyboardWillShow,
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this._keyboardWillHide,
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();
  }

  _keyboardWillShow = (e) => {
    this.keyboardHeight = e.endCoordinates.height;
    this.setState({keyboardIsShowing: true});
    this.forceUpdate();
  };

  _keyboardWillHide = (e) => {
    this.keyboardHeight = 0;
    this.setState({keyboardIsShowing: false});
    this.forceUpdate();
  };

  handleBackButton() {
    return true;
  }

  clearErrorWarnings = () => {
    this.setState({
      city_error: '',
      state_error: '',
      country_error: '',
      address_error: '',
      phone_error: '',
      gender_error: '',
    });
  };

  onAddressPress = () => {
    const {
      navigation: {navigate},
    } = this.props;
    const {country, address, address_type} = this.state;

    if (address_type === 'international' && !country) {
      Alert.alert('Team RWB', 'You must select a country first.');
      return;
    }
    this.setState({showMelissaModal: true});
  };
  verifyAddress = (complete_callback) => {
    const {address, city, address_state, zip} = this.state;
    let {fullAddress} = this.state;
    var country = this.state.country;
    if (!country.length) {
      this.setState({country_error: 'Please select a country'});
    } else {
      this.setState({country_error: undefined});
    }
    if (this.state.address_type === 'domestic') {
      country = 'United States';
    }
    if (fullAddress.length && country.length) {
      fullAddress.includes('REPLACEME')
        ? (fullAddress = fullAddress.replace('REPLACEME', this.state.apartment))
        : null;
      return melissaVerify(country, fullAddress).then((response) => {
        var error_string = '';
        if (response.length != 1) {
          this.setState({address_not_verified: true});
        } else {
          var record = response[0];
          var results = record['Results'];
          results = results.split(',');
          var verified = false;
          var error = false;
          var error_string = '';

          for (let result of results) {
            if (result.startsWith('AV')) {
              result = result.replace('AV', '');
              var level = parseInt(result);
              if (level >= 12) verified = true;
            }
            if (result.startsWith('AE')) {
              var error_code = result.substring(0, 4);
              error = true;
              error_string = error_codes[error_code];
            }
          }
          if (verified && !error) {
            this.setState({address_not_verified: false, error_string: ''});
            var line1 = `${record['PremisesNumber']} ${record['Thoroughfare']}`;
            var line2 = record['AddressLine2'];
            if (line2.startsWith(record['Locality'])) line2 = '';
            else line2 = ', ' + line2;
            if (address != `${line1}${line2}`) {
              this.setState({address: `${line1} ${line2}`});
            }
            if (city != record['Locality']) {
              this.setState({city: record['Locality']});
            }
            if (address_state != record['AdministrativeArea']) {
              this.setState({address_state: record['AdministrativeArea']});
            }
            if (zip != record['PostalCode']) {
              this.setState({zip: record['PostalCode']});
            }
          } else {
            error_string = 'Could not verify address';
            this.setState({
              address_not_verified: true,
              error_string: error_string,
            });
          }
          if (complete_callback) {
            complete_callback();
          }
        }
      });
    }
  };
  nextPressed = () => {
    if (!this.state.manual_address_entry && this.state.fullAddress) {
      this.verifyAddress(() => {
        this.doNext();
      });
    } else {
      this.doNext();
    }
  };
  doNext = () => {
    this.clearErrorWarnings();
    const {
      country,
      address,
      apartment,
      city,
      address_state,
      zip,
      phone,
      gender,
      address_type,
      manual_address_entry,
      registration_started_via_app,
      address_not_verified,
    } = this.state;

    let incomplete = false;
    if (
      this.props.navigation.state.params &&
      this.props.navigation.state.params.incomplete
    )
      incomplete = true;

    // Do validity checking on phone number with all formatting stripped out
    // (555) 555-1212 -> 5555551212
    let strippedPhone;
    if (phone) {
      strippedPhone = phone.replace(/\D/g, ``);
    }
    const zipTest = /^\d\d\d\d\d$|^\d\d\d\d\d-\d\d\d\d$/;

    let hasError = false;

    if (phone) {
      if (!isPhoneNumber(strippedPhone)) {
        this.setState({phone_error: 'PLEASE ENTER ONLY NUMBERS'});
        hasError = true;
      }
      if (strippedPhone.length !== 10) {
        this.setState({phone_error: 'PLEASE ENTER A 10-DIGIT PHONE NUMBER'});
        hasError = true;
      }
    }
    // require a phone number for brand new accounts
    else if (isNullOrEmpty(phone) && !incomplete) {
      this.setState({phone_error: 'PLEASE ENTER A PHONE NUMBER'});
      hasError = true;
    }
    if (isNullOrEmpty(address)) {
      this.setState({address_error: FIELD_IS_REQUIRED_STRING});
      hasError = true;
    }
    if (isNullOrEmpty(city)) {
      this.setState({city_error: FIELD_IS_REQUIRED_STRING});
      hasError = true;
    }
    if (isNullOrEmpty(address_state)) {
      this.setState({state_error: FIELD_IS_REQUIRED_STRING});
      hasError = true;
    }
    if (address_type === 'international' && isNullOrEmpty(country)) {
      this.setState({country_error: FIELD_IS_REQUIRED_STRING});
      hasError = true;
    }
    if (!gender) {
      this.setState({gender_error: 'PLEASE SELECT AN OPTION'});
      hasError = true;
    }
    if (!manual_address_entry && address_not_verified) {
      hasError = true;
    }

    if (hasError) return;
    let value = {
      location: {
        address,
        apartment,
        address_state,
        address_type,
        city,
        country,
        zip,
      },
      gender,
      phone: strippedPhone,
      registration_started_via_app,
    };

    if (address_type === 'domestic') {
      value.address_verified = !manual_address_entry;
      value.location.country = 'United States';
    } else if (address_type === 'international') {
      value.international_address_verified = !manual_address_entry;
    }

    const profile = Object.assign({}, userProfile.getUserProfile(), value);
    if (profile.legal_waiver_signed) logUpdatePersonalInformation();
    // log it as updating when regoing through the registration flow
    else {
      let analyticsObj = {};
      if (
        this.props.navigation.state.params &&
        this.props.navigation.state.params.from
      )
        analyticsObj.previous_view = this.props.navigation.state.params.from;
      logPersonalInfo(analyticsObj);
    } 
    userProfile.saveToUserProfile(profile);
    NavigationService.navigate('SocialProfile', {incomplete, value, from: 'Personal Information'});
  };

  onCountrySelect = (item) => {
    this.setState(
      {
        country_error: undefined,
        showCountryModal: false,
        countrySlug: item,
        country: COUNTRY_OPTIONS[item].display,
      },
      () => {
        this.verifyAddress();
      },
    );
  };

  onCountrySelectCancel = () => {
    this.setState({
      showCountryModal: false,
    });
  };

  onApartmentSelect = (item) => {
    this.setState({showApartmentModal: false, apartment: item});
  };

  handleMelissaResponse = (response) => {
    if (response) {
      // empty suite lists have empty strings as the first index
      if (response?.suiteList?.length > 1)
        this.setState({
          showApartmentModal: true,
          apartmentList: response.suiteList,
        });
      else this.setState({apartment: ''});
      const {city, state, zip, street, suiteName} = response;
      // apartment/unit/suite number has not yet been selected but is needed to be verified
      const fullAddress = suiteName
        ? `${street} REPLACEME, ${city} ${state} ${zip}`
        : `${street}, ${city} ${state} ${zip}`;
      this.setState(
        Object.assign(
          {},
          {address_not_verified: false},
          {showMelissaModal: false},
          city ? {city} : {},
          state ? {address_state: state} : {},
          zip ? {zip} : {},
          street
            ? {
                address: street,
                address_error: '',
                fullAddress,
              }
            : {address_error: FIELD_IS_REQUIRED_STRING},
        ),
      );
    }
    // do not change the city if there was no response (user hit back/done without selecting a value)
    else this.setState({showMelissaModal: false});
  };

  notVerifiedMessage = () => {
    return (
      <Text
        style={[
          globalStyles.link,
          {textDecorationLine: 'none', marginTop: 10},
        ]}>
        {ADDRESS_VERIFICATION_ERROR}
      </Text>
    );
  };

  render() {
    const {
      address,
      apartment,
      address_state,
      city,
      zip,
      manual_address_entry,
    } = this.state;
    let addressField;
    var address_string = 'STREET';
    var apartment_string = 'Apartment';
    var state_string = 'STATE';
    var zip_string = 'ZIP';
    var city_string = 'CITY';
    if (this.state.address_type === 'international') {
      state_string = 'ADMINISTRATIVE AREA';
      zip_string = 'POSTAL CODE';
      city_string = 'LOCALITY';
      address_string = 'STREET';
    }
    if (manual_address_entry) {
      addressField = (
        <View style={globalStyles.formBlock}>
          {this.state.address_type === 'international' ? (
            <TouchableOpacity
              style={{marginTop: 25}}
              onPress={() => this.setState({showCountryModal: true})}>
              <View style={globalStyles.autoAddressBar}>
                <Text style={globalStyles.autoAddressBarText}>
                  {this.state.country ? this.state.country : 'COUNTRY'}
                </Text>
                {this.state.country_error ? (
                  <Text style={globalStyles.errorMessage}>
                    {this.state.country_error}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ) : null}
          <RWBTextField
            label="Street"
            error={this.state.address_error}
            value={this.state.address}
            onBlur={() => {}}
            onChangeText={(text) => {
              this.setState({address: text});
            }}
            refProp={(input) => {
              this.addressInput = input;
            }}
            returnKeyType="next"
          />

          <RWBTextField
            label={apartment_string}
            error={null}
            value={this.state.apartment}
            onBlur={() => {}}
            onChangeText={(text) => {
              this.setState({apartment: text});
            }}
            refProp={(input) => {
              this.apartmentInput = input;
            }}
            onSubmitEditing={() => this.stateInput.focus()}
            returnKeyType="next"
          />

          <RWBTextField
            label={city_string}
            error={this.state.city_error}
            value={this.state.city}
            onBlur={() => {}}
            onChangeText={(text) => {
              this.setState({city: text});
            }}
            refProp={(input) => {
              this.cityInput = input;
            }}
            onSubmitEditing={() => this.stateInput.focus()}
            returnKeyType="next"
          />
          <RWBTextField
            label={state_string}
            error={this.state.state_error}
            value={this.state.address_state}
            onBlur={() => {}}
            onChangeText={(text) => {
              this.setState({address_state: text});
            }}
            refProp={(input) => {
              this.stateInput = input;
            }}
            onSubmitEditing={() => this.zipInput.focus()}
            returnKeyType="next"
          />
          <RWBTextField
            label={zip_string}
            error={this.state.zip_error}
            value={this.state.zip}
            keyboardType="number-pad"
            onBlur={() => {}}
            onChangeText={(text) => {
              this.setState({zip: text});
            }}
            refProp={(input) => {
              this.zipInput = input;
            }}
            returnKeyType="done"
          />
          <View>
            <View>
              <Text
                style={[globalStyles.link, {marginTop: 10}]}
                onPress={() => {
                  this.setState({manual_address_entry: false});
                }}>
                Use Auto Complete
              </Text>
            </View>
          </View>
        </View>
      );
    } else {
      addressField = (
        <View style={globalStyles.formBlock}>
          {this.state.address_type === 'international' ? (
            <TouchableOpacity
              style={{marginTop: 25}}
              onPress={() =>
                this.setState({
                  showCountryModal: true,
                })
              }>
              <View style={globalStyles.autoAddressBar}>
                <Text style={globalStyles.autoAddressBarText}>
                  {this.state.country ? this.state.country : 'COUNTRY'}
                </Text>
                {this.state.country_error ? (
                  <Text style={globalStyles.errorMessage}>
                    {this.state.country_error}
                  </Text>
                ) : null}
              </View>
              {this.state.country_error ? (
                <View style={globalStyles.errorBar} />
              ) : null}
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={{marginTop: 25}}
            onPress={this.onAddressPress}>
            <View style={globalStyles.autoAddressBar}>
              <Text style={globalStyles.autoAddressBarText}>ADDRESS</Text>
            </View>
          </TouchableOpacity>
          {this.state.address_error !== '' && (
            <Text style={[globalStyles.errorMessage, {marginTop: 8}]}>
              {this.state.address_error}
            </Text>
          )}
          {this.state.address_error !== '' && <View style={styles.errorBar} />}
          <View>
            {this.state.address_type === 'domestic' ? (
              <>
                <Text style={[globalStyles.bodyCopy, {marginTop: 10}]}>
                  Type the first few characters of your address in the box and
                  then select from the list of matching addresses, or
                  <Text
                    style={globalStyles.link}
                    onPress={() => {
                      this.setState({manual_address_entry: true});
                    }}>
                    {' '}
                    manually enter your address.
                  </Text>
                </Text>
                {this.state.address_not_verified
                  ? this.notVerifiedMessage()
                  : null}
              </>
            ) : (
              <>
                <Text style={[globalStyles.bodyCopy, {marginTop: 10}]}>
                  Enter an address, or
                  <Text
                    style={globalStyles.link}
                    onPress={() => {
                      this.setState({manual_address_entry: true});
                    }}>
                    {' '}
                    manually enter your address.
                  </Text>
                </Text>
                {this.state.address_not_verified
                  ? this.notVerifiedMessage()
                  : null}
              </>
            )}
          </View>

          {address ? (
            <View>
              {this.state.address_type === 'international' ? (
                <Text style={globalStyles.bodyCopy}>
                  Country: {this.state.country}
                </Text>
              ) : null}
              <Text style={globalStyles.bodyCopy}>
                {address_string}: {this.state.address}
              </Text>
              {!isNullOrEmpty(this.state.apartment) && (
                <Text style={globalStyles.bodyCopy}>
                  {apartment_string}: {this.state.apartment}
                </Text>
              )}
              <Text style={globalStyles.bodyCopy}>
                {city_string}: {this.state.city}
              </Text>
              <Text style={globalStyles.bodyCopy}>
                {state_string}: {this.state.address_state}
              </Text>
              <Text style={globalStyles.bodyCopy}>
                {zip_string}: {this.state.zip}
              </Text>
            </View>
          ) : null}
        </View>
      );
    }
    return (
      <SafeAreaView style={globalStyles.registrationScreenContainer}>
        <StatusBar
          barStyle="light-content"
          animated={true}
          translucent={false}
          backgroundColor={RWBColors.magenta}
        />
        <KeyboardAwareScrollView
          style={styles.scrollViewContainer}
          contentContainerStyle={[
            styles.scrollViewContainerContent,
            {flexGrow: this.state.keyboardIsShowing ? 0 : 1},
          ]}
          keyboardShouldPersistTaps="handled">
          <Modal
            style={{flex: 1, width: '75%'}}
            transparent={true}
            animationType={'slide'}
            visible={this.state.showCountryModal}>
            <CountrySelect
              onCountrySelect={this.onCountrySelect}
              onCountrySelectCancel={this.onCountrySelectCancel}
            />
          </Modal>
          <View style={{width: '100%', flex: 1}}>
            <View style={styles.formWrapper}>
              <Text style={globalStyles.radioFormLabel}>ADDRESS TYPE</Text>
              <LinedRadioForm
                radio_props={address_type_radio_props}
                arrayLength={address_type_radio_props.length}
                initial={0}
                value={this.state.address_type}
                onPress={(value, index) => {
                  this.setState(
                    {
                      manual_address_entry: false,
                      address_type: value,
                      country: '',
                    },
                    () => {
                      this.verifyAddress();
                    },
                  );
                }}
              />

              {addressField}

              <View style={globalStyles.formBlock}>
                <RWBTextField
                  label="PHONE"
                  error={this.state.phone_error}
                  onChangeText={(text) => {
                    this.setState({phone: text});
                  }}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                />
              </View>

              <View style={globalStyles.formBlock}>
                <Text style={globalStyles.radioFormLabel}>GENDER</Text>
                <LinedRadioForm
                  radio_props={gender_radio_props}
                  arrayLength={gender_radio_props.length}
                  initial={getRadioIndexForValue(
                    gender_radio_props,
                    this.state.gender,
                    -1,
                  )}
                  error={this.state.gender_error}
                  ref="genderRadioForm"
                  value={this.state.gender}
                  onPress={(value) => {
                    this.setState({gender: value});
                  }}
                />

                {this.state.gender_error != '' && (
                  <Text style={globalStyles.errorMessage}>
                    {this.state.gender_error}
                  </Text>
                )}
              </View>
            </View>
            <View style={globalStyles.centerButtonWrapper}>
              <RWBButton
                buttonStyle="primary"
                text="NEXT"
                onPress={this.nextPressed}
              />
            </View>
          </View>
          <Modal
            visible={this.state.showMelissaModal}
            onRequestClose={() => this.setState({showMelissaModal: false})}>
            <AutoCompleteMelissa
              value={{
                label: 'Street address',
                api:
                  this.state.address_type === 'domestic'
                    ? 'freeform'
                    : 'globalfreeform',
                country: this.state.country,
              }}
              onMelissaFinish={this.handleMelissaResponse}
            />
          </Modal>
          <Modal
            style={{flex: 1, width: '75%'}}
            transparent={true}
            animationType={'slide'}
            visible={this.state.showApartmentModal}>
            <SelectableScrollList
              options={this.state.apartmentList}
              title={'Apartment Unit'}
              onSelect={this.onApartmentSelect}
              onCancel={() =>
                this.setState({showApartmentModal: false, apartment: ''})
              }
            />
          </Modal>
        </KeyboardAwareScrollView>
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
  },
  formWrapper: {
    flex: 1,
    width: '100%',
    height: 'auto',
    marginTop: 15,
  },
  logoView: {
    width: '100%',
    padding: 50,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  footerText: {
    fontSize: 10,
    textAlign: 'center',
    width: '65%',
  },
  iconView: {
    width: 16,
    height: 16,
  },
  errorBar: {
    position: 'absolute',
    left: Dimensions.get('window').width * -0.05,
    backgroundColor: RWBColors.magenta,
    top: 15,
    width: 7,
    height: '95%',
  },
});
