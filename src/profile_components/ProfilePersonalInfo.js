import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  BackHandler,
} from 'react-native';
import {
  getRadioIndexForValue,
  isNullOrEmpty,
  isPhoneNumber,
} from '../../shared/utils/Helpers';
import RWBButton from '../design_components/RWBButton';
import RWBTextField from '../design_components/RWBTextField';
import LinedRadioForm from '../design_components/LinedRadioForm';
import {rwbApi} from '../../shared/apis/api';
import {PERSONAL_INFO_PROPS} from '../../shared/constants/RadioProps';
import {COUNTRY_OPTIONS} from '../../shared/constants/Countries';
import {SafeAreaView, NavigationEvents} from 'react-navigation';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CountrySelect from '../design_components/CountrySelect';
import {userProfile} from '../../shared/models/UserProfile';
import {melissaVerify, error_codes} from '../../shared/apis/api';
import AutoCompleteMelissa from '../autocomplete_components/AutoCompleteMelissa';
//SVGs
import ChevronBack from '../../svgs/ChevronBack';
import NavigationService from '../models/NavigationService';

import globalStyles, {RWBColors} from '../styles';
import {logUpdatePersonalInformation} from '../../shared/models/Analytics';
import SelectableScrollList from '../design_components/SelectableScrollList';

const {gender_radio_props, address_type_radio_props} = PERSONAL_INFO_PROPS;

export default class ProfilePersonalInfo extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: 'Personal Information',
      headerStyle: {
        backgroundColor: RWBColors.magenta,
      },
      headerTintColor: RWBColors.white,
      // the shared header config is in app.js
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
        <Text style={[globalStyles.title, {top: 3}]}>Personal Information</Text>
      ),
    };
  };
  constructor(props) {
    super(props);
    const {navigation} = this.props;
    const value = navigation.getParam('value', null);
    if (value === null)
      throw new Error('ProfilePersonalInfo must have navigation value object.');
    const {first_name, last_name, email, phone, gender} = value.user;
    const {
      address_type,
      country,
      address,
      address_2,
      address_state,
      city,
      zip,
    } = value.userLocation;

    // These must be initialized and assigned before render() `returns` for the first time.
    // Re-rendering after componentDidMount() will not update LinedRadioForm's initial value.
    this.address_type_index = getRadioIndexForValue(
      address_type_radio_props,
      address_type,
      -1,
    );
    this.gender_index = getRadioIndexForValue(gender_radio_props, gender, 2);

    this.state = {
      needsToSave: false,
      showCountryModal: false,
      showApartmentModal: false,
      apartmentList: [],

      first_name,
      last_name,

      email,

      manual_address_entry: false,
      address_type,
      country,
      address,
      apartment: address_2,
      city,
      address_state,
      zip,
      phone,
      gender,
      fullAddress: address_2
        ? `${address} ${address_2}, ${city} ${address_state} ${zip}`
        : `${address}, ${city} ${address_state} ${zip}`,
      originalFullAddress: address_2
        ? `${address} ${address_2}, ${city} ${address_state} ${zip}`
        : `${address}, ${city} ${address_state} ${zip}`,
      first_name_error: '',
      last_name_error: '',

      email_error: '',

      phone_error: '',
      gender_error: '',

      melissaVisible: false,
    };
    this.onAddressPress = this.onAddressPress.bind(this);
    this.onCountrySelect = this.onCountrySelect.bind(this);
    this.onCountrySelectCancel = this.onCountrySelectCancel.bind(this);
    this.handleDidFocus = this.handleDidFocus.bind(this);
    this.backPressed = this.backPressed.bind(this);
    this.savePressed = this.savePressed.bind(this);
    this.handleBackPress = this.handleBackPress.bind(this);
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

  clearErrorWarnings() {
    this.setState({
      address_error: '',
      phone_error: '',
      gender_error: '',
    });
  }

  onAddressPress() {
    const {
      navigation: {navigate},
    } = this.props;
    const {country, address, address_type} = this.state;

    if (address_type === 'international' && !country) {
      Alert.alert('Team RWB', 'You must select a country first.');
      return;
    }
    this.setState({melissaVisible: true});
  }

  handleDidFocus({state: {params: {value} = {}}}) {
    if (value.hasOwnProperty('userID')) return;
    let {city, state, zip, address, fullAddress} = value;
    // if the user enters the page and used autocomplete to fill in their address,
    // the address will be empty because it expected values to be retrieved from auto complete
    // if there already is the data and this function did not get anything (because the user did not open auto complete)
    // use the already stored address
    if (!address && value.userLocation) {
      address = value.userLocation.address;
    }
    this.setState(
      Object.assign(
        {},
        city ? {city} : {},
        state ? {address_state: state} : {},
        zip ? {zip} : {},
        address ? {address, address_error: ''} : {},
        fullAddress ? {fullAddress} : {},
      ),
    );
  }

  backPressed() {
    const {navigation} = this.props;
    const {needsToSave} = this.state;
    if (needsToSave) {
      navigation.navigate('SaveModal', {
        save: this.savePressed,
      });
    } else {
      navigation.goBack();
    }
  }
  verifyAddress = (complete_callback) => {
    const {address, city, address_state, zip, address_type} = this.state;
    let {fullAddress} = this.state;
    var country = this.state.country;
    if (!country) {
      this.setState({country_error: 'Please select a country'});
    } else {
      this.setState({country_error: undefined});
    }
    country =
      address_type === 'domestic' ? 'United States' : this.state.country;
    if (fullAddress.length && country.length) {
      return melissaVerify(country, fullAddress).then((response) => {
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
  savePressed() {
    if (
      !this.state.manual_address_entry &&
      this.state.fullAddress !== this.state.originalFullAddress
    ) {
      this.verifyAddress(() => {
        this.doSave();
      });
    } else {
      this.doSave();
    }
  }
  doSave = () => {
    const {
      first_name,
      last_name,
      email,
      address_type,
      country,
      address,
      apartment,
      city,
      address_state,
      zip,
      phone,
      gender,
      address_not_verified,
    } = this.state;
    var {manual_address_entry} = this.state;
    // Do validity checking on phone number with all formatting stripped out
    // (555) 555-1212 -> 5555551212
    let strippedPhone;
    if (phone) {
      strippedPhone = phone.replace(/\D/g, ``);
    }
    this.clearErrorWarnings();

    let field_is_required_string = 'THIS FIELD IS REQUIRED';
    const zipTest = /^\d\d\d\d\d$|^\d\d\d\d\d-\d\d\d\d$/;
    let hasError = false;

    if (isNullOrEmpty(first_name)) {
      this.setState({first_name_error: field_is_required_string});
      hasError = true;
    }
    if (isNullOrEmpty(last_name)) {
      this.setState({last_name_error: field_is_required_string});
      hasError = true;
    }
    if (isNullOrEmpty(email)) {
      this.setState({email_error: field_is_required_string});
      hasError = true;
    }
    if (email.endsWith('teamrwb.org')) {
      this.setState({email_error_text: 'PLEASE USE A NON-TEAMRWB EMAIL'});
      hasError = true;
    }
    // country can be ignored when the address_type is not international
    if (isNullOrEmpty(address)) {
      this.setState({address_error: field_is_required_string});
      hasError = true;
    }
    if (isNullOrEmpty(city)) {
      this.setState({city_error: field_is_required_string});
      hasError = true;
    }
    if (isNullOrEmpty(address_state)) {
      this.setState({state_error: field_is_required_string});
      hasError = true;
    }
    if (address_type === 'international' && !country.length) {
      hasError = true;
    }
    if (
      !manual_address_entry &&
      address_type === 'international' &&
      address_not_verified
    ) {
      hasError = true;
    }
    // Optional field despite the "optional" text being removed
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
    if (!gender) {
      this.setState({gender_error: 'PLEASE SELECT AN OPTION'});
      hasError = true;
    }
    // check all fields for errors, then return.
    if (hasError) {
      return;
    }
    const value = {
      first_name,
      last_name,
      email,
      address_type,
      phone: strippedPhone ? strippedPhone : null,
      gender,
      country: address_type === 'domestic' ? 'United States' : country,
      street: address,
      street_2: apartment,
      city,
      state: address_state,
      zipcode: zip,
    };
    if (address_type === 'domestic') {
      value.address_verified = !manual_address_entry;
    } else if (address_type === 'international') {
      value.international_address_verified = !manual_address_entry;
    }
    this.updateUser(value);
  };

  updateUser(user_data) {
    this.setState({isLoading: true});

    let data = JSON.stringify(user_data);

    rwbApi
      .putUser(data)
      .then((response) => {
        this.setState({isLoading: false});
        logUpdatePersonalInformation();
        this.props.navigation.goBack();
      })
      .catch((error) => {
        Alert.alert(
          'Team RWB',
          'There was a problem updating your personal info. Please try again later.',
        );
        this.setState({isLoading: false});
      });
  }

  onCountrySelect(item) {
    this.setState(
      {
        showCountryModal: false,
        countrySlug: item,
        country: COUNTRY_OPTIONS[item].display,
      },
      () => {
        this.verifyAddress();
      },
    );
  }

  handleMelissaResponse = (response) => {
    if (response) {
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
      this.setState({
        city,
        address_state: state,
        zip,
        address: street,
        melissaVisible: false,
        fullAddress,
      });
    }
    // do not change the city if there was no response (user hit back/done without selecting a value)
    else this.setState({melissaVisible: false});
  };

  onCountrySelectCancel() {
    this.setState({
      showCountryModal: false,
    });
  }

  onApartmentSelect = (item) => {
    let {fullAddress} = this.state;
    fullAddress.includes('REPLACEME')
      ? (fullAddress = fullAddress.replace('REPLACEME', item))
      : null;
    this.setState({showApartmentModal: false, apartment: item, fullAddress});
  };

  render() {
    const {
      first_name,
      last_name,
      email,
      address_type,
      country,
      address,
      apartment,
      address_state,
      city,
      zip,
      phone,
      fullAddress,
    } = this.state;

    const {
      first_name_error,
      last_name_error,
      email_error,
      address_error,
      city_error,
      state_error,
      phone_error,
      zip_error,
      gender_error,
      error_string,
    } = this.state;
    var manual_address_entry = this.state.manual_address_entry;
    var address_string = 'STREET';
    var apartment_string = 'APARTMENT';
    var state_string = 'STATE';
    var zip_string = 'ZIP';
    var city_string = 'CITY';
    if (this.state.address_type === 'international') {
      state_string = 'ADMINISTRATIVE AREA';
      zip_string = 'POSTAL CODE';
      city_string = 'LOCALITY';
      address_string = 'STREET';
    }
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: RWBColors.white}}>
        <View style={{width: '100%', height: 'auto', flex: 1}}>
          {this.state.isLoading && (
            <View style={globalStyles.spinnerOverLay}>
              <ActivityIndicator size="large" />
            </View>
          )}
          <KeyboardAwareScrollView
            style={{flex: 1}}
            contentContainerStyle={styles.container}
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
            <View style={styles.formWrapper} ref="uploadPhotoView">
              <RWBTextField
                label="EMAIL"
                value={email ? email : ''}
                error={email_error}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(text) => {
                  this.setState({
                    email: text,
                    needsToSave: true,
                  });
                }}
              />
              <Text style={[globalStyles.bodyCopy, {marginTop: 25}]}>
                Please use a civilian or non-governmental email address. (Note:
                Eagle Leaders, please do not use your @teamrwb.org email
                address)
              </Text>

              <Text style={[globalStyles.radioFormLabel, {marginTop: 25}]}>
                ADDRESS TYPE
              </Text>
              <LinedRadioForm
                radio_props={address_type_radio_props}
                arrayLength={address_type_radio_props.length}
                initial={this.address_type_index}
                onPress={(value) => {
                  this.setState(
                    {
                      manual_address_entry: false,
                      address_type: value,
                      needsToSave: true,
                    },
                    () => {
                      this.verifyAddress();
                    },
                  );
                }}
              />
              {manual_address_entry ? (
                <View style={styles.formBlock}>
                  {address_type === 'international' ? (
                    <TouchableOpacity
                      style={{marginTop: 25}}
                      onPress={() => this.setState({showCountryModal: true})}>
                      <View style={globalStyles.autoAddressBar}>
                        <Text style={globalStyles.autoAddressBarText}>
                          {country ? country : 'COUNTRY'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                  <RWBTextField
                    label="ADDRESS:"
                    value={address ? address : ''}
                    error={address_error}
                    onBlur={() => {}}
                    onChangeText={(text) => {
                      this.setState({
                        address: text,
                        needsToSave: true,
                      });
                    }}
                  />
                  <RWBTextField
                    label={apartment_string}
                    value={apartment ? apartment : ''}
                    error={null}
                    onBlur={() => {}}
                    onChangeText={(text) => {
                      this.setState({
                        apartment: text,
                        needsToSave: false,
                      });
                    }}
                  />
                  <RWBTextField
                    label={city_string}
                    value={city ? city : ''}
                    error={city_error}
                    onBlur={() => {}}
                    onChangeText={(text) => {
                      this.setState({
                        city: text,
                        needsToSave: true,
                      });
                    }}
                  />
                  <RWBTextField
                    label={state_string}
                    value={address_state ? address_state : ''}
                    error={state_error}
                    onBlur={() => {}}
                    onChangeText={(text) => {
                      this.setState({
                        address_state: text,
                        needsToSave: true,
                      });
                    }}
                  />
                  <RWBTextField
                    label={zip_string}
                    value={zip ? zip : ''}
                    error={zip_error}
                    onBlur={() => {}}
                    onChangeText={(text) => {
                      this.setState({
                        zip: text,
                        needsToSave: true,
                      });
                    }}
                  />
                  <View>
                    <Text style={globalStyles.bodyCopy}>
                      {address_string}: {address}
                    </Text>
                    {!isNullOrEmpty(apartment) && (
                      <Text style={globalStyles.bodyCopy}>
                        {apartment_string}: {apartment}
                      </Text>
                    )}
                    <Text style={globalStyles.bodyCopy}>
                      {city_string}: {city}
                    </Text>
                    <Text style={globalStyles.bodyCopy}>
                      {state_string}: {address_state}
                    </Text>
                    <Text style={globalStyles.bodyCopy}>
                      {zip_string}: {zip}
                    </Text>
                  </View>
                  {this.state.address_type === 'domestic' ? (
                    <View>
                      <Text
                        style={[globalStyles.link, {marginTop: 10}]}
                        onPress={() => {
                          this.setState({manual_address_entry: false});
                        }}>
                        Use Auto Complete
                      </Text>
                    </View>
                  ) : null}
                  {this.state.address_not_verified ? (
                    <Text
                      style={[
                        globalStyles.link,
                        {textDecorationLine: 'underline', marginTop: 10},
                      ]}></Text>
                  ) : null}
                </View>
              ) : (
                <View style={globalStyles.formBlock}>
                  <NavigationEvents onDidFocus={this.handleDidFocus} />

                  {this.state.address_type === 'international' && (
                    <View>
                      <TouchableOpacity
                        style={{marginTop: 25}}
                        onPress={() =>
                          this.setState({
                            showCountryModal: true,
                          })
                        }>
                        <View style={globalStyles.autoAddressBar}>
                          <Text style={globalStyles.autoAddressBarText}>
                            {country ? country : 'COUNTRY'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                  <TouchableOpacity
                    style={{marginTop: 25}}
                    onPress={this.onAddressPress}>
                    <View style={globalStyles.autoAddressBar}>
                      <Text style={globalStyles.autoAddressBarText}>
                        {fullAddress ? fullAddress : 'ADDRESS'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {address_error != null && address_error != '' && (
                    <Text style={[globalStyles.errorMessage, {marginTop: 8}]}>
                      {address_error}
                    </Text>
                  )}
                  {address_error != null && address_error != '' && (
                    <View style={styles.errorBar} />
                  )}
                  <View>
                    {this.state.address_type === 'domestic' ? (
                      <Text style={[globalStyles.bodyCopy, {marginTop: 10}]}>
                        Type the first few characters of your address in the box
                        and then select from the list of matching addresses, or
                        <Text
                          style={globalStyles.link}
                          onPress={() => {
                            this.setState({manual_address_entry: true});
                          }}>
                          {' '}
                          manually enter your address.
                        </Text>
                      </Text>
                    ) : (
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
                    )}
                  </View>
                  <View>
                    <Text style={globalStyles.bodyCopy}>
                      {address_string}: {address}
                    </Text>
                    {!isNullOrEmpty(apartment) && (
                      <Text style={globalStyles.bodyCopy}>
                        {apartment_string}: {apartment}
                      </Text>
                    )}
                    <Text style={globalStyles.bodyCopy}>
                      {city_string}: {city}
                    </Text>
                    <Text style={globalStyles.bodyCopy}>
                      {state_string}: {address_state}
                    </Text>
                    <Text style={globalStyles.bodyCopy}>
                      {zip_string}: {zip}
                    </Text>
                  </View>
                </View>
              )}

              <View style={globalStyles.formBlock}>
                <RWBTextField
                  label="PHONE"
                  error={phone_error}
                  value={phone || ''}
                  onChangeText={(text) => {
                    this.setState({phone: text});
                  }}
                  keyboardType={'phone-pad'}
                  returnKeyType={'done'}
                />
              </View>

              <View style={styles.formBlock}>
                <Text style={globalStyles.radioFormLabel}>GENDER</Text>
                <LinedRadioForm
                  radio_props={gender_radio_props}
                  arrayLength={gender_radio_props.length}
                  error={gender_error}
                  ref="genderRadioForm"
                  initial={this.gender_index}
                  onPress={(value) => {
                    this.setState({
                      gender: value,
                      needsToSave: true,
                    });
                  }}
                />

                {gender_error !== '' && (
                  <Text style={globalStyles.errorMessage}>{gender_error}</Text>
                )}
              </View>
              <View style={globalStyles.centerButtonWrapper}>
                <RWBButton
                  buttonStyle="primary"
                  text="SAVE"
                  onPress={this.savePressed}
                />
              </View>
            </View>
          </KeyboardAwareScrollView>
          <Modal
            visible={this.state.melissaVisible}
            onRequestClose={() => this.setState({melissaVisible: false})}>
            <AutoCompleteMelissa
              value={{
                initial_value: address,
                label: 'ADDRESS',
                api:
                  address_type === 'domestic' ? 'freeform' : 'globalfreeform',
                country,
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
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: RWBColors.white,
  },
  formWrapper: {
    flex: 1,
    width: '90%',
    height: 'auto',
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
  profileImageView: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 25,
  },
  profileImage: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  profileImageActions: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingLeft: 25,
  },
  formBlock: {
    marginBottom: 25,
  },
  actionSheet: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    paddingHorizontal: '10%',
    paddingBottom: '5%',
    backgroundColor: 'rgba(0,0,0,0.75)',
    bottom: 0,
    justifyContent: 'flex-end',
  },
});
