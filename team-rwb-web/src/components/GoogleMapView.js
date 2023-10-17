import React, {Component} from 'react';
import {GOOGLE_REACT_API_KEY} from '../../../shared/constants/APIKeys';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';

const mapStyles = {
  width: '300px',
  maxWidth: '80%',
  height: '150px',
  marginBottom: '30px',
};

class GoogleMapView extends Component {
  render() {
    const {lat, lng} = this.props.location;
    return (
      <Map
        google={this.props.google}
        zoom={8}
        style={mapStyles}
        initialCenter={{lat, lng}}>
        <Marker position={{lat, lng}} />
        <InfoWindow onClose={() => alert('on close')}>
          <div>
            <h1>{'this.state.selectedPlace.name'}</h1>
          </div>
        </InfoWindow>
      </Map>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: GOOGLE_REACT_API_KEY,
})(GoogleMapView);
