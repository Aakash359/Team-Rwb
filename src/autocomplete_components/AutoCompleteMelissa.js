import React from 'react';
import AutocompleteView from './AutoCompleteView';
import {SafeAreaView, View, BackHandler, Text} from 'react-native';
import {NavigationEvents} from 'react-navigation';
import {
  melissaFreeForm,
  melissaGlobalFreeForm,
  melissaCityState,
} from '../../shared/apis/api';
import GetLocationWrapper from '../event_components/GetLocationWrapper';
import globalStyles, {RWBColors} from '../styles';
import debounce from 'lodash.debounce';

const DEBOUNCE_MS = 500;

export default class AutoCompleteMelissa extends React.Component {
  constructor(props) {
    super(props);
    this.mounted = true;
    this.lastFetchOptions = null;
    this.lastFetchOptionsValue = null;
    this.navigating = false;
    this.state = {
      api: '',
      options: [],
      isLoading: false,
      initial_address: '',
      label: '',
      country: '',
    };
    this.useCurrentLocation = false;
  }

  componentWillUnmount = () => {
    this.mounted = false;
    this.backHandler.remove();
  };

  componentDidMount = () => {
    let value;
    if (this.props.value) {
      value = this.props.value;
      this.useCurrentLocation = value.useCurrentLocation;
      this.backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          this.props.onMelissaFinish();
          return true;
        },
      );
    } else if (this.props.navigation) {
      const {
        navigation: {getParam},
      } = this.props;
      this.backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          this.onGoBack();
          return true;
        },
      );
      value = getParam('value', null);
      this.useCurrentLocation = value.useCurrentLocation;
    }
    if (value === null)
      throw new Error('Autocomplete navigate must have value');
    const {initial_address, label, api, country} = value;
    this.setState({
      api,
      options: [],
      label,
      initial_address,
      country,
    });
    if (initial_address && initial_address.trim().length > 3) {
      this.updateOptions(initial_address);
    }
  };

  handleInputBlur = () => {
    if (this.navigating) return;
    const {initial_address} = this.state;
    const {options} = this.state;
    if (options.length !== 1) return;
    if (initial_address !== this.lastFetchOptionsValue) return;
    const completedValue = options[0].key;
    this.returnWithValue(completedValue);
  };

  handleOptionPress = (value) => {
    this.returnWithValue(value);
  };

  handleWillBlur = () => {
    this.navigating = true;
  };

  returnWithValue = (value) => {
    if (this.props.navigation) {
      const {
        navigation: {getParam, navigate},
      } = this.props;
      const returnRoute = getParam('returnRoute', null);
      if (returnRoute === null)
        throw new Error('Autocomplete navigate must have returnRoute');
      navigate(returnRoute, {value});
    } else if (this.props.onMelissaFinish) {
      this.props.onMelissaFinish(value);
    }
  };

  handleBlur = () => {
    const {
      navigation: {getParam, navigate},
    } = this.props;
    const returnRoute = getParam('returnRoute', null);
    if (returnRoute === null)
      throw new Error('Autocomplete navigate must have returnRoute');
    const {value} = this.state;
    navigate(returnRoute, {value});
  };

  fetchOptions = (value) => {
    this.setState({
      isLoading: true,
    });
    let {api, country} = this.state;
    if (api === 'freeform') {
      return melissaFreeForm(value, 25)
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
      return melissaGlobalFreeForm(value, country, 25)
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

      return melissaCityState(city, zip, 25, state)
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
        if (!this.mounted) return;
        if (thisFetchOptions !== this.lastFetchOptions) return;
        const options = data.map((option) => ({key: option}));
        this.setState({
          options,
          isLoading: false,
        });
        this.lastFetchOptionsValue = value;
      })
      .catch((err) => {});
    this.lastFetchOptions = thisFetchOptions;
  };

  updateOptions = debounce(this.updateOptionsSingular, DEBOUNCE_MS);

  handleChangeText = (value) => {
    this.setState(
      Object.assign({}, {value}, value.trim().length > 0 ? {} : {options: []}),
    );
    if (value.trim().length > 3) {
      this.updateOptions(value);
    } else {
    }
  };

  onGoBack = () => {
    if (this.props.navigation) this.props.navigation.goBack();
    else if (this.props.onMelissaFinish) this.props.onMelissaFinish();
  };

  render() {
    const {isLoading, label, initial_address, options} = this.state;
    return (
      <SafeAreaView>
        <NavigationEvents onWillBlur={this.handleWillBlur} />
        {this.useCurrentLocation ? (
          <View>
            <GetLocationWrapper
              style={{
                padding: 15,
                marginLeft: 5,
                backgroundColor: RWBColors.white,
              }}
              onPress={(localeString) => {
                this.returnWithValue(localeString);
              }}>
              <Text style={globalStyles.link}>Use Current Location</Text>
            </GetLocationWrapper>
          </View>
        ) : null}
        <AutocompleteView
          onBlur={this.handleInputBlur}
          onChangeText={this.handleChangeText}
          onOptionPress={this.handleOptionPress}
          options={options}
          value={initial_address}
          onDonePressed={this.onGoBack}
          label={label}
          isLoading={isLoading}
          // onSubmitEditing={(event) => this.updateText( event.nativeEvent.text)}
        />
      </SafeAreaView>
    );
  }
}
