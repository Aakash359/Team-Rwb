import React from 'react';

import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import {NavigationEvents} from 'react-navigation';
import {userLocation} from '../../shared/models/UserLocation';

import GetLocationWrapper from './GetLocationWrapper';
import googleAPI from '../../shared/apis/googleAPI';

import globalStyles, {RWBColors} from '../styles';

// SVGs
import SearchIcon from '../../svgs/SearchIcon';
import CurrentLocationIcon from '../../svgs/CurrentLocationIcon';
import MapMarkerIcon from '../../svgs/MapMarkerIcon';
import XIcon from '../../svgs/XIcon';

export default class LocationPicker extends React.Component {
  static navigationOptions = {
    headerTitle: 'Edit Location',
    headerStyle: {
      backgroundColor: RWBColors.magenta,
    },
    headerTintColor: RWBColors.white,
  };

  constructor(props) {
    super(props);
    this.state = {
      position: {
        mocked: false,
        timestamp: 0,
        coords: {
          accuracy: 0,
          altitude: 0,
          heading: 0,
          latitude: null,
          longitude: null,
          speed: 0,
        },
      },

      address: '',
      latitude: 0,
      longitude: 0,

      returnText: '',
    };
    this.GLWrapperCallback = this.GLWrapperCallback.bind(this);
    this.navigateToAutoComplete = this.navigateToAutoComplete.bind(this);
    this.handleDidFocus = this.handleDidFocus.bind(this);
  }

  navigateToAutoComplete() {
    const {
      navigation: {navigate},
    } = this.props;
    navigate('AppAutoComplete', {
      returnRoute: 'LocationPicker',
      value: {
        initial_text: '',
        label: 'ZIP or City, State',
        api: 'citystate',
      },
    });
  }

  handleDidFocus(params) {
    const {value} = params;
    // Branch when navigated to from EventsListView
    if (value.latitude && value.longitude) {
      this.setState({
        latitude: value.latitude,
        longitude: value.longitude,
      });
    } else if (value.locale) {
      googleAPI.geocode(value.locale).then((response) => {
        this.setState({
          latitude: response.results[0].geometry.location.lat,
          longitude: response.results[0].geometry.location.lng,
        });
      });
    }

    // Branch when navigated to from AutoComplete
    else if (value.fullAddress) {
      const {city, state, zip, fullAddress} = value;
      const localeString = zip.slice(0, 5) + ' ' + city + ', ' + state;

      googleAPI.geocode(fullAddress).then((response) => {
        this.setState({
          returnText: fullAddress,
          address: localeString,
          latitude: response.results[0].geometry.location.lat,
          longitude: response.results[0].geometry.location.lng,
        });

        userLocation.saveToUserLocation({
          city,
          state,
          zip,
          lat: response.results[0].geometry.location.lat,
          long: response.results[0].geometry.location.lng,
        });
      });
    }
  }

  GLWrapperCallback() {
    const {lat, long, locale} = userLocation.getUserLocation();

    this.setState({
      latitude: lat,
      longitude: long,
      localeString: locale,
    });
  }

  render() {
    return (
      <View style={{flex: 1, flexDirection: 'column'}}>
        <NavigationEvents
          onWillFocus={(payload) => {
            this.handleDidFocus(payload.state.params);
          }}
        />
        <View
          style={{height: 54, flexDirection: 'row', backgroundColor: 'white'}}>
          <View
            style={{
              flex: 1,
              height: 34,
              flexDirection: 'row',
              backgroundColor: '#EEE',
              margin: 10,
              borderRadius: 2,
              alignItems: 'center',
            }}>
            <View style={{flex: 1}}>
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  marginVertical: 4,
                  flexDirection: 'row',
                }}
                onPress={() => this.navigateToAutoComplete()}>
                <SearchIcon style={{height: 24, width: 24}} />
                <Text
                  style={[
                    globalStyles.formInput,
                    {color: '#888888', alignSelf: 'center', maxWidth: '80%'},
                  ]}
                  numberOfLines={1}>
                  {this.state.returnText === ''
                    ? 'Enter Zip or City, State'
                    : this.state.returnText}
                </Text>
              </TouchableOpacity>
            </View>
            {this.state.returnText === '' ? null : (
              <TouchableOpacity
                style={{
                  height: 24,
                  width: 24,
                  margin: 2,
                  alignContent: 'center',
                }}
                onPress={() => {
                  this.setState({searchText: '', returnText: ''});
                }}>
                <XIcon style={{height: 24, width: 24, alignSelf: 'center'}} />
              </TouchableOpacity>
            )}
          </View>
          <GetLocationWrapper
            style={{padding: 15, width: 54, height: 54, alignContent: 'center'}}
            callback={this.GLWrapperCallback}>
            <CurrentLocationIcon
              style={{height: 24, width: 24, alignSelf: 'center'}}
            />
          </GetLocationWrapper>
        </View>

        {this.state.latitude === 0 && this.state.longitude === 0 ? null : (
          <View style={{backgroundColor: '#EEE', flex: 1}}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{width: '100%', height: '100%'}}
              region={{
                latitude: this.state.latitude,
                longitude: this.state.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.03,
              }}>
              <Marker
                coordinate={{
                  latitude: this.state.latitude,
                  longitude: this.state.longitude,
                }}
                anchor={{x: 0.5, y: 1}}
                centerOffset={{x: 0, y: -20}}>
                <MapMarkerIcon style={styles.mapIconView} />
              </Marker>
            </MapView>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mapIconView: {
    width: 40,
    height: 40,
  },
});
