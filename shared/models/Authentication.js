import moment from 'moment';
import {rwbApi} from '../apis/api';

// How soon before credentials expire to request new credentials
const EXPIRE_BUFFER = 60;
const PW_STORE_KEY = 'teamrwbpw';

class Authentication {
  refreshToken = undefined;
  accessToken = undefined;
  expires = undefined;
  loaded = false;

  getAccessToken = () => {
    if (this.loaded) {
      return this._fetchAccessToken();
    } else {
      return this._loadAuthentication().then(this._fetchAccessToken);
    }
  };

  _fetchAccessToken = () => {
    if (this.expires === undefined || moment().isAfter(moment(this.expires))) {
      return rwbApi.refreshAuth(this.refreshToken).then((response) => {
        return this.setAuthentication(response).then((success) => {
          return response.access_token;
        });
      });
    } else {
      return Promise.resolve(this.accessToken);
    }
  };

  // Only use to test if a user is logged in
  // Do not invoke for use in API calls
  getAccessTokenSync = () => {
    return this.accessToken;
  };

  setAuthentication = (oauthResponse) => {
    this._setTokensAndExpires(oauthResponse);
    return Promise.resolve().then(() => {
      window.localStorage.setItem(
        'teamRWB',
        JSON.stringify({
          refresh_token: oauthResponse.refresh_token,
          access_token: oauthResponse.access_token,
        }),
      );
      return true;
    });
  };

  deleteAuthentication = () => {
    this.refreshToken = undefined;
    this.accessToken = undefined;
    this.expires = undefined;
    this.loaded = false;
    return window.localStorage.removeItem('teamRWB'); //PW_STORE_KEY
  };

  _setTokensAndExpires = (oauthResponse) => {
    this.accessToken = oauthResponse.access_token;
    this.refreshToken = oauthResponse.refresh_token;
    this.loaded = true;
    this.expires = moment()
      .add(oauthResponse.expires_in - EXPIRE_BUFFER, 'seconds')
      .format();
    this.loaded = true;
  };

  _loadAuthentication = () => {
    return Promise.resolve()
      .then(() => {
        return JSON.parse(window.localStorage.getItem('teamRWB'));
      })
      .then((credentials) => {
        if (credentials) {
          this.accessToken = credentials.access_token;
          this.refreshToken = credentials.refresh_token;
          this.expires = undefined;
          this.loaded = true;
        }
      });
  };
}

export let authentication = new Authentication();
