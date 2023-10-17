import React from 'react';
// import AutocompleteResultView from './AutoCompleteResultView';
// import globalStyles, { RWBColors } from '../styles';
import googleAPI from '../../../shared/apis/googleAPI';
import {
  uuidv4,
  extractAddressComponent,
  debounce,
} from '../../../shared/utils/Helpers';

export default class GoogleAutocompleteView extends React.Component {
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

  componentDidMount = () => {
    this.sessionToken = uuidv4();
    // this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    //   this.props.onGoogleFinish();
    //   return true;
    // });
  };

  componentWillUnmount = () => {
    this.mounted = false;
    // this.backHandler.remove();
  };

  componentDidUpdate = (prevProps) => {
    if (this.props.searchValue !== prevProps.searchValue)
      this.handleChangeText(this.props.searchValue);
  };

  handleInputBlur = () => {
    if (this.navigating) return;
    const {options} = this.state;
    if (options.length !== 1) return;
    const completedValue = options[0].key.fullAddress;
    this.returnWithValue(completedValue);
  };

  handleOptionPress = (value) => {
    // Keyboard.dismiss();
    this.returnWithValue(value);
  };

  handleWillBlur = () => {
    this.navigating = true;
  };

  returnWithValue = (value) => {
    // autocomplete values have fullAddress while retrieving the user's location has a localeString
    let geocodeValue;
    if (value.fullAddress) geocodeValue = value.fullAddress;
    else if (value.localeString) geocodeValue = value.localeString;
    googleAPI.geocode(geocodeValue).then((result) => {
      this.props.onGoogleFinish(this.formatDataObject(result.results[0]));
    });
  };

  formatDataObject = (data) => {
    const street_number = extractAddressComponent(
      'street_number',
      data.address_components,
    );
    const street_name = extractAddressComponent(
      'route',
      data.address_components,
    );
    const establishment = extractAddressComponent(
      'establishment',
      data.address_components,
    );
    const city = extractAddressComponent('locality', data.address_components);
    const zip = extractAddressComponent('postal_code', data.address_components);
    const country = extractAddressComponent('country', data.address_components);
    const state = extractAddressComponent(
      'administrative_area_level_1',
      data.address_components,
    );
    let thoroughfare = null;
    // add the establishment to the start of the thoroughfare when available (when not using an establishment, this should not be available)
    if (establishment && street_name && street_number)
      thoroughfare = `${establishment.long_name}, ${street_number.long_name} ${street_name.short_name}`;
    else if (street_name && street_number)
      thoroughfare = `${street_number.long_name} ${street_name.short_name}`;
    return {
      lat: data.geometry.location.lat,
      long: data.geometry.location.lng,
      fullAddress: data.formatted_address,
      city: city ? city.long_name : null,
      zip: zip ? zip.long_name : null,
      country: country ? country.short_name : null,
      state: state ? state.short_name : null,
      thoroughfare,
    };
  };

  handleBlur = () => {
    const {value} = this.state;
    // navigate(returnRoute, {value});
  };

  fetchOptions = (value) => {
    this.setState({
      isLoading: true,
    });

    return googleAPI
      .autocomplete(value, this.sessionToken, this.props.searchType)
      .then((response) => response.json())
      .then((results) => {
        console.log('googleAPI AUTCOMPLETE results', results);
        // Google autocomplete (regions) type uses all types: locality, sublocality, postal_code ,country ,administrative_area_level_1, administrative_area_level_2 (https://developers.google.com/places/web-service/autocomplete#place_types)
        // Because of this, we want to only return results that have a postal_code and locality when using (regions)
        // establishments should always have postal_codes and locality, so there is no point in filtering
        if (this.props.searchType === '(regions)')
          return results.predictions.filter(
            (place) =>
              place.types.includes('postal_code') ||
              place.types.includes('locality'),
          );
        return results.predictions;
      })
      .catch((err) => {
        console.warn('error retrieving autocomplete places results:', err);
      });
  };

  updateOptionsSingular = (value) => {
    const thisFetchOptions = this.fetchOptions(value)
      .then((data) => {
        if (!this.mounted) return;
        if (thisFetchOptions !== this.lastFetchOptions) return;

        let addressList = [];

        for (let i = 0; i < data.length; i++) {
          const option = data[i];
          let key = {
            fullAddress: option.description,
            list_key: option.id,
          };
          addressList.push({key});
        }
        this.setState({
          options: addressList,
          isLoading: false,
        });
        this.lastFetchOptionsValue = value;
      })
      .catch((err) => {});
    this.lastFetchOptions = thisFetchOptions;
  };

  updateOptions = debounce(this.updateOptionsSingular, 4000); //NOTE, for some reason setting the time too short gets ignored. Despite being set to 4 seconds, it triggers in about 2 seconds TODO, dive deeper

  handleChangeText = (value) => {
    // pressing clear
    if (value === '') {
      this.setState({isLoading: false, options: []});
      return;
    }
    this.setState(
      Object.assign({}, {value}, value.trim().length > 0 ? {} : {options: []}),
    );
    this.setState({isLoading: true});
    if (value.trim().length > 3) this.updateOptions(value);
  };

  onGoBack = () => {
    this.props.onGoogleFinish();
  };

  render() {
    const {isLoading, label, initial_address, options} = this.state;
    return (
      //   <SafeAreaView>
      //     <NavigationEvents onWillBlur={this.handleWillBlur} />
      //     {this.useCurrentLocation ? <div /> : null}
      //     <AutocompleteResultView
      //       onBlur={this.handleInputBlur}
      //       onChangeText={this.handleChangeText}
      //       onOptionPress={this.handleOptionPress}
      //       options={options}
      //       value={initial_address}
      //       onDonePressed={this.onGoBack}
      //       label={label}
      //       isLoading={isLoading}
      //       // onSubmitEditing={(event) => this.updateText( event.nativeEvent.text)}
      //     />
      //   </SafeAreaView>
      <div>
        {this.useCurrentLocation ? <div /> : null}
        <p>GOOGLE AUTOCOMPLETE COMPONENT</p>
        <p>{label}</p>
        <p>{initial_address}</p>
      </div>
    );
  }
}
