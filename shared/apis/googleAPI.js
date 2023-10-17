import {
  GOOGLE_GEOCODING_API_KEY,
  GOOGLE_PLACES_API_KEY,
  GOOGLE_TIMEZONE_API_KEY,
} from '../constants/APIKeys-obfuscated';
import {jsonOrThrow} from '../utils/Helpers';

export default class googleAPI {
  static geocode = (address) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=${GOOGLE_GEOCODING_API_KEY}`;
    return fetch(url).then(jsonOrThrow);
  };

  static reverseGeocode = (latitude, longitude) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_GEOCODING_API_KEY}`;
    return fetch(url).then(jsonOrThrow);
  };

  static autocomplete = (input, sessionToken, type) => {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${GOOGLE_PLACES_API_KEY}&sessiontoken=${sessionToken}&types=${type}`;
    return fetch(url).then(jsonOrThrow);
  };

  static timezone = (lat, long, timestamp_string) => {
    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${long}&timestamp=${timestamp_string}&key=${GOOGLE_TIMEZONE_API_KEY}`;
    return fetch(url).then(jsonOrThrow);
  };
}
