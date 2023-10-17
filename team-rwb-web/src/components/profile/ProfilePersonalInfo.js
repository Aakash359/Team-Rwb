import React, {Component} from 'react';
import styles from './ProfilePersonalInfo.module.css';
import {
  Paper,
  Toolbar,
  IconButton,
  Typography,
  withStyles,
} from '@material-ui/core';
import ChevronBackIcon from '../svgs/ChevronBackIcon';
import TextInput from '../TextInput';
import RadioForm from '../RadioForm';
import {PERSONAL_INFO_PROPS} from '../../../../shared/constants/RadioProps';
import {userProfile} from '../../../../shared/models/UserProfile';
import {withRouter} from 'react-router-dom';
import {
  melissaVerify,
  error_codes,
  rwbApi,
  melissaFreeForm,
  melissaGlobalFreeForm,
  melissaCityState,
} from '../../../../shared/apis/api';
import {
  getRadioIndexForValue,
  isNullOrEmpty,
  isPhoneNumber,
  debounce,
  validURL,
} from '../../../../shared/utils/Helpers';
import {COUNTRY_OPTIONS} from '../../../../shared/constants/Countries';
import Loading from '../Loading';
import CountryModal from './CountryModal';
import AddressesList from './AddressesList';
import ScrollableListModal from './ScrollableListModal';
import {logUpdatePersonalInformation} from '../../../../shared/models/Analytics';

const {gender_radio_props, address_type_radio_props} = PERSONAL_INFO_PROPS;
const DEBOUNCE_MS = 500;

const useStyles = {
  root: {
    flexGrow: 1,
  },
  menuButton: {
    color: 'var(--white)',
  },
  title: {
    color: 'var(--white)',
    textTransform: 'capitalize',
    fontFamily: 'OpenSans-Bold',
    textAlign: 'center',
    // title should always center, regardless of length of siblings
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  toolbar: {
    position: 'relative',
    justifyContent: 'space-between',
    backgroundColor: 'var(--magenta)',
  },
  button: {
    color: 'white',
    textTransform: 'capitalize',
  },
  save: {
    color: 'var(--white)',
    textTransform: 'capitalize',
    fontWeight: 'bold',
  },
};

class ProfilePersonalInfo extends Component {
  constructor(props) {
    super(props);

    const userData = userProfile.getUserProfile();
    const {first_name, last_name, email, phone, gender} = userData;
    const {
      address_type,
      country,
      address,
      address_2,
      address_state,
      city,
      zip,
    } = userData.location;

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
      countrySlug: 'US',
      first_name,
      last_name,
      email,
      manual_address_entry: false,
      address_type,
      country,
      address,
      apartment: address_2,
      showApartmentModal: false,
      apartmentList: [],
      city,
      address_state,
      zip,
      phone,
      gender,
      fullAddress: '',
      addressSuggestions: [],
      first_name_error: '',
      last_name_error: '',
      email_error: '',
      phone_error: '',
      gender_error: '',
      isLoading: false,
      fullAddressInternational: '',
    };
  }

  clearErrorWarnings() {
    this.setState({
      address_error: '',
      phone_error: '',
      gender_error: '',
    });
  }

  verifyAddress(complete_callback) {
    const {
      address,
      apartment,
      city,
      address_state,
      zip,
      address_type,
      fullAddressInternational,
    } = this.state;
    var country = this.state.country;
    if (!country) {
      this.setState({country_error: 'Please select a country'});
    } else {
      this.setState({country_error: undefined});
    }
    country =
      address_type === 'domestic' ? 'United States' : this.state.country;
    const addressWithApartment = `${fullAddressInternational} ${apartment}`;
    if (!isNullOrEmpty(addressWithApartment) && country.length) {
      return melissaVerify(country, addressWithApartment).then((response) => {
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
  }

  savePressed() {
    if (
      this.state.address_type === 'international' &&
      !this.state.manual_address_entry
    ) {
      this.verifyAddress(() => {
        this.doSave();
      });
    } else {
      this.doSave();
    }
  }
  doSave() {
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
    logUpdatePersonalInformation();
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
  }

  updateUser(user_data) {
    this.setState({isLoading: true});

    let data = JSON.stringify(user_data);

    rwbApi
      .putUser(data)
      .then((response) => {
        this.setState({isLoading: false});
        this.props.history.goBack();
      })
      .catch((error) => {
        alert(
          'There was a problem updating your personal info. Please try again later.',
        );
        this.setState({isLoading: false});
      });
  }

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

  render() {
    const {classes, history} = this.props;

    const {
      email,
      address_type,
      country,
      gender,
      address,
      apartment,
      showApartmentModal,
      address_state,
      city,
      zip,
      phone,
      fullAddress,
      isLoading,
      addressSuggestions,
      countrySlug,
      showCountryModal,
    } = this.state;
    const {
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
      <div className={styles.container}>
        <Loading size={100} color={'var(--white)'} loading={isLoading} />
        <Paper className={classes.root}>
          <Toolbar className={classes.toolbar}>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              onClick={() => history.goBack()}>
              <ChevronBackIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Personal Information
            </Typography>
            <IconButton
              edge="end"
              className={classes.menuButton}
              color="inherit"
              onClick={() => this.savePressed()}>
              <Typography variant="h6" className={classes.save}>
                Save
              </Typography>
            </IconButton>
          </Toolbar>
        </Paper>

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

        <div className={styles.contentContainer}>
          <div className={styles.formContainer}>
            <TextInput
              label={'Email'}
              type={'email'}
              error={email_error}
              value={email || ''}
              onValueChange={(text) => {
                this.setState({
                  email: text.target.value,
                  needsToSave: true,
                });
              }}
            />
            <p>
              Please use a civilian or non-government email address. (Note:
              Eagle Leaders, please do not user you @teamrwb.org email address)
            </p>
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
                    needsToSave: true,
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
                      />
                    </div>
                  )}
                  <TextInput
                    label={'ADDRESS'}
                    value={fullAddress}
                    error={error_string}
                    onValueChange={(text) => {
                      const {value} = text.target;
                      this.setState({fullAddress: value});
                      value.trim().length > 3 && this.updateOptions(value);
                    }}
                  />
                  {fullAddress.length > 0 && (
                    <AddressesList
                      addressSuggestions={addressSuggestions}
                      onSelect={this.selectAddressHandler}
                      // onCurrentLocationSelect={
                      //   this.selectCurrentLocationHandler
                      // }
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
                        needsToSave: true,
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
                        needsToSave: false,
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
                        needsToSave: true,
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
                        needsToSave: true,
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
                        needsToSave: true,
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
                this.setState({phone: text.target.value, needsToSave: true});
              }}
            />
            <RadioForm
              radioProps={gender_radio_props}
              inline
              label={'Gender'}
              name={'gender'}
              error={gender_error}
              value={gender}
              onValueChange={(value) => {
                this.setState({
                  gender: value,
                  needsToSave: true,
                });
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(withStyles(useStyles)(ProfilePersonalInfo));
