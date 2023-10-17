import React, {Component} from 'react';
import {PERSONAL_INFO_PROPS} from '../../../../shared/constants/RadioProps';
import TextInput from '../TextInput';
import RWBButton from '../RWBButton';
import RadioForm from '../RadioForm';
import styles from './Registration.module.css';
import {userProfile} from '../../../../shared/models/UserProfile';
import {logPersonalInfo} from '../../../../shared/models/Analytics';
import {
  melissaVerify,
  error_codes,
  melissaFreeForm,
  melissaGlobalFreeForm,
  melissaCityState,
} from '../../../../shared/apis/api';
import {
  isPhoneNumber,
  isNullOrEmpty,
  debounce,
} from '../../../../shared/utils/Helpers';
import {COUNTRY_OPTIONS} from '../../../../shared/constants/Countries';
import CountryModal from '../profile/CountryModal';
import AddressesList from '../profile/AddressesList';
import ScrollableListModal from '../profile/ScrollableListModal';
import {withRouter} from 'react-router-dom';
import {ADDRESS_VERIFICATION_ERROR} from '../../../../shared/constants/ErrorMessages';

const {gender_radio_props, address_type_radio_props} = PERSONAL_INFO_PROPS;
const DEBOUNCE_MS = 500;
const FIELD_IS_REQUIRED_STRING = 'THIS FIELD IS REQUIRED';

class RegisterPersonalInfo extends Component {
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

      address_type: 'domestic',
      manual_address_entry: false,
      gender: undefined,
      country: '',
      address: '',
      apartment: '',
      apartmentList: [],
      city: '',
      address_state: '',
      zip: '',
      fullAddress: '',
      phone: '',

      phone_error: '',
      gender_error: '',
      address_error: '',
      country_error: '',

      addressSuggestions: [],
      fullAddressInternational: '',
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

  verifyAddress = (complete_callback) => {
    const {
      address,
      city,
      address_state,
      zip,
      fullAddressInternational,
      apartment,
    } = this.state;
    var country = this.state.country;
    if (!country.length) {
      this.setState({country_error: 'Please select a country'});
    } else {
      this.setState({country_error: undefined});
    }
    if (this.state.address_type === 'domestic') {
      country = 'United States';
    }
    const addressWithApartment = `${fullAddressInternational} ${apartment}`;
    if (!isNullOrEmpty(addressWithApartment) && country.length) {
      return melissaVerify(country, addressWithApartment).then((response) => {
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
    let analyticsObj = {};
    if (this.props.location.state && this.props.location.state.from)
      analyticsObj.previous_view = this.props.location.state.from;
    logPersonalInfo(analyticsObj);
    if (
      this.state.address_type === 'international' &&
      !this.state.manual_address_entry
    ) {
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
    if (this.props.location.state && this.props.location.state.incomplete)
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
    userProfile.saveToUserProfile(profile);

    this.props.history.push({
      pathname: '/registration/social_info',
      state: {incomplete, value, from: 'Personal Info'},
    });
  };

  onCountrySelect = (slug) => {
    this.setState(
      {
        showCountryModal: false,
        countrySlug: slug,
        country: COUNTRY_OPTIONS[slug].display,
      },
      () => {
        this.verifyAddress();
      },
    );
  };

  onApartmentSelect = (item) => {
    this.setState(
      {
        showApartmentModal: false,
        apartment: item,
      },
      () => {
        this.verifyAddress();
      },
    );
  };

  fetchOptions = (value) => {
    let {country, address_type} = this.state;
    const api = address_type === 'domestic' ? 'freeform' : 'globalfreeform';

    if (api === 'freeform') {
      return melissaFreeForm(value, 10)
        .then((data) => {
          let addressList = data['Results']
            ? data['Results'].map((option) => ({
                fullAddress: `${option['Address']['AddressLine1']}, ${option['Address']['City']} ${option['Address']['State']}, ${option['Address']['PostalCode']}`,
                street: option['Address']['AddressLine1'],
                city: option['Address']['City'],
                state: option['Address']['State'],
                zip: option['Address']['PostalCode'],
                list_key: option['Address']['MAK'],
                suiteName: option['Address']['SuiteName'],
                suiteList: option['Address']['SuiteList'],
              }))
            : [];
          return addressList;
        })
        .catch((err) => {});
    }

    if (api === 'globalfreeform') {
      return melissaGlobalFreeForm(value, country, 10)
        .then((data) => {
          let addressList = data['Results']
            ? data['Results'].map((option) => ({
                fullAddress: `${option['Address']['Address1']}, ${option['Address']['Locality']} ${option['Address']['AdministrativeArea']} ${option['Address']['PostalCode']}, ${option['Address']['CountryName']}`,
                country: option['Address']['CountryName'], // Might be needlessly verbose. "United States of America".
                street: option['Address']['Address1'],
                city: option['Address']['Locality'],
                state: option['Address']['AdministrativeArea'],
                zip: option['Address']['PostalCode'],
                list_key: option['Address']['MAK'],
                suiteName: option['Address']['SuiteName'],
                suiteList: option['Address']['SuiteList'],
              }))
            : [];
          return addressList;
        })
        .catch((err) => {});
    } else if (api === 'citystate') {
      let zipcode = /\d\d\d\d\d/; // regex matches five numeric digits
      let zip;
      let city;
      let state;
      if (value.match(zipcode) !== null) {
        zip = value.match(zipcode)[0];
        city = value.replace(zipcode, '').trim();
      } else {
        zip = null;
        if (value.includes(',')) {
          let commaIndex = value.indexOf(',');
          city = value.slice(0, commaIndex);
          state = value.slice(commaIndex).trim();
        } else {
          city = value;
        }
      }

      return melissaCityState(city, zip, 10, state)
        .then((data) => {
          let addressList = data['Results']
            ? data['Results'].map((option) => ({
                fullAddress:
                  option['Address']['PostalCode'] +
                  ' ' +
                  option['Address']['City'] +
                  ', ' +
                  option['Address']['State'],
                city: option['Address']['City'],
                state: option['Address']['State'],
                zip: option['Address']['PostalCode'],
                list_key: option['Address']['PostalCode'],
                suiteName: option['Address']['SuiteName'],
                suiteList: option['Address']['SuiteList'],
              }))
            : [];
          return addressList;
        })
        .catch((err) => {});
    }
  };

  updateOptionsSingular = (value) => {
    const thisFetchOptions = this.fetchOptions(value)
      .then((data) => {
        const options = data.map((option) => ({key: option}));
        this.setState({
          addressSuggestions: options,
        });
      })
      .catch((err) =>
        this.setState({error_string: 'Could not get the address.'}),
      );
  };

  updateOptions = debounce(this.updateOptionsSingular, DEBOUNCE_MS);

  selectAddressHandler = (response) => {
    if (response) {
      const {city, state, zip, street, fullAddress} = response;
      // empty suite lists have empty strings as the first index
      if (response?.suiteList?.length > 1)
        this.setState({
          showApartmentModal: true,
          apartmentList: response.suiteList,
        });
      else this.setState({apartment: ''});
      this.setState({
        address_not_verified: false,
        city,
        address_state: state,
        zip,
        address: street,
        fullAddressInternational: `${street}, ${city} ${state} ${zip}`,
        fullAddress: '',
        addressSuggestions: [],
      });
    }
  };

  render() {
    const {
      address,
      apartment,
      showApartmentModal,
      address_state,
      city,
      zip,
      manual_address_entry,
      showCountryModal,
      countrySlug,
      address_type,
      country,
      fullAddress,
      addressSuggestions,
      phone,
      gender,
    } = this.state;

    const {
      address_not_verified,
      email_error,
      address_error,
      city_error,
      state_error,
      phone_error,
      zip_error,
      gender_error,
      error_string,
      country_error,
    } = this.state;

    let addressField;
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
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h3 className="title">Personal Information</h3>
          <p className="titleSubheader">Step 3 of 6</p>
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.displayNone}>
            <CountryModal
              title={'Country'}
              isOpen={showCountryModal}
              items={COUNTRY_OPTIONS}
              selectedValue={countrySlug}
              modalHandler={() =>
                this.setState((state) => ({
                  showCountryModal: !state.showCountryModal,
                }))
              }
              onSelect={this.onCountrySelect}
            />
          </div>

          <div className={styles.displayNone}>
            <ScrollableListModal
              title={'Apartment Unit'}
              isOpen={showApartmentModal}
              items={this.state.apartmentList}
              selectedValue={this.state.apartment}
              modalHandler={() =>
                this.setState((state) => ({
                  showApartmentModal: !state.showApartmentModal,
                }))
              }
              onSelect={this.onApartmentSelect}
            />
          </div>

          <div className={styles.formContainer}>
            <RadioForm
              className={styles.radioForm}
              inline
              radioProps={address_type_radio_props}
              label={'Address Type'}
              name={'address_type'}
              error={''}
              value={address_type}
              onValueChange={(value) => {
                this.setState(
                  {
                    manual_address_entry: false,
                    address_type: value,
                    fullAddress: '',
                    addressSuggestions: [],
                  },
                  () => {
                    this.verifyAddress();
                  },
                );
              }}
            />

            <div>
              {!manual_address_entry ? (
                <>
                  {address_type === 'international' && (
                    <div
                      className={styles.clickable}
                      onClick={(e) => {
                        e.stopPropagation();
                        this.setState({showCountryModal: true});
                      }}>
                      <TextInput
                        label={''}
                        value={country ? country : 'COUNTRY'}
                        onValueChange={(text) => {}}
                        error={country_error}
                      />
                    </div>
                  )}
                  <TextInput
                    label={'ADDRESS'}
                    value={fullAddress}
                    error={address_error}
                    onValueChange={(text) => {
                      const {value} = text.target;
                      if (address_type !== 'domestic' && !country) return;
                      this.setState({fullAddress: value});
                      if (value.trim().length <= 3) {
                        this.setState({addressSuggestions: []});
                        return;
                      }
                      this.updateOptions(value);
                    }}
                  />
                  {address_not_verified && (
                    <p className={styles.errorMessage}>
                      {ADDRESS_VERIFICATION_ERROR}
                    </p>
                  )}
                  {fullAddress.length > 0 && (
                    <AddressesList
                      addressSuggestions={addressSuggestions}
                      onSelect={this.selectAddressHandler}
                    />
                  )}
                  <p>
                    Type the first few characters of you address in the box and
                    then select from the list of matching addresses, or{' '}
                    <span
                      className={`link ${styles.clickable}`}
                      onClick={() =>
                        this.setState({manual_address_entry: true})
                      }>
                      manually enter your address.
                    </span>
                  </p>
                </>
              ) : (
                <div>
                  {address_type === 'international' && (
                    <div
                      className={styles.clickable}
                      onClick={(e) => {
                        e.stopPropagation();
                        this.setState({showCountryModal: true});
                      }}>
                      <TextInput
                        label={''}
                        value={country ? country : 'COUNTRY'}
                        onValueChange={(text) => {}}
                      />
                    </div>
                  )}

                  <TextInput
                    label={'Address'}
                    value={address ? address : ''}
                    error={address_error}
                    onValueChange={(text) => {
                      this.setState({
                        address: text.target.value,
                      });
                    }}
                  />
                  <TextInput
                    label={apartment_string}
                    value={apartment ? apartment : ''}
                    error={null}
                    onValueChange={(text) => {
                      this.setState({
                        apartment: text.target.value,
                      });
                    }}
                  />
                  <TextInput
                    label={city_string}
                    value={city ? city : ''}
                    error={city_error}
                    onValueChange={(text) => {
                      this.setState({
                        city: text.target.value,
                      });
                    }}
                  />
                  <TextInput
                    label={state_string}
                    value={address_state ? address_state : ''}
                    error={state_error}
                    onValueChange={(text) => {
                      this.setState({
                        address_state: text.target.value,
                      });
                    }}
                  />
                  <TextInput
                    label={zip_string}
                    value={zip ? zip : ''}
                    error={zip_error}
                    onValueChange={(text) => {
                      this.setState({
                        zip: text.target.value,
                      });
                    }}
                  />
                </div>
              )}
              <div className={styles.autocompleteItems}>
                <h3>{address_string}: </h3>
                <p>{address}</p>
              </div>
              {(!isNullOrEmpty(apartment) || manual_address_entry) && (
                <div className={styles.autocompleteItems}>
                  <h3>{apartment_string}: </h3>
                  <p>{apartment}</p>
                </div>
              )}
              <div className={styles.autocompleteItems}>
                <h3>{city_string}: </h3>
                <p>{city}</p>
              </div>
              <div className={styles.autocompleteItems}>
                <h3>{state_string}: </h3>
                <p>{address_state}</p>
              </div>
              <div className={styles.autocompleteItems}>
                <h3>{zip_string}: </h3>
                <p>{zip}</p>
              </div>
            </div>
            <br />
            {manual_address_entry && (
              <span
                className={`link ${styles.clickable}`}
                onClick={() => this.setState({manual_address_entry: false})}>
                Use Auto Complete
              </span>
            )}

            <TextInput
              label={'Phone'}
              type={'tel'}
              value={phone || ''}
              error={phone_error}
              onValueChange={(text) => {
                this.setState({phone: text.target.value});
              }}
            />
            <RadioForm
              inline
              radioProps={gender_radio_props}
              label={'Gender'}
              name={'gender'}
              error={gender_error}
              value={gender}
              onValueChange={(value) => {
                this.setState({
                  gender: value,
                });
              }}
            />
          </div>
          <div className={styles.buttonContainer}>
            <RWBButton
              onClick={this.nextPressed}
              label={'Next'}
              buttonStyle={'primary'}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(RegisterPersonalInfo);
