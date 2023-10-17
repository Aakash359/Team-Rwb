import * as Keychain from 'react-native-keychain';
import moment from 'moment';
import { rwbApi } from '../apis/api';

// How soon before credentials expire to request new credentials
const EXPIRE_BUFFER = 60;

class Authentication {
  refreshToken = undefined;
  accessToken = undefined;
  expires = undefined;
  loaded = false;

  constructor() {
    this._fetchAccessToken = this._fetchAccessToken.bind(this);
  }

  _fetchAccessToken() {
    if (this.expires === undefined || moment().isAfter(moment(this.expires))) {
      // TODO, look back into why the server says the refresh token is invalid
      return rwbApi.refreshAuth(this.refreshToken)
        .then((response) => {
          return this.setAuthentication(response)
            .then((success) => {
              return response.access_token;
            });
        });
    }

    else {
      return Promise.resolve(this.accessToken);
    }
  }

  getAccessToken() {
    if (this.loaded) {
      return this._fetchAccessToken();
    }
    else {
      return this._loadAuthentication()
        .then(this._fetchAccessToken);
    }
  }

  // Only use to test if a user is logged in
  // Do not invoke for use in API calls
  getAccessTokenSync() {
    return this.accessToken;
  }

  setAuthentication(oauthResponse) {
    this._setTokensAndExpires(oauthResponse);
    return Keychain.setInternetCredentials('teamRWB', oauthResponse.refresh_token, oauthResponse.access_token)
      .then((success) => {
        if (!success) {
          throw new Error('Keychain could not save credentials.');
        }
        return success;
      })
      .catch((error) => {
        throw error;
      });
  }

  deleteAuthentication() {
    this.refreshToken = undefined;
    this.accessToken = undefined;
    this.expires = undefined;
    this.loaded = false;
    return Keychain.resetInternetCredentials('teamRWB');
  }

  _setTokensAndExpires(oauthResponse) {
    this.accessToken = oauthResponse.access_token;
    this.refreshToken = oauthResponse.refresh_token;
    this.loaded = true;
    this.expires = moment().add(oauthResponse.expires_in - EXPIRE_BUFFER, 'seconds').format();
  }

  _loadAuthentication() {
    return Keychain.getInternetCredentials('teamRWB')
      .then((credentials) => {
        if (credentials) {
          this.accessToken = credentials.password;
          this.refreshToken = credentials.username;
          this.expires = undefined;
          this.loaded = true;
        }
      })
      .catch((err) => {
        throw Error('Could not access keychain');
      });
  }
}

export let authentication = new Authentication();
