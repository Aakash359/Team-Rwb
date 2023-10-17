import React, {Component} from 'react';
import RWBButton from '../RWBButton';
import ToggleSwitch from '../ToggleSwitch';
import TextInput from '../TextInput';
import styles from './Registration.module.css';
import RedShirtImage from '../../../../shared/images/RWBRedShirt.jpg';
import {REDSHIRT_PROPS} from '../../../../shared/constants/RadioProps';
import MenuButton from '../profile/MenuButton';
import {userProfile} from '../../../../shared/models/UserProfile';
import AddressesList from '../profile/AddressesList';
import RadioForm from '../RadioForm';
import {PERSONAL_INFO_PROPS} from '../../../../shared/constants/RadioProps';
import CountryModal from '../profile/CountryModal';
import {COUNTRY_OPTIONS} from '../../../../shared/constants/Countries';
import {
  melissaFreeForm,
  melissaGlobalFreeForm,
  melissaCityState,
  melissaVerify,
  error_codes,
  rwbApi,
} from '../../../../shared/apis/api';
import {
  debounce,
  isMilitaryAddress,
  isNullOrEmpty,
  validateEmail,
} from '../../../../shared/utils/Helpers';
import ShirtSizesModal from './ShirtSizesModal';
import moment from 'moment';
import {
  getPaymentIntent,
  confirmPaymentIntent,
  createPaymentMethod,
} from '../../../../shared/apis/stripe-api';
import {withRouter} from 'react-router-dom';
import {logPayForShirt} from '../../../../shared/models/Analytics';
import {INTERNATIONAL_ADDRESS_ERROR} from '../../../../shared/constants/ErrorMessages';
import ScrollableListModal from '../profile/ScrollableListModal';

const {address_type_radio_props} = PERSONAL_INFO_PROPS;
const {sizes_radio_props} = REDSHIRT_PROPS;
const DEBOUNCE_MS = 500;

class RegisterGetRedShirt extends Component {
  constructor(props) {
    super(props);

    const existingProfile = userProfile.getUserProfile();
    const partial_user = props.location.state?.value || null;

    this.state = {
      user_email: existingProfile.email,
      user_name: `${existingProfile.first_name} ${existingProfile.last_name}`,
      user_email_error: '',
      isDifferentShippingAddress: false,
      shirt_address_street: existingProfile.location.address,
      shirt_address_apartment: existingProfile.location.address_2 || '',
      shirt_address_city: existingProfile.location.city,
      shirt_address_state: existingProfile.location.address_state,
      shirt_address_zip: existingProfile.location.zip,
      shirt_size: null,
      shirt_size_error_text: '',
      alternate_shirt_address: false,
      manual_shirt_address: false,
      shirt_address_general_error_text: '',
      shirt_address_city_error_text: '',
      shirt_address_state_error_text: '',
      shirt_address_street_error_text: '',
      shirt_address_zip_error_text: '',
      payment_state: '', // state can be "authorizing" (payment started), "complete" (payment went through),
      // "invalid" (wrong input), and "declined" (something is wrong with the card). The "complete" state indicates the card payment went through
      card_number: '',
      card_number_error_text: '',
      card_expiration: '',
      card_expiration_error_text: '',
      card_cvv: '',
      card_cvv_error_text: '',
      card_zip:
        partial_user.location.country &&
        partial_user.location.country.toLowerCase() === 'united states'
          ? partial_user.location.zip.slice(0, 5)
          : partial_user.location.zip,
      card_zip_error_text: '',
      partial_user,
      fullAddress: '',
      country: partial_user.location.country,
      address_type: 'domestic',
      addressSuggestions: [],
      fullAddressInternational: '',
      address_error: '',
      country_error: '',
      manual_address_entry: false,
      showCountryModal: false,
      showShirtSizeModal: false,
      apartmentList: [],
    };

    this.user_id = ''; // RWB user id to be used for logging
    this.payment_intent_id = '';
    this.pagesLoaded = 0; // the url for stripe validation has multiple on changes before loading the page we want
    this.receiptEmail = ''; // the email that will be receiving the receipt
  }

  shirtSizeHandler = (value) => this.setState({shirt_size: value.label});

  switchShippingAddress = () => {
    const {isDifferentShippingAddress} = this.state;
    if (isDifferentShippingAddress) {
      const existingProfile = userProfile.getUserProfile();
      this.setState(
        {
          shirt_address_street: existingProfile.location.address,
          shirt_address_city: existingProfile.location.city,
          country: existingProfile.location.country,
          shirt_address_state: existingProfile.location.address_state,
          shirt_address_zip: existingProfile.location.zip,
          isDifferentShippingAddress: !isDifferentShippingAddress,
          alternate_shirt_address: false,
        },
        this.clearErrorWarnings,
      );
    } else {
      this.setState({
        isDifferentShippingAddress: !isDifferentShippingAddress,
        shirt_address_street: '',
        shirt_address_city: '',
        shirt_address_state: '',
        shirt_address_zip: '',
        alternate_shirt_address: true,
      });
    }
  };

  clearErrorWarnings = () => {
    this.setState({
      address_not_verified: true,
      shirt_address_general_error_text: '',
      shirt_address_city_error_text: '',
      shirt_address_state_error_text: '',
      shirt_address_street_error_text: '',
      shirt_address_zip_error_text: '',
      card_number_error_text: '',
      card_expiration_error_text: '',
      card_cvv_error_text: '',
      card_zip_error_text: '',
    });
  };

  verifyAddress = (complete_callback) => {
    const {
      shirt_address_street,
      shirt_address_city,
      shirt_address_state,
      shirt_address_zip,
      fullAddress,
      address_type,
    } = this.state;
    let {country} = this.state;
    if (!country?.length) {
      this.setState({country_error: 'Please select a country'});
    } else {
      this.setState({country_error: undefined});
    }
    if (address_type === 'domestic') {
      country = 'United States';
      this.setState({country});
    }
    if (fullAddress.length && country.length) {
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
            if (shirt_address_street != `${line1}${line2}`) {
              this.setState({shirt_address_street: `${line1} ${line2}`});
            }
            if (shirt_address_city != record['Locality']) {
              this.setState({shirt_address_city: record['Locality']});
            }
            if (shirt_address_state != record['AdministrativeArea']) {
              this.setState({
                shirt_address_state: record['AdministrativeArea'],
              });
            }
            if (shirt_address_zip != record['PostalCode']) {
              this.setState({shirt_address_zip: record['PostalCode']});
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
        shirt_address_apartment: item,
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
      if (response?.suiteList?.length > 1)
        this.setState({
          showApartmentModal: true,
          apartmentList: response.suiteList,
        });
      else this.setState({shirt_address_apartment: ''});
      this.setState({
        shirt_address_city: city,
        shirt_address_state: state,
        shirt_address_zip: zip,
        shirt_address_street: street,
        fullAddressInternational: fullAddress,
        fullAddress: '',
        addressSuggestions: [],
      });
    }
  };

  setCardNumber = (text) => {
    const {value} = text.target;
    if (!/^[\d\s]+$/.test(value) && value !== '') return;
    if (value.length <= 19) {
      let formattedText = value.split(' ').join('');
      if (formattedText.length > 0) {
        formattedText = formattedText
          .match(new RegExp('.{1,4}', 'g'))
          .join(' ');
        this.setState({card_number: formattedText});
      } else {
        this.setState({card_number: value});
      }
    }
  };

  setExpirationDate = (text) => {
    let {value} = text.target;
    if (!/^[\d\/]+$/.test(value) && value !== '') return;
    if (
      value.length >= 3 &&
      value.charAt(2) !== '/' &&
      value.length > this.state.card_expiration.length
    ) {
      value = this.insertCharBefore(value, 2, '/');
    }
    if (value.length >= 5) {
      value = value.substring(0, 5);
    }
    this.setState({card_expiration: value});
  };

  insertCharBefore = (text, split, char) => {
    return text.slice(0, split) + char + text.slice(split, text.length);
  };

  selectButtonType() {
    const {payment_state} = this.state;
    if (
      !payment_state ||
      payment_state === 'invalid' ||
      payment_state === 'declined'
    )
      return 'primary';
    else if (payment_state === 'authorizing') return 'secondary';
    else return 'tertiary';
  }

  displayPaymentStatus() {
    const {payment_state} = this.state;
    if (!payment_state) return 'PAY $5.00';
    else if (payment_state === 'invalid') return 'INVALID';
    else if (payment_state === 'declined') return 'DECLINED';
    else if (payment_state === 'authorizing') return 'AUTHORIZING';
    else return 'COMPLETE';
  }

  updateUser(value) {
    let payload = {
      //RedShirt -- only available to Vets, Guard, Reserve, or Active Duty users
      shirt_size: value.shirt_size,
      shipping_address: value.alternate_shirt_address,
    };

    if (value.alternate_shirt_address) {
      Object.assign(payload, {
        shipping_country: value.country,
        shipping_street: value.shipping_street,
        shipping_city: value.shipping_city,
        shipping_state: value.shipping_state,
        shipping_zip: value.shipping_zip,
      });
    }
    return rwbApi.putUser(JSON.stringify(payload));
  }

  // Note, we do not take the day, so we are assuming if it is the same month and year, it is still within the valid time restraints
  isExpiredCard = (expirationDate) => {
    const month = parseInt(expirationDate.split('/')[0]);
    const year = parseInt(expirationDate.split('/')[1]);
    const curDate = new Date();
    const curMonth = curDate.getMonth() + 1;
    const curYear = parseInt(curDate.getFullYear().toString().slice(-2));
    if (year < curYear) return true;
    else if (year === curYear) return month < curMonth;
    else return false;
  };

  clearWarnings() {
    this.setState({
      shirt_size_error_text: null,
      shirt_address_city_error_text: null,
      shirt_address_general_error_text: null,
      shirt_address_state_error_text: null,
      shirt_address_zip_error_text: null,
      shirt_address_street_error_text: null,
      user_email_error: null,
      card_number_error_text: null,
      card_expiration_error_text: null,
      card_cvv_error_text: null,
      card_zip_error_text: null,
    });
  }

  validateInput = () => {
    const {
      shirt_size,
      alternate_shirt_address,
      manual_shirt_address,
      shirt_address_city,
      shirt_address_street,
      shirt_address_state,
      shirt_address_zip,
      user_email,
      user_name,
      card_number,
      card_expiration,
      card_cvv,
      card_zip,
    } = this.state;
    const cardNumber = card_number.split(' ').join('');

    this.clearWarnings();
    let hasError = false;

    if (shirt_size === null) {
      this.setState({shirt_size_error_text: 'PLEASE SELECT A SHIRT SIZE'});
      hasError = true;
    }
    if (alternate_shirt_address && !manual_shirt_address) {
      if (
        !shirt_address_city ||
        !shirt_address_state ||
        !shirt_address_street ||
        !shirt_address_zip
      ) {
        this.setState({
          shirt_address_general_error_text: 'YOU MUST FILL OUT ALL FIELDS',
        });
        hasError = true;
      }
    } else if (alternate_shirt_address && manual_shirt_address) {
      if (!shirt_address_city) {
        this.setState({
          shirt_address_city_error_text: 'PLEASE ENTER YOUR CITY',
          shirt_address_general_error_text: 'YOU MUST FILL OUT ALL FIELDS',
        });
        hasError = true;
      }
      if (!shirt_address_street) {
        this.setState({
          shirt_address_street_error_text: 'PLEASE ENTER YOUR STREET ADDRESS',
          shirt_address_general_error_text: 'YOU MUST FILL OUT ALL FIELDS',
        });
        hasError = true;
      }
      if (!shirt_address_state) {
        this.setState({
          shirt_address_state_error_text: 'PLEASE ENTER YOUR STATE',
          shirt_address_general_error_text: 'YOU MUST FILL OUT ALL FIELDS',
        });
        hasError = true;
      }
      if (!shirt_address_city) {
        this.setState({
          shirt_address_zip_error_text: 'PLEASE ENTER YOUR ZIP CODE',
          shirt_address_general_error_text: 'YOU MUST FILL OUT ALL FIELDS',
        });
        hasError = true;
      }
    }
    if (isNullOrEmpty(user_name)) {
      this.setState({card_name_error_text: 'REQUIRED'});
      hasError = true;
    }
    if (isNullOrEmpty(user_email)) {
      this.setState({user_email_error: 'REQUIRED'});
      hasError = true;
    } else if (!validateEmail(user_email)) {
      this.setState({user_email_error: 'INVALID EMAIL ADDRESS'});
      hasError = true;
    }

    if (isNullOrEmpty(cardNumber)) {
      this.setState({card_number_error_text: 'REQUIRED'});
      hasError = true;
    } else if (cardNumber.length < 14 || cardNumber.length > 16) {
      this.setState({card_number_error_text: 'INVALID CARD NUMBER'});
      hasError = true;
    }
    if (isNullOrEmpty(card_expiration)) {
      this.setState({card_expiration_error_text: 'REQUIRED'});
      hasError = true;
    } else if (card_expiration.length !== 5) {
      this.setState({
        card_expiration_error_text: 'DATE FORMAT SHOULD BE MM/YY',
      });
      hasError = true;
    } else if (!moment(card_expiration, 'MM-YY').isValid()) {
      this.setState({card_expiration_error_text: 'INVALID EXP DATE'});
      hasError = true;
    } else if (this.isExpiredCard(card_expiration)) {
      this.setState({card_expiration_error_text: 'EXPIRED CREDIT CARD'});
      hasError = true;
    }
    if (isNullOrEmpty(card_cvv)) {
      this.setState({card_cvv_error_text: 'REQUIRED'});
      hasError = true;
    } else if (card_cvv.length < 3 || card_cvv.length > 4) {
      this.setState({card_cvv_error_text: 'INVALID CVV'});
      hasError = true;
    }
    if (isNullOrEmpty(card_zip)) {
      this.setState({card_zip_error_text: 'REQUIRED'});
      hasError = true;
    }
    if (hasError) {
      return;
    }
    this.uploadUserInfo();
  };

  // First a payment intent needs to be created
  // Retrieve the incomplete payment intent
  createPaymentIntent = () => {
    let payload = {
      product: 'red-shirt',
      size: this.state.shirt_size,
      receipt_email: this.state.user_email,
    };
    return rwbApi
      .putPaymentIntent(JSON.stringify(payload))
      .then((result) => {
        this.clientSecret = result.intent_information.client_secret;
        return result;
      })
      .catch((error) => {
        if (
          error.error.message ===
          'Parameter receipt_email contains an invalid email address'
        ) {
          this.setState({
            user_email_error: 'INVALID EMAIL ADDRESS',
            payment_state: '',
          });
        } else {
          alert('There was a problem contacting the server. Please try again.');
          this.setState({
            payment_state: '',
          });
        }
      });
  };

  updatePaymentIntent = (paymentRecord) => {
    const formBody = `payment_method=${paymentRecord.id}&client_secret=${this.clientSecret}`;
    return confirmPaymentIntent(formBody, this.payment_intent_id)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        this.updateErrorStateFromServer(error.error);
      });
  };

  makePaymentMethod = () => {
    const billing_details = this.formatBillingDetails();
    const {card_number, card_expiration, card_cvv} = this.state;
    const month = card_expiration.split('/')[0];
    const year = card_expiration.split('/')[1];
    const cardDetails = {
      'card[number]': card_number.split(' ').join(''),
      'card[exp_month]': month,
      'card[exp_year]': year,
      'card[cvc]': card_cvv,
    };
    let formBody = [];
    for (let property in cardDetails) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(cardDetails[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    return createPaymentMethod(formBody, billing_details)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        this.updateErrorStateFromServer(error.error);
      });
  };

  getCountrySlug(countryDisplay) {
    for (let property in COUNTRY_OPTIONS) {
      if (COUNTRY_OPTIONS[property].display === countryDisplay)
        return COUNTRY_OPTIONS[property].value;
    }
  }

  updateErrorStateFromServer(error) {
    if (error.code === 'incorrect_number' || error.code === 'invalid_number')
      this.setState({
        card_number_error_text: 'INVALID CARD NUMBER',
        payment_state: 'invalid',
      });
    if (error.code === 'incorrect_cvc')
      this.setState({
        card_cvv_error_text: 'INVALID CVV',
        payment_state: 'invalid',
      });
    if (error.code === 'invalid_cvc')
      this.setState({
        card_cvv_error_text: 'INVALID CVV',
        payment_state: 'declined',
      });
    if (
      error.code === 'invalid_expiry_month' ||
      error.code === 'invalid_expiry_year'
    )
      this.setState({
        card_expiration_error_text: 'INVALID EXP DATE',
        payment_state: 'invalid',
      });
    if (error.code === 'incorrect_zip')
      this.setState({
        card_zip_error_text: 'INCORRECT ZIP',
        payment_state: 'invalid',
      });
    if (error.code === 'card_declined')
      this.setState({
        card_number_error_text: 'CARD DECLINED',
        card_expiration_error_text: 'CARD DECLINED',
        card_cvv_error_text: 'CARD DECLINED',
        payment_state: 'declined',
      });
    if (error.code === 'expired_card')
      this.setState({
        card_number_error_text: 'CARD EXPIRED',
        card_expiration_error_text: 'CARD EXPIRED',
        card_cvv_error_text: 'CARD EXPIRED',
        payment_state: 'declined',
      });
    if (error.code === 'processing_error') {
      alert('Error', error.message);
      this.setState({payment_state: ''});
    }
    this.changeFromPaymentState();
  }

  // format billing_details for payment creation
  formatBillingDetails = () => {
    const {
      user_email,
      user_name,
      partial_user,
      alternate_shirt_address,
      shirt_address_street,
      shirt_address_apartment,
      shirt_address_city,
      shirt_address_state,
      shirt_address_zip,
      card_zip,
    } = this.state;
    const address = {
      'billing_details[address][city]':
        shirt_address_city || partial_user.location.city,
      'billing_details[address][country]': this.getCountrySlug(
        partial_user.location.country,
      ),
      'billing_details[address][line1]':
        shirt_address_street || partial_user.location.address,
      'billing_details[address][line2]':
        shirt_address_apartment || partial_user.location.apartment,
      'billing_details[address][postal_code]': card_zip,
      'billing_details[address][state]':
        shirt_address_state || partial_user.location.address_state,
    };
    const userInfo = {
      'billing_details[email]': user_email,
      'billing_details[name]': user_name,
      'billing_details[phone]': partial_user.phone || null,
    };
    let addressBody = [];
    for (let property in address) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(address[property]);
      addressBody.push(encodedKey + '=' + encodedValue);
    }
    let userBody = [];
    for (let property in userInfo) {
      let encodedKey = encodeURIComponent(property);
      let encodedValue = encodeURIComponent(userInfo[property]);
      userBody.push(encodedKey + '=' + encodedValue);
    }
    let fullBody = addressBody;
    fullBody = fullBody.concat(userBody);
    fullBody = fullBody.join('&');

    return fullBody;
  };

  createIntent = () => {
    const {
      country,
      shirt_address_city,
      shirt_address_street,
      shirt_address_state,
    } = this.state;
    if (
      this.getCountrySlug(country) !== 'US' &&
      !isMilitaryAddress(
        shirt_address_street,
        shirt_address_city,
        shirt_address_state,
      )
    ) {
      alert(`Team RWB: ${INTERNATIONAL_ADDRESS_ERROR}`);
      this.setState({payment_state: 'invalid'});
      this.changeFromPaymentState();
    } else {
      // Have the user update the payment intent they already made instead of creating a new one
      if (this.payment_intent_id === '') {
        this.createPaymentIntent().then((initialPI) => {
          if (initialPI) {
            this.payment_intent_id = initialPI.intent_information.id;
            this.user_id = initialPI.intent_information.metadata.user_id;
            this.makePayment();
          }
        });
      } else this.makePayment();
    }
  };

  makePayment = () => {
    this.makePaymentMethod().then((paymentRecord) => {
      if (paymentRecord) {
        this.updatePaymentIntent(paymentRecord)
          .then((updatedPI) => {
            if (!updatedPI.next_action) {
              this.setState({payment_state: 'complete'});
              this.storeConfirmationData(updatedPI);
              this.changeFromPaymentState();
            }
            // card requires stripe 3D auth
            else
              this.setState({
                validationURL: updatedPI.next_action.use_stripe_sdk.stripe_js,
              });
          })
          .catch((error) => {});
      }
    });
  };

  changeFromPaymentState = () => {
    const paymentState = this.state.payment_state;
    if (paymentState === 'invalid' || paymentState === 'declined') {
      setTimeout(() => {
        this.setState({payment_state: ''});
      }, 3000);
    } else if (paymentState === 'complete') {
      this.setState({paymentState: 'complete'});
      this.props.history.push({
        pathname: '/registration/order_confirmation',
        state: {receiptEmail: this.receiptEmail, from: 'Get Your Red Shirt!'},
      });
    }
  };

  uploadUserInfo() {
    this.setState({payment_state: 'authorizing'});
    const {
      shirt_size,
      alternate_shirt_address,
      country,
      shirt_address_street,
      shirt_address_apartment,
      shirt_address_city,
      shirt_address_state,
      shirt_address_zip,
    } = this.state;

    let value = this.state.partial_user || {};
    Object.assign(value, {
      shirt_size,
      alternate_shirt_address,
      country,
      shipping_street: shirt_address_street,
      shipping_street_2: shirt_address_apartment,
      shipping_city: shirt_address_city,
      shipping_state: shirt_address_state,
      shipping_zip: shirt_address_zip,
    });
    this.updateUser(value)
      .then((response) => {
        rwbApi.getUser().then((response) => {
          this.createIntent();
        });
      })
      .catch(() => {
        alert('There was a problem contacting the server. Please try again.');
        this.setState({payment_state: ''});
      });
  }

  handleWebView() {
    this.setState({validationURL: ''});
    const secret =
      encodeURI('client_secret') + '=' + encodeURIComponent(this.clientSecret);
    getPaymentIntent(this.payment_intent_id, secret).then((retrievedPI) => {
      if (
        !retrievedPI.last_payment_error &&
        retrievedPI.status !== 'requires_action'
      ) {
        this.setState({payment_state: 'complete'});
        this.storeConfirmationData(retrievedPI);
      } else if (
        retrievedPI.last_payment_error &&
        retrievedPI.last_payment_error.code === 'card_declined'
      )
        this.setState({
          card_number_error_text: 'CARD DECLINED',
          card_expiration_error_text: 'CARD DECLINED',
          card_cvv_error_text: 'CARD DECLINED',
          payment_state: 'declined',
        });
      else this.setState({payment_state: 'invalid'});
      this.changeFromPaymentState();
    });
  }

  storeConfirmationData = (paymentIntent) => {
    let analyticsObj = {};
    if (this.props.location.state && this.props.location.state.from)
      analyticsObj.previous_view = this.props.location.state.from;
    logPayForShirt(analyticsObj);
    this.receiptEmail = paymentIntent.receipt_email;
  };

  render() {
    const {
      shirt_size,
      shirt_size_error_text,
      user_email,
      user_email_error,
      isDifferentShippingAddress,
      shirt_address_city,
      shirt_address_state,
      shirt_address_street,
      shirt_address_zip,
      card_number,
      card_number_error_text,
      card_expiration,
      card_expiration_error_text,
      card_cvv,
      card_cvv_error_text,
      card_zip,
      card_zip_error_text,
      card_name_error_text,

      shirt_address_general_error_text,
      shirt_address_city_error_text,
      shirt_address_state_error_text,
      shirt_address_street_error_text,
      shirt_address_zip_error_text,

      country,
      fullAddress,
      shirt_address_apartment,
      address_type,
      addressSuggestions,
      fullAddressInternational,
      address_error,
      country_error,
      manual_address_entry,
      countrySlug,
      showCountryModal,
      showShirtSizeModal,
      user_name,
      payment_state,

      showApartmentModal,
    } = this.state;

    let addressField;
    let address_string = 'STREET';
    var apartment_string = 'APARTMENT';
    let state_string = 'STATE';
    let zip_string = 'ZIP';
    let city_string = 'CITY';
    if (address_type === 'international') {
      state_string = 'ADMINISTRATIVE AREA';
      zip_string = 'POSTAL CODE';
      city_string = 'LOCALITY';
      address_string = 'STREET';
    }

    return (
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <h3 className="title">Get your red shirt!</h3>
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
          {showShirtSizeModal && (
            <ShirtSizesModal
              isOpen={showShirtSizeModal}
              modalHandler={() => this.setState({showShirtSizeModal: false})}
            />
          )}
          <div className={styles.formContainer}>
            <div>
              <img
                className={styles.imageContainer}
                src={RedShirtImage}
                alt="TeamRWB Red Shirt"
              />
            </div>
            <div className={styles.pickerContainer}>
              <div className={styles.dropdownWrapper}>
                <MenuButton
                  label="Size"
                  data={sizes_radio_props}
                  userProp={shirt_size}
                  setMilitaryValue={this.shirtSizeHandler}
                />
                <p className={styles.errorMessage}>{shirt_size_error_text}</p>
              </div>
              <p
                className={`link ${styles.sizeChartBtn}`}
                onClick={() => this.setState({showShirtSizeModal: true})}>
                Size Chart
              </p>
            </div>
            <p className="formLabel">Shipping Address</p>
            <ToggleSwitch
              desc={
                'Please ship my shirt to an address that is different than my mailing address'
              }
              value={isDifferentShippingAddress}
              onChange={() => this.switchShippingAddress()}
            />

            {/* put address autocomplete in case of different shipping address */}
            {isDifferentShippingAddress && (
              <>
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
                    {fullAddress.length > 0 && (
                      <AddressesList
                        addressSuggestions={addressSuggestions}
                        onSelect={this.selectAddressHandler}
                      />
                    )}
                    <p>
                      Type the first few characters of you address in the box
                      and then select from the list of matching addresses, or{' '}
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
                      label={address_string}
                      value={shirt_address_street ? shirt_address_street : ''}
                      error={shirt_address_street_error_text}
                      onValueChange={(text) => {
                        this.setState({
                          shirt_address_street: text.target.value,
                        });
                      }}
                    />
                    <TextInput
                      label={apartment_string}
                      value={
                        shirt_address_apartment ? shirt_address_apartment : ''
                      }
                      error={null}
                      onValueChange={(text) => {
                        this.setState({
                          shirt_address_apartment: text.target.value,
                          needsToSave: false,
                        });
                      }}
                    />
                    <TextInput
                      label={city_string}
                      value={shirt_address_city ? shirt_address_city : ''}
                      error={shirt_address_city_error_text}
                      onValueChange={(text) => {
                        this.setState({
                          shirt_address_city: text.target.value,
                        });
                      }}
                    />
                    <TextInput
                      label={state_string}
                      value={shirt_address_state ? shirt_address_state : ''}
                      error={shirt_address_state_error_text}
                      onValueChange={(text) => {
                        this.setState({
                          shirt_address_state: text.target.value,
                        });
                      }}
                    />
                    <TextInput
                      label={zip_string}
                      value={shirt_address_zip ? shirt_address_zip : ''}
                      error={shirt_address_zip_error_text}
                      onValueChange={(text) => {
                        this.setState({
                          shirt_address_zip: text.target.value,
                        });
                      }}
                    />
                    <p className={styles.errorMessage}>
                      {shirt_address_general_error_text}
                    </p>
                  </div>
                )}
              </>
            )}
            <div>
              <div className={styles.autocompleteItems}>
                <h3>{address_string}: </h3>
                <p>{shirt_address_street}</p>
              </div>
              {(!isNullOrEmpty(shirt_address_apartment) ||
                manual_address_entry) && (
                <div className={styles.autocompleteItems}>
                  <h3>{apartment_string}: </h3>
                  <p>{shirt_address_apartment}</p>
                </div>
              )}
              <div className={styles.autocompleteItems}>
                <h3>{city_string}: </h3>
                <p>{shirt_address_city}</p>
              </div>
              <div className={styles.autocompleteItems}>
                <h3>{state_string}: </h3>
                <p>{shirt_address_state}</p>
              </div>
              <div className={styles.autocompleteItems}>
                <h3>{zip_string}: </h3>
                <p>{shirt_address_zip}</p>
              </div>
            </div>
            {isDifferentShippingAddress && manual_address_entry && (
              <span
                className={`link ${styles.clickable}`}
                onClick={() => this.setState({manual_address_entry: false})}>
                Use Auto Complete
              </span>
            )}

            <div className={styles.paymentForm}>
              <TextInput
                label={'Email'}
                value={user_email}
                onValueChange={(e) =>
                  this.setState({user_email: e.target.value})
                }
                error={user_email_error}
              />
              <TextInput
                label={'Name On Card'}
                error={card_name_error_text}
                value={user_name}
                onValueChange={(e) =>
                  this.setState({user_name: e.target.value})
                }
              />
              <TextInput
                label={'Card Number'}
                error={card_number_error_text}
                value={card_number}
                onValueChange={this.setCardNumber}
              />
              <div className={styles.paymentFormColumn}>
                <TextInput
                  label={'EXP Date (MM/YY)'}
                  error={card_expiration_error_text}
                  value={card_expiration}
                  onValueChange={(text) => this.setExpirationDate(text)}
                />
              </div>
              <div className={styles.paymentFormColumn}>
                <TextInput
                  label={'CVV'}
                  error={card_cvv_error_text}
                  value={card_cvv}
                  onValueChange={(text) => {
                    const {value} = text.target;
                    value.length <= 4 && this.setState({card_cvv: value});
                  }}
                />
              </div>
              <TextInput
                label={'ZIP'}
                error={card_zip_error_text}
                value={card_zip}
                onValueChange={(text) => {
                  this.setState({
                    card_zip: text.target.value,
                  });
                }}
              />
            </div>
          </div>
          <div className={styles.buttonContainer}>
            <RWBButton
              buttonStyle={this.selectButtonType()}
              disabled={this.state.payment_state !== ''}
              label={this.displayPaymentStatus()}
              onClick={this.validateInput}
            />
            <RWBButton
              link={true}
              to={'/feed'}
              label={'Cancel'}
              buttonStyle={
                payment_state === '' ? 'secondary' : 'primaryDisabled'
              }
              disabled={payment_state !== ''}
            />
          </div>
        </div>

        <div className={styles.displayNone}>
          <ScrollableListModal
            title={'Apartment Unit'}
            isOpen={showApartmentModal}
            items={this.state.apartmentList}
            selectedValue={this.state.shirt_address_apartment}
            modalHandler={() =>
              this.setState((state) => ({
                showApartmentModal: !state.showApartmentModal,
              }))
            }
            onSelect={this.onApartmentSelect}
          />
        </div>
      </div>
    );
  }
}

export default withRouter(RegisterGetRedShirt);
