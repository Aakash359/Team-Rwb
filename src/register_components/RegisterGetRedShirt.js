import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import {WebView} from 'react-native-webview';
import RWBButton from '../design_components/RWBButton';
import RWBTextField from '../design_components/RWBTextField';
import {rwbApi} from '../../shared/apis/api';
import {logPayForShirt} from '../../shared/models/Analytics';
import {NavigationEvents} from 'react-navigation';
import KeyboardAvoidScrollview from '../design_components/KeyboardAvoidScrollview';
import moment from 'moment';
import {userProfile} from '../../shared/models/UserProfile';
import {COUNTRY_OPTIONS} from '../../shared/constants/Countries';
import {
  isMilitaryAddress,
  isNullOrEmpty,
  validateEmail,
} from '../../shared/utils/Helpers';
import {
  getPaymentIntent,
  confirmPaymentIntent,
  createPaymentMethod,
} from '../../shared/apis/stripe-api';
import LinedRadioForm from '../design_components/LinedRadioForm';
import {PERSONAL_INFO_PROPS} from '../../shared/constants/RadioProps';
import {melissaVerify, error_codes} from '../../shared/apis/api';
import CountrySelect from '../design_components/CountrySelect';
import SelectableScrollList from '../design_components/SelectableScrollList';
import AutoCompleteMelissa from '../autocomplete_components/AutoCompleteMelissa';
import {INTERNATIONAL_ADDRESS_ERROR} from '../../shared/constants/ErrorMessages';

// SVGs
import ChevronDownIcon from '../../svgs/ChevronDownIcon';
import XIcon from '../../svgs/XIcon';

import globalStyles, {RWBColors} from '../styles';

const {address_type_radio_props} = PERSONAL_INFO_PROPS;

export default class RegisterGetRedShirtView extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
      headerTitle: () => (
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Get your red shirt!</Text>
        </View>
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
    const complete_user = userProfile.getUserProfile();
    const partial_user = this.props.navigation.getParam('value', null);
    this.state = {
      shirt_size: null,
      shirt_size_error_text: '',
      alternate_shirt_address: false,
      manual_shirt_address: false,
      shirt_address_general_error_text: '',
      shirt_address_city: '',
      shirt_address_city_error_text: '',
      shirt_address_state: '',
      shirt_address_state_error_text: '',
      shirt_address_street: '',
      shirt_address_street_error_text: '',
      shirt_address_apartment: '',
      shirt_address_zip: '',
      shirt_address_zip_error_text: '',
      shipping_country: partial_user?.location?.country,
      shirt_address_country_error_text: '',
      server_error_text: '',
      partial_user,
      fullAddress: '',
      showCountryModal: false,
      address_type: partial_user?.location?.address_type,
      user_email: complete_user.email,
      user_name: `${complete_user.first_name} ${complete_user.last_name}`,

      payment_state: '', // state can be "authorizing" (payment started), "complete" (payment went through),
      // "invalid" (wrong input), and "declined" (something is wrong with the card). The "complete" state indicates the card payment went through
      card_number: '',
      card_number_error_text: '',
      card_expiration: '',
      card_expiration_error_text: '',
      card_cvv: '',
      card_cvv_error_text: '',
      card_zip:
        partial_user?.location?.country &&
        partial_user?.location?.country.toLowerCase() === 'united states'
          ? partial_user.location.zip.slice(0, 5)
          : partial_user.location.zip,
      card_zip_error_text: '',
      validationURL: '',

      showMelissaModal: false,
      showApartmentModal: false,
      apartmentList: [],
    };

    this.user_id = ''; // RWB user id to be used for logging
    this.payment_intent_id = '';
    this.pagesLoaded = 0; // the url for stripe validation has multiple on changes before loading the page we want
    this.receiptEmail = ''; // the email that will be receiving the receipt
  }

  onCountrySelect = (item) => {
    this.setState(
      {
        country_error: undefined,
        showCountryModal: false,
        countrySlug: item,
        shipping_country: COUNTRY_OPTIONS[item].display,
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
    this.setState(
      {showApartmentModal: false, shirt_address_apartment: item},
      () => this.verifyAddress(),
    );
  };

  verifyAddress(complete_callback) {
    const {
      shirt_address_street,
      shirt_address_city,
      shirt_address_state,
      shirt_address_zip,
    } = this.state;
    let {fullAddress} = this.state;
    let country = this.state.shipping_country;
    if (!country.length) {
      this.setState({shirt_country_error: 'Please select a country'});
    } else {
      this.setState({shirt_country_error: undefined});
    }
    if (this.state.address_type === 'domestic') {
      country = 'United States';
      this.setState({shipping_country: country});
    }
    if (fullAddress.length && country.length) {
      fullAddress.includes('REPLACEME')
        ? (fullAddress = fullAddress.replace(
            'REPLACEME',
            this.state.shirt_address_apartment,
          ))
        : null;
      return melissaVerify(country, fullAddress).then((response) => {
        let error_string = '';
        if (response.length !== 1) {
          this.setState({address_not_verified: true});
        } else {
          let record = response[0];
          let results = record['Results'];
          results = results.split(',');
          let verified = false;
          let error = false;
          let error_string = '';

          for (let result of results) {
            if (result.startsWith('AV')) {
              result = result.replace('AV', '');
              let level = parseInt(result);
              if (level >= 12) verified = true;
            }
            if (result.startsWith('AE')) {
              let error_code = result.substring(0, 4);
              error = true;
              error_string = error_codes[error_code];
            }
          }
          if (verified && !error) {
            this.setState({address_not_verified: false, error_string: ''});
            let line1 = record['AddressLine1'];
            let line2 = record['AddressLine2'];
            if (line1.includes(this.state.shirt_address_apartment))
              line1 = line1.replace(this.state.shirt_address_apartment, '');
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
  }

  handleDidFocus = ({state: {params: {value} = {}}}) => {
    if (value === undefined) return;
    const {city, state, zip, address, fullAddress} = value;
    if (fullAddress) {
      this.setState(
        Object.assign(
          {},
          city ? {shirt_address_city: city} : {},
          state ? {shirt_address_state: state} : {},
          zip ? {shirt_address_zip: zip} : {},
          address
            ? {shirt_address_street: address, address_error: ''}
            : {address_error: 'REQUIRED'},
          fullAddress,
        ),
      );
    }
  };

  updateUser = (value) => {
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
  };

  insertCharBefore = (text, split, char) => {
    return text.slice(0, split) + char + text.slice(split, text.length);
  };

  displayPaymentStatus() {
    const {payment_state} = this.state;
    if (!payment_state) return 'PAY $5.00';
    else if (payment_state === 'invalid') return 'INVALID';
    else if (payment_state === 'declined') return 'DECLINED';
    else if (payment_state === 'authorizing') return 'AUTHORIZING';
    else return 'COMPLETE';
  }

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

  displayCardNumber(text) {
    let formattedText = text.split(' ').join('');
    if (formattedText.length > 0) {
      formattedText = formattedText.match(new RegExp('.{1,4}', 'g')).join(' ');
    }
    return formattedText;
  }

  setCardNumber = (text) => {
    if (text.length <= 19)
      this.setState({card_number: text.replace(/\s/g, '')});
  };

  setExpirationDate = (text) => {
    if (
      text.length >= 3 &&
      text.charAt(2) !== '/' &&
      text.length > this.state.card_expiration.length
    ) {
      text = this.insertCharBefore(text, 2, '/');
    }
    if (text.length >= 5) {
      text = text.substring(0, 5);
    }
    return text;
  };

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
      email_error_text: null,
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
      this.setState({email_error_text: 'REQUIRED'});
      hasError = true;
    } else if (!validateEmail(user_email)) {
      this.setState({email_error_text: 'INVALID EMAIL ADDRESS'});
      hasError = true;
    }

    if (isNullOrEmpty(card_number)) {
      this.setState({card_number_error_text: 'REQUIRED'});
      hasError = true;
    } else if (card_number.length < 14 || card_number.length > 16) {
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
    // else if (card_zip.length !== 5) {
    //   this.setState({ card_zip_error_text: 'INVALID ZIP' });
    //   hasError = true;
    // }
    if (
      hasError ||
      (this.state.address_not_verified && !this.state.manual_address_entry)
    ) {
      this.scrollView.scrollTo({y: 0});
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
            email_error_text: 'INVALID EMAIL ADDRESS',
            payment_state: '',
          });
        } else {
          Alert.alert(
            'Error',
            'There was a problem contacting the server. Please try again.',
          );
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
    const {card_number, card_expiration, card_cvv} = this.state;
    const month = card_expiration.split('/')[0];
    const year = card_expiration.split('/')[1];
    const cardDetails = {
      'card[number]': card_number,
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
    const billing_details = this.formatBillingDetails();
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
      Alert.alert('Error', error.message);
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
        shirt_address_apartment || partial_user.location.apartment || '',
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
      shipping_country,
      shirt_address_city,
      shirt_address_state,
      shirt_address_street,
    } = this.state;
    if (
      this.getCountrySlug(shipping_country) !== 'US' &&
      !isMilitaryAddress(
        shirt_address_street,
        shirt_address_city,
        shirt_address_state,
      )
    ) {
      Alert.alert('Team RWB', INTERNATIONAL_ADDRESS_ERROR);
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

  onAddressPress = () => {
    const {shipping_country, address_type} = this.state;
    if (address_type === 'international' && !shipping_country) {
      Alert.alert('Team RWB', 'You must select a country first.');
      return;
    } else {
      this.setState({showMelissaModal: true});
    }
  };

  handleMelissaResponse = (response) => {
    if (response) {
      // empty suite lists have empty strings as the first index
      if (response?.suiteList?.length > 1)
        this.setState({
          showApartmentModal: true,
          apartmentList: response.suiteList,
        });
      else this.setState({shirt_address_apartment: ''});
      const {city, state, zip, street, suiteName} = response;
      // apartment/unit/suite number has not yet been selected but is needed to be verified
      const fullAddress = suiteName
        ? `${street} REPLACEME, ${city} ${state} ${zip}`
        : `${street}, ${city} ${state} ${zip}`;
      this.setState(
        Object.assign(
          {},
          {showMelissaModal: false},
          city ? {shirt_address_city: city} : {},
          state ? {shirt_address_state: state} : {},
          zip ? {shirt_address_zip: zip} : {},
          street
            ? {
                shirt_address_street: street,
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
      this.props.navigation.navigate('OrderConfirmation', {
        receiptEmail: this.receiptEmail,
        from: 'Get Your Red Shirt!'
      });
    }
  };

  uploadUserInfo = () => {
    this.setState({payment_state: 'authorizing'});

    const {
      shirt_size,
      alternate_shirt_address,
      shirt_address_street,
      shirt_address_apartment,
      shirt_address_city,
      shirt_address_state,
      shirt_address_zip,
      shipping_country,
    } = this.state;

    let value = this.state.partial_user;
    Object.assign(value, {
      shirt_size,
      alternate_shirt_address,
      shipping_country: shipping_country, //should always be United States since international shipping is not supported
      shipping_street: shirt_address_street,
      // shipping_street_2: shirt_address_apartment, // not available backend
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
        Alert.alert(
          'Error',
          'There was a problem contacting the server. Please try again.',
        );
        this.setState({payment_state: ''});
      });
  };

  onShirtSizePickerDismiss(selectedShirtSize) {
    this.setState({shirt_size: selectedShirtSize});
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
    if (
      this.props.navigation.state.params &&
      this.props.navigation.state.params.from
    )
      analyticsObj.previous_view = this.props.navigation.state.params.from;
    logPayForShirt(analyticsObj);
    this.receiptEmail = paymentIntent.receipt_email;
  };

  render() {
    const {
      shirt_address_city,
      shirt_address_state,
      shirt_address_street,
      shirt_address_apartment,
      shirt_address_zip,
      partial_user,
      alternate_shirt_address,
      manual_shirt_address,
      user_email,
      user_name,
      card_number,
      card_expiration,
      card_cvv,
      card_zip,
      shirt_size,
      email_error_text,
      alternate_shirt_address_text,
      shirt_address_city_error_text,
      shirt_address_state_error_text,
      shirt_address_general_error_text,
      shirt_address_street_error_text,
      shirt_address_zip_error_text,
      shirt_size_error_text,
      card_number_error_text,
      card_cvv_error_text,
      card_expiration_error_text,
      card_zip_error_text,
      card_name_error_text,
      shipping_country,
      country_error,
    } = this.state;

    let address_string = 'Street';
    let state_string = 'State';
    let zip_string = 'Zip';
    let city_string = 'City';
    let apartment_string = 'Apartment';

    if (
      this.state.address_type === 'international' &&
      shipping_country.toLowerCase() !== 'united states'
    ) {
      address_string = 'Street';
      state_string = 'Administrative Area';
      zip_string = 'Postal Code';
      city_string = 'Locality';
    }
    const shipping_address = alternate_shirt_address
      ? `${city_string}: ${shirt_address_city}\n${state_string}: ${shirt_address_state}\n${address_string}: ${shirt_address_street}${
          !isNullOrEmpty(shirt_address_apartment)
            ? `\n${apartment_string}: ${shirt_address_apartment}`
            : ''
        }\n${zip_string}: ${shirt_address_zip}\nCountry: ${shipping_country}`
      : `${city_string}: ${partial_user.location.city}\n${state_string}: ${
          partial_user.location.address_state
        }\n${address_string}: ${partial_user.location.address}${
          !isNullOrEmpty(partial_user.location.apartment)
            ? `\n${apartment_string}: ${partial_user.location.apartment}`
            : ''
        }\n${zip_string}: ${partial_user.location.zip}\nCountry: ${
          partial_user.location.country || shipping_country
        }`;

    const shirt_address_general_error = alternate_shirt_address_text !== '';

    return (
      <SafeAreaView
        style={{
          width: '100%',
          height: 'auto',
          flex: 1,
          backgroundColor: RWBColors.white,
        }}>
        <StatusBar
          barStyle="light-content"
          animated={true}
          translucent={false}
          backgroundColor="#bf0d3e"
        />
        <ScrollView
          style={{flex: 1}}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          ref={(ref) => (this.scrollView = ref)}>
          <View style={styles.formWrapper}>
            <Image
              source={require('../../shared/images/RWBRedShirt.jpg')}
              style={{
                width: 200,
                height: 200,
                margin: 25,
                alignSelf: 'center',
                left: -16,
              }}
            />

            <View style={globalStyles.formBlock}>
              <Text style={globalStyles.formLabel}>SIZE</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                  style={[styles.dropdownButton, {flex: 2, marginBottom: 5}]}
                  onPress={() => {
                    this.props.navigation.navigate('RedShirtSizeModal', {
                      onShirtSizePickerDismiss: (selectedShirtSize) =>
                        this.onShirtSizePickerDismiss(selectedShirtSize),
                    });
                  }}>
                  <Text style={globalStyles.bodyCopyForm}>
                    {shirt_size ? shirt_size : 'Select One'}
                  </Text>
                  <ChevronDownIcon
                    style={styles.iconView}
                    tintColor="#BF0D3E"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{flex: 1}}
                  onPress={() => {
                    this.props.navigation.navigate('RedshirtSizeChart');
                  }}>
                  <Text
                    style={[globalStyles.link, {flex: 1, textAlign: 'center'}]}>
                    Size Chart
                  </Text>
                </TouchableOpacity>
              </View>

              {shirt_size_error_text ? (
                <Text style={globalStyles.errorMessage}>
                  {' '}
                  {shirt_size_error_text}{' '}
                </Text>
              ) : null}
              {shirt_size_error_text ? (
                <View style={globalStyles.errorBar} />
              ) : null}
            </View>

            <Text style={globalStyles.formLabel}>SHIPPING ADDRESS</Text>
            <View style={styles.switchView}>
              <Switch
                value={alternate_shirt_address}
                onValueChange={(value) => {
                  this.setState({alternate_shirt_address: value});
                }}
              />
              <Text style={[globalStyles.bodyCopyForm, styles.switchLabel]}>
                Please ship my shirt to an address that is different than my
                mailing address.
              </Text>
            </View>
            {alternate_shirt_address ? (
              <View>
                <Text style={globalStyles.radioFormLabel}>ADDRESS TYPE</Text>
                <LinedRadioForm
                  radio_props={address_type_radio_props}
                  initial={this.state.address_type === 'domestic' ? 0 : 1}
                  value={this.state.address_type}
                  onPress={(value, index) => {
                    this.setState(
                      {
                        manual_address_entry: false,
                        address_type: value,
                        shipping_country: '',
                      },
                      () => {
                        this.verifyAddress();
                      },
                    );
                  }}
                />
              </View>
            ) : null}

            {this.state.address_type === 'international' ? (
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
                      {shipping_country || 'COUNTRY'}
                    </Text>
                    {country_error ? (
                      <Text style={globalStyles.errorMessage}>
                        {country_error}
                      </Text>
                    ) : null}
                  </View>
                  {country_error ? (
                    <View style={globalStyles.errorBar} />
                  ) : null}
                </TouchableOpacity>
              </View>
            ) : null}

            {alternate_shirt_address && !manual_shirt_address ? (
              this.state.address_type === 'international' ? (
                // international address
                <View>
                  <TouchableOpacity
                    style={{marginTop: 25}}
                    onPress={this.onAddressPress}>
                    <View style={globalStyles.autoAddressBar}>
                      <Text style={globalStyles.autoAddressBarText}>
                        ADDRESS
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <Text style={[globalStyles.bodyCopy, {marginTop: 10}]}>
                    Enter an address, or
                    <Text
                      style={globalStyles.link}
                      onPress={() =>
                        this.setState({manual_shirt_address: true})
                      }>
                      {' '}
                      manually enter your address.
                    </Text>
                  </Text>
                </View>
              ) : (
                // domestic address
                <View>
                  <NavigationEvents onDidFocus={this.handleDidFocus} />
                  <TouchableOpacity
                    style={{marginTop: 25}}
                    onPress={this.onAddressPress}>
                    <View style={styles.autoAddressBar}>
                      <Text style={styles.autoAddressBarText}>ADDRESS</Text>
                    </View>
                  </TouchableOpacity>
                  {shirt_address_general_error_text ? (
                    <Text style={[globalStyles.errorMessage, {marginTop: 8}]}>
                      {shirt_address_general_error_text}
                    </Text>
                  ) : null}
                  {shirt_address_general_error_text ? (
                    <View style={globalStyles.errorBar} />
                  ) : null}
                  <View>
                    <Text style={[globalStyles.bodyCopy, {marginTop: 10}]}>
                      Type the first few characters of your address in the box
                      and then select from the list of matching addresses, or
                      <Text
                        style={globalStyles.link}
                        onPress={() => {
                          this.setState({manual_shirt_address: true});
                        }}>
                        {' '}
                        manually enter your address.
                      </Text>
                    </Text>
                    {this.state.address_not_verified ? (
                      <Text
                        style={[
                          globalStyles.link,
                          {textDecorationLine: 'none', marginTop: 10},
                        ]}>
                        Could not verify address. Please confirm everything is
                        correct in manual entry before continuing.
                      </Text>
                    ) : null}
                  </View>
                </View>
              )
            ) : null}
            {/* manual entry (handles domestic and international) */}
            {alternate_shirt_address && manual_shirt_address ? (
              <View style={globalStyles.formBlock}>
                <RWBTextField
                  label={address_string}
                  error={shirt_address_street_error_text}
                  onChangeText={(text) => {
                    this.setState({shirt_address_street: text});
                  }}
                  refProp={(input) => {
                    this.shirtStreetInput = input;
                  }}
                  onSubmitEditing={() => this.shirtCityInput.focus()}
                  returnKeyType="next"
                />
                <RWBTextField
                  label={apartment_string}
                  error={null}
                  onChangeText={(text) => {
                    this.setState({shirt_address_apartment: text});
                  }}
                  refProp={(input) => {
                    this.shirtApartmentInput = input;
                  }}
                  onSubmitEditing={() => this.shirtCityInput.focus()}
                  returnKeyType="next"
                />

                <RWBTextField
                  label={city_string}
                  error={shirt_address_city_error_text}
                  onChangeText={(text) => {
                    this.setState({shirt_address_city: text});
                  }}
                  refProp={(input) => {
                    this.shirtCityInput = input;
                  }}
                  onSubmitEditing={() => this.shirtStateInput.focus()}
                  returnKeyType="next"
                />
                <RWBTextField
                  label={state_string}
                  error={shirt_address_state_error_text}
                  onChangeText={(text) => {
                    this.setState({shirt_address_state: text});
                  }}
                  refProp={(input) => {
                    this.shirtStateInput = input;
                  }}
                  onSubmitEditing={() => this.shirtZipInput.focus()}
                  returnKeyType="next"
                />
                <RWBTextField
                  label={zip_string}
                  error={shirt_address_zip_error_text}
                  keyboardType="phone-pad"
                  onChangeText={(text) => {
                    this.setState({shirt_address_zip: text});
                  }}
                  refProp={(input) => {
                    this.shirtZipInput = input;
                  }}
                  returnKeyType="done"
                />
                <View>
                  <Text
                    style={[globalStyles.link, {marginTop: 10}]}
                    onPress={() => {
                      this.setState({manual_shirt_address: false});
                    }}>
                    Use Auto Complete
                  </Text>
                </View>
              </View>
            ) : null}

            {shirt_address_general_error && manual_shirt_address ? (
              <Text style={globalStyles.errorMessage}>
                {shirt_address_general_error_text}
              </Text>
            ) : null}

            <Text style={globalStyles.bodyCopy}>{shipping_address}</Text>

            {/* Stripe/Credit Card Input */}
            <View>
              <RWBTextField
                label="EMAIL"
                value={user_email}
                error={email_error_text}
                onChangeText={(text) => {
                  this.setState({user_email: text});
                }}
                returnKeyType="next"
              />
              <RWBTextField
                label="NAME ON CARD"
                value={user_name}
                error={card_name_error_text}
                onChangeText={(text) => {
                  this.setState({user_name: text});
                }}
                returnKeyType="next"
              />
              <RWBTextField
                label="CARD NUMBER"
                formatText={(card_number) =>
                  this.displayCardNumber(card_number)
                }
                error={card_number_error_text}
                onChangeText={(text) => this.setCardNumber(text)}
                keyboardType="phone-pad"
                returnKeyType="done"
              />
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{flex: 0.45}}>
                  <RWBTextField
                    label="EXP DATE (MM/YY)"
                    error={card_expiration_error_text}
                    onChangeText={(text) =>
                      this.setState({card_expiration: text})
                    }
                    formatText={(text) => this.setExpirationDate(text)}
                    keyboardType="phone-pad"
                    returnKeyType="done"
                  />
                </View>
                <View style={{flex: 0.45}}>
                  <RWBTextField
                    label="CVV"
                    value={card_cvv}
                    keyboardType="phone-pad"
                    returnKeyType="done"
                    error={card_cvv_error_text}
                    onChangeText={(text) => {
                      text.length <= 4 ? this.setState({card_cvv: text}) : null;
                    }}
                  />
                </View>
              </View>
              <RWBTextField
                label="ZIP"
                value={card_zip}
                error={card_zip_error_text}
                onChangeText={(text) => {
                  this.setState({
                    card_zip: text,
                  });
                }}
                keyboardType="phone-pad"
                returnKeyType="done"
              />
            </View>

            <View style={globalStyles.centerButtonWrapper}>
              <RWBButton
                buttonStyle={this.selectButtonType()}
                disabled={this.state.payment_state !== ''}
                text={this.displayPaymentStatus()}
                onPress={this.validateInput}
              />
              <RWBButton
                buttonStyle={
                  this.state.payment_state === '' ? 'secondary' : 'disabled'
                }
                disabled={this.state.payment_state !== ''}
                text="Cancel"
                onPress={() => this.props.navigation.goBack()}
              />
            </View>
          </View>

          <Modal
            visible={this.state.validationURL !== ''}
            style={{width: '100%', height: '100%'}}>
            <TouchableOpacity
              onPress={() => this.handleWebView()}
              style={{
                position: 'absolute',
                top: 40,
                right: 20,
                height: 50,
                width: 50,
                zIndex: 999,
              }}>
              <XIcon style={{width: 40, height: 40}} tintColor="#FFF" />
            </TouchableOpacity>
            <WebView
              source={{uri: this.state.validationURL}}
              style={{height: '100%', width: '100%'}}
            />
          </Modal>

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
                country: this.state.shipping_country,
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
                this.setState({
                  showApartmentModal: false,
                  shirt_address_apartment: '',
                })
              }
            />
          </Modal>

          <KeyboardAvoidScrollview />
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  formWrapper: {
    flex: 1,
    width: '90%',
    height: 'auto',
    marginTop: 15,
  },
  redShirtPromo: {
    alignItems: 'center',
  },
  redShirtPromoText: {
    textAlign: 'center',
  },
  headerBar: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#BF0D3E',
    width: '100%',
    height: 65,
    marginHorizontal: 0,
    marginBottom: 25,
    marginTop: 0,
  },
  headerTitle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
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
    flex: 1,
    justifyContent: 'center',
  },
  spinnerOverLay: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dropdownButton: {
    borderBottomWidth: 1,
    borderColor: '#F3F3F3',
    paddingTop: 5,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconView: {
    top: 1,
    width: 16,
    height: 16,
  },
  autoAddressBar: {
    borderBottomWidth: 0.25,
    borderColor: '#63666A',
    paddingBottom: 7,
    paddingTop: 10,
    opacity: 0.65,
  },
  autoAddressBarText: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 12,
    lineHeight: 16,
    color: '#63666A',
  },
});
