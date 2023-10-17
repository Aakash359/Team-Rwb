/* GetLocationWrapper: Container component for components that need to request the user's location.
Writes user location details to AsyncStorage 'user_location'

Usage:

    <GetLocationWrapper
        style={{...}}
        callback={{ (localeString) => {...} }}
    >
        <SomeJSX ... />
    </GetLocationWrapper>

*/

import React from 'react';
import {Alert, TouchableOpacity} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

import googleAPI from '../../shared/apis/googleAPI';
import {userLocation} from '../../shared/models/UserLocation';
import {
  GENERAL_LOCATION_ERROR,
  LOCATION_PERMISSION_ERROR,
  NO_LOCATION_ERROR,
} from '../../shared/constants/ErrorMessages';

export default class GetLocationWrapper extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handlePress = this.handlePress.bind(this);
    this.extractLocale = this.extractLocale.bind(this);
  }

  // See google reverse geocode API documents for what `component` can be.
  extractAddressComponent(component, address_data) {
    for (let datum of address_data) {
      if (datum.types.includes(component)) {
        return datum;
      }
    }
    throw new Error(`Cannot find component ${component} in data.`);
  }

  extractLocale(addressComponents) {
    const city = this.extractAddressComponent('locality', addressComponents)
      .long_name;
    const state = this.extractAddressComponent(
      'administrative_area_level_1',
      addressComponents,
    ).short_name;
    const zip = this.extractAddressComponent('postal_code', addressComponents)
      .long_name;

    const localeString = `${zip.slice(0, 5)} ${city}, ${state}`;
    return localeString;
  }

  handlePress(callback) {
    Geolocation.getCurrentPosition(
      (position) => {
        const {latitude, longitude} = position.coords;
        googleAPI
          .reverseGeocode(latitude, longitude)
          .then((response) => {
            if (response.status !== 'OK') {
              throw new Error(`googleAPI.reverseGeocde did not return OK`);
            }
            let match;
            const {results} = response;
            for (let result of results) {
              if (result.types.includes('street_address')) {
                match = result;
              }
            }
            const {address_components} = match;
            const street = this.extractAddressComponent(
              'route',
              address_components,
            ).long_name;
            const city = this.extractAddressComponent(
              'locality',
              address_components,
            ).long_name;
            const state = this.extractAddressComponent(
              'administrative_area_level_1',
              address_components,
            ).short_name;
            const zip = this.extractAddressComponent(
              'postal_code',
              address_components,
            ).long_name;

            const localeString = this.extractLocale(address_components);
            userLocation.saveToUserLocation({
              lat: latitude,
              long: longitude,
              locale: localeString,
              street,
              city,
              state,
              zip,
            });
            callback({
              localeString,
              city,
              state,
              zip,
              street,
            });
          })
          .catch((error) => {
            console.warn(error);
            Alert.alert(
              'Team RWB',
              "We couldn't find any addresses near your location.",
            );
          });
      },
      (PositionError) => {
        // Error code when denied permission
        if (PositionError.code === 1) {
          Alert.alert('Team RWB', LOCATION_PERMISSION_ERROR);
        }
        // Error code when device can't find its own location (bad reception, etc.)
        else if (PositionError.code === 2) {
          Alert.alert('Team RWB', NO_LOCATION_ERROR);
        }
        // Error code when geolocator times out.
        else {
          Alert.alert('Team RWB', GENERAL_LOCATION_ERROR);
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000, // 10 seconds
        maximumAge: 300000, // 5 minutes
      },
    );
  }

  render() {
    const {style, onPress} = this.props;
    return (
      <TouchableOpacity
        style={style}
        onPress={() => this.handlePress(onPress)}
        accessibilityHint={
          "Use your device's current location for the purpose of finding events."
        }>
        {this.props.children}
      </TouchableOpacity>
    );
  }
}
