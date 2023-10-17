import {authentication} from '../models/Authentication';
import {userProfile} from '../models/UserProfile';
import {clientCredentialsToken} from '../models/ClientCredentialsToken';
import {generateBody, jsonOrThrow} from '../utils/Helpers';
import {BASIC_TOKEN, MELISSA_ID} from '../constants/APIKeys-obfuscated';
import {DOMAIN} from '../constants/URLs'; // import DOMAIN instead on server-change
import {GET_VERSION_ERROR} from '../constants/ErrorMessages';
import moment from 'moment';

var error_codes = {};
error_codes['AE01'] = 'General Error';
error_codes['AE02'] = 'Unknown Street';
error_codes['AE03'] = 'Component Mismatch Error';
error_codes['AE05'] = 'Multiple Match';
error_codes['AE08'] = 'Sub Premise Number Invalid';
error_codes['AE09'] = 'Sub Premise Number Missing';
error_codes['AE10'] = 'Premise Number Invalid';
error_codes['AE11'] = 'Premise Number Missing';
error_codes['AE12'] = 'Box Number Invalid';
error_codes['AE13'] = 'Box Number Missing';
error_codes['AE14'] = 'PMB Number Missing';
error_codes['AE17'] = '';
export var error_codes;
/* Melissa APIs */
export const melissaVerify = (country, fulladdress) => {
  var url = `https://address.melissadata.net/V3/WEB/GlobalAddress/doGlobalAddress?id=AWnzuhXjgtwo-iUyCybpnS**^&a1=${fulladdress}&ctry=${country}&format=JSON`;
  return fetch(url)
    .then((data) => {
      return data.json().then((result) => {
        if (
          result.hasOwnProperty('TotalRecords') &&
          result['TotalRecords'] !== '1'
        ) {
          return [];
        } else if (result.hasOwnProperty('Records')) {
          return result['Records'];
        } else {
          return [];
        }
      });
    })
    .catch((err) => {
      console.warn('err: ', err);
      // throw new Error(err.message);
    });
};
export const melissaFreeForm = (search_text, number_of_results) => {
  let urlParams = `id=${MELISSA_ID}&ff=${encodeURIComponent(
    search_text,
  )}&maxrecords=${number_of_results}&format=JSON`;
  return fetch(
    `https://expressentry.melissadata.net/web/ExpressFreeForm?${urlParams}`,
  )
    .then((data) => {
      return data
        .json()
        .then((result) => {
          return result;
        })
        .catch((err) => {});
    })
    .catch((err) => {});
};

export const melissaGlobalFreeForm = (
  search_text,
  country,
  number_of_results,
) => {
  // Melissa's GlobalExpressFreeForm API spec has it returning latitude and longitude,
  // but this is actually an add-on service.

  let urlParams = `id=${MELISSA_ID}&ff=${encodeURIComponent(
    search_text,
  )}&maxrecords=${number_of_results}&country=${country}&format=JSON`;
  return fetch(
    `https://expressentry.melissadata.net/web/GlobalExpressFreeForm?${urlParams}`,
  )
    .then((data) => {
      return data
        .json()
        .then((result) => {
          return result;
        })
        .catch((err) => {});
    })
    .catch((err) => {});
};

export const melissaCityState = (city, zip, number_of_results, state = '') => {
  let urlParams = `id=${MELISSA_ID}&city=${encodeURIComponent(
    city,
  )}&state=${state}&maxrecords=${number_of_results}&format=JSON`;

  if (zip) {
    urlParams = urlParams + `&postalcode=${zip}`;
  }
  return fetch(
    `https://expressentry.melissadata.net/web/ExpressCityState?${urlParams}`,
  )
    .then((data) => {
      return data
        .json()
        .then((result) => {
          return result;
        })
        .catch((err) => {});
    })
    .catch((err) => {});
};

/* DB APIs */

export class rwbApi {
  // Authentication

  static fetchAuthToken(username, password) {
    return fetch(DOMAIN + 'oauth/?oauth=token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        Authorization: `Basic ${BASIC_TOKEN}`,
      },
      body: generateBody({grant_type: 'password', username, password}),
    })
      .then(jsonOrThrow)
      .then((oauthResponse) => {
        return authentication
          .setAuthentication(oauthResponse)
          .then((success) => {
            if (success) {
              return oauthResponse;
            } else throw new Error(`Couldn't save credentials.`);
          });
      });
  }

  static refreshAuth(refreshToken) {
    return fetch(`${DOMAIN}oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${BASIC_TOKEN}`,
      },
      body: generateBody({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    }).then(jsonOrThrow);
  }

  static getAuthenticatedUser() {
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(`${DOMAIN}oauth/me/`, {
          method: 'GET',
          headers: {
            Accepts: 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then(jsonOrThrow)
      .then((json) => {
        return userProfile.setUserId(json.ID);
      })
      .then(rwbApi.getUser);
  }

  static getClientCredentialsToken() {
    return fetch(`${DOMAIN}oauth/?oauth=token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${BASIC_TOKEN}`,
      },
      body: generateBody({grant_type: 'client_credentials'}),
    })
      .then(jsonOrThrow)
      .then((json) => {
        clientCredentialsToken.setAccessToken(json.access_token);
        return json;
      });
  }

  // User Creation

  static loginUser(email, password) {
    return rwbApi
      .fetchAuthToken(email, password)
      .then((response) => {
        return rwbApi.getAuthenticatedUser();
      })
      .catch((error) => {
        throw error;
      });
  }

  // Need fine usage of error codes in createUser and createNewUser
  // Do not use jsonOrThrow on these calls.

  static createUser(body) {
    return fetch(DOMAIN + 'api/v1/user/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientCredentialsToken.getAccessToken()}`,
      },
      body,
    });
  }

  static createNewUser(body) {
    return rwbApi.getClientCredentialsToken().then((response) => {
      return rwbApi.createUser(body);
    });
  }

  // Returns both an access token and a new user ID
  static createUserFromOneAll(user_token, identity_token) {
    const body = {
      user_token,
      identity_token,
    };
    return fetch(`${DOMAIN}api/v1/user/oneall_token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${clientCredentialsToken.getAccessToken()}`,
        'Content-Type': `application/json`,
        'Content-Length': JSON.stringify(body).length,
      },
      body: JSON.stringify(body),
    });
  }

  static createNewUserFromOneAll(user_token, identity_token) {
    return rwbApi.getClientCredentialsToken().then((response) => {
      return rwbApi.createUserFromOneAll(user_token, identity_token);
    });
  }

  // General Events Information

  // DEPRECATED: THIS ONLY CONNECTS TO THE OLD EVENTS TABLE
  static getEvents(urlParams) {
    console.warn(
      'Deprecated call. Find the appropriate mobile endpoint if working with new events database.',
    );
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(
          `${DOMAIN}api/v1/event${urlParams.length ? `?${urlParams}` : ``}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
      })
      .then(jsonOrThrow);
  }

  static getMobileEvents(urlParams) {
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(
          `${DOMAIN}api/v1/mobile_event${
            urlParams.length ? `?${urlParams}` : ``
          }`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              // specific cache issue when looking at "My Events"
              'Cache-Control': urlParams.includes('host_id')
                ? 'no-cache'
                : null,
            },
          },
        );
      })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        // trying to load a page past what exists will result in a 400
        else if (response.status === 400) {
          return [];
        } else throw Error('RWB Server Error');
      });
  }

  // DEPRECATED: THIS ONLY CONNECTS TO THE OLD EVENTS TABLE
  static getEvent(event_id) {
    console.warn(
      'Deprecated call. Find the appropriate mobile endpoint if working with new events database.',
    );
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(`${DOMAIN}api/v1/event/${event_id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then(jsonOrThrow);
  }

  static getMobileEvent(id, forceRefresh = false) {
    const url = DOMAIN + `api/v1/mobile_event/${id}`;
    return authentication.getAccessToken().then((accessToken) => {
      let headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      if (forceRefresh) headers['Cache-Control'] = 'no-cache';
      return fetch(url, {
        method: 'GET',
        headers,
      }).then(jsonOrThrow);
    });
  }

  static removeEvent(event_id) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(`${DOMAIN}api/v1/mobile_event/${event_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((result) => {
        if (result.ok) return;
        else throw new Error('Error removing event');
      });
    });
  }

  // DEPRECATED: THIS ONLY CONNECTS TO THE OLD EVENTS TABLE
  static getPermalinkEvent(event_slug) {
    console.warn(
      'Deprecated call. Find the appropriate mobile endpoint if working with new events database.',
    );
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(`${DOMAIN}api/v1/event/permalink/${event_slug}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then(jsonOrThrow);
  }

  // User Information

  static getUser() {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(`${DOMAIN}api/v1/user/${userProfile.getUserProfile().id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then(jsonOrThrow)
        .then((json) => {
          return userProfile.saveToUserProfile(json).then(() => {
            return json;
          });
        });
    });
  }

  static getUserByID(id) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(`${DOMAIN}api/v1/user/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then(jsonOrThrow)
        .then((json) => {
          return json;
        });
    });
  }

  static putUser(data) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(`${DOMAIN}api/v1/user/${userProfile.getUserProfile().id}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          Authorization: `Bearer ${accessToken}`,
        },
        body: data,
      })
        .then(jsonOrThrow)
        .then((json) => {
          return userProfile.saveToUserProfile(json).then(() => {
            return json;
          });
        });
    });
  }

  static putUserPhotoWeb(data) {
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        const options = {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: data,
        };
        delete options.headers['Content-Type'];
        return fetch(
          `${DOMAIN}api/v1/user/${userProfile.getUserProfile().id}/photo/`,
          options,
        );
      })
      .then(jsonOrThrow);
  }

  static putUserPhoto(data) {
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(
          `${DOMAIN}api/v1/user/${userProfile.getUserProfile().id}/photo/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${accessToken}`,
            },
            body: data,
          },
        );
      })
      .then(jsonOrThrow);
  }

  static removeProfilePhoto() {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/user/${userProfile.getUserProfile().id}/photo/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
    });
  }

  static getAppVersion() {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/user/${userProfile.getUserProfile().id}/app_version`,
        {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ).then((result) => {
        if (result.ok) {
          return result.json();
        } else {
          return `${GET_VERSION_ERROR}`;
        }
      });
    });
  }

  static updateAppVersion(version, platform) {
    const data = JSON.stringify({
      app_version: version,
      client: platform,
    });
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/user/${userProfile.getUserProfile().id}/app_version`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Content-Length': data.length,
          },
          body: data,
        },
      ).then((result) => {
        if (result.ok) {
          return result.json();
        } else {
          return `${GET_VERSION_ERROR}`;
        }
      });
    });
  }

  static getMinimumRequiredVersion() {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(`${DOMAIN}api/v1/minimum_version`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((result) => {
        if (result.ok) {
          return result.json();
        } else {
          throw new Error('Error retrieving minimum required version.');
        }
      });
    });
  }

  // Block and Unblock User Endpoints

  static getListOfBlockedUsers() {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/user/${userProfile.getUserProfile().id}/block`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ).then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error('Error retrieving blocked users.');
        }
      });
    });
  }

  static unblockUser(target_id) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/user/${
          userProfile.getUserProfile().id
        }/block/${target_id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: target_id,
        },
      ).then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error('Error unblocking user.');
        }
      });
    });
  }

  static blockUser(target_id) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/user/${
          userProfile.getUserProfile().id
        }/block/${target_id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: target_id,
        },
      ).then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error('Error blocking user.');
        }
      });
    });
  }

  // User-Specific Event Endpoints

  // DEPRECATED: THIS ONLY CONNECTS TO THE OLD EVENTS TABLE
  static fetchUserEvents(params) {
    console.warn(
      'Deprecated call. Find the appropriate mobile endpoint if working with new events database.',
    );
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        const url = `${DOMAIN}api/v1/user/${
          userProfile.getUserProfile().id
        }/event?${params}`;
        return fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then(jsonOrThrow);
  }

  // DEPRECATED: THIS ONLY CONNECTS TO THE OLD EVENTS TABLE
  static getAttendanceStatus(eventid) {
    console.warn(
      'Deprecated call. Find the appropriate mobile endpoint if working with new events database.',
    );
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/user/${
        userProfile.getUserProfile().id
      }/attending/${eventid}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then(jsonOrThrow);
    });
  }

  // DEPRECATED: THIS ONLY CONNECTS TO THE OLD EVENTS TABLE
  // Can be called from a notification
  // Must wait for userProfile to fetch data from async storage before calling
  static putAttendanceStatus(eventid, status) {
    console.warn(
      'Deprecated call. Find the appropriate mobile endpoint if working with new events database.',
    );
    return userProfile.init().then((userData) => {
      if (userData.id === null) {
        throw new Error(`NO USER LOGGED IN`);
      }
      const data = JSON.stringify({
        attendance_status: status,
      });
      const url = `${DOMAIN}api/v1/user/${
        userProfile.getUserProfile().id
      }/event/${eventid}`;
      return authentication.getAccessToken().then((accessToken) => {
        return fetch(url, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            Authorization: `Bearer ${accessToken}`,
          },
          body: data,
        });
      });
    });
  }

  // DEPRECATED: THIS ONLY CONNECTS TO THE OLD EVENTS TABLE
  static deleteAttendanceStatus(eventid) {
    console.warn(
      'Deprecated call. Find the appropriate mobile endpoint if working with new events database.',
    );
    return authentication.getAccessToken().then((accessToken) => {
      const url =
        DOMAIN +
        `api/v1/user/${userProfile.getUserProfile().id}/event/${eventid}`;
      return fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    });
  }

  /* MOBILE ENDPOINTS */

  static getMobileAttendees(event_id, status, page) {
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        const url = `${DOMAIN}api/v1/mobile_event/${event_id}/attendees?attendance_status=${status}&page=${page}`;
        return fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          return Error(`Error retrieving Attendees with ${status} status`);
        }
      });
  }

  static getAllMobileAttendees(event_id) {
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        const url = `${DOMAIN}api/v1/mobile_event/${event_id}/attendees`;
        return fetch(url, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else return Error('Unable to retrieve mobile attendanees');
      });
  }

  static getAllFollowedAttendees(event_id) {
    const url = `${DOMAIN}api/v1/user/${
      userProfile.getUserProfile().id
    }/followed_attendees?event_ids=${event_id}`;
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 404) {
          return [];
        } else {
          return Error('Unable to retrieved followed attendees');
        }
      });
  }

  static getMobileAttendanceStatus(eventid) {
    const url = `${DOMAIN}api/v1/mobile_event/${eventid}/attendees/${
      userProfile.getUserProfile().id
    }`;
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(url, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then((response) => {
        if (response.status === 200) {
          return response.json().then((result) => {
            return result.attendance_status;
          });
        } else if (response.status === 404) return '';
        // no `attendance_status` was found
        else return Error('Unable to retrieve mobile attendance status');
      });
  }

  // Can be called from a notification
  // Must wait for userProfile to fetch data from async storage before calling
  static updateMobileAttendanceStatus(eventid, status) {
    return userProfile.init().then((userData) => {
      if (userData.id === null) {
        throw new Error(`NO USER LOGGED IN`);
      }
      const data = JSON.stringify({
        attendance_status: status,
      });
      const url = `${DOMAIN}api/v1/mobile_event/${eventid}/attendees/${userData.id}`;
      return authentication.getAccessToken().then((accessToken) => {
        return fetch(url, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            Authorization: `Bearer ${accessToken}`,
          },
          body: data,
        });
      });
    });
  }

  static setInitialMobileAttendanceStatus(eventid, status) {
    const data = JSON.stringify({
      attendance_status: status,
    });
    const url = `${DOMAIN}api/v1/mobile_event/${eventid}/attendees/${
      userProfile.getUserProfile().id
    }`;
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Content-Length': data.length,
          Authorization: `Bearer ${accessToken}`,
        },
        body: data,
      });
    });
  }

  // Push Token

  static putPushToken(token, device_id) {
    return authentication.getAccessToken().then((accessToken) => {
      const body = JSON.stringify({token, device_id});
      const url = `${DOMAIN}api/v1/user/${
        userProfile.getUserProfile().id
      }/push_token`;
      return fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': body.length,
        },
        body,
      });
    });
  }

  static putFCMToken(fcm_token, device_id) {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/user/${
        userProfile.getUserProfile().id
      }/fcm_token`;
      const body = JSON.stringify({fcm_token, device_id});
      return fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body,
      });
    });
  }

  // Chapter manipulation

  static getChapters() {
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        const url = DOMAIN + `api/v1/chapter`;
        return fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then(jsonOrThrow);
  }

  static putChapters(data) {
    return authentication.getAccessToken().then((accessToken) => {
      const url =
        DOMAIN +
        `api/v1/user/${userProfile.getUserProfile().id}/chapter-settings`;
      return fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: data,
      })
        .then(jsonOrThrow)
        .then((json) => {
          return userProfile.saveToUserProfile(json).then(() => {
            return json;
          });
        });
    });
  }

  static postEvent(data) {
    return authentication.getAccessToken().then((accessToken) => {
      const url = DOMAIN + `api/v1/mobile_event/`;
      return fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: data,
      })
        .then(jsonOrThrow)
        .then((json) => {
          return json;
        });
    });
  }

  static putEvent(id, data) {
    return authentication.getAccessToken().then((accessToken) => {
      const url = DOMAIN + `api/v1/mobile_event/${id}`;
      return fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: data,
      })
        .then(jsonOrThrow)
        .then((json) => {
          return json;
        });
    });
  }

  static patchEvent(id, data) {
    return authentication.getAccessToken().then((accessToken) => {
      const url = DOMAIN + `api/v1/mobile_event/${id}`;
      return fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: data,
      })
        .then(jsonOrThrow)
        .then((json) => {
          return json;
        });
    });
  }

  static putFeed(data) {
    return authentication.getAccessToken().then((accessToken) => {
      const url =
        DOMAIN + `api/v1/user/${userProfile.getUserProfile().id}/user_feed`;
      return fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: data,
      })
        .then(jsonOrThrow)
        .then((json) => {
          return json;
        });
    });
  }

  static deleteUserPost(streamID) {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/user/${
        userProfile.getUserProfile().id
      }/user_feed/${streamID}`;
      return fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then(jsonOrThrow)
        .then((json) => {
          return json;
        });
    });
  }

  static deleteEventPost(eventID, streamID) {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/mobile_event/${eventID}/timeline/${streamID}`;
      return fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then(jsonOrThrow)
        .then((json) => {
          return json;
        });
    });
  }

  // only activities performed by the target user
  static getUserFeed(id, offset) {
    return authentication.getAccessToken().then((accessToken) => {
      let url = DOMAIN + `api/v1/user/${id}/user_feed`;
      if (offset) url += `?offset=${offset}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache',
        },
      }).then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 404) {
          return [];
        } else {
          return Error('Unable to retrieve Event Feed');
        }
      });
    });
  }

  // only activites performed by the target user's following
  // this will always be the logged in user
  static getTimelineFeed(offset) {
    return authentication.getAccessToken().then((accessToken) => {
      let url =
        DOMAIN +
        `api/v1/user/${
          userProfile.getUserProfile().id
        }/aggregated_timeline_feed`;
      if (offset) url += `?offset=${offset}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache',
        },
      }).then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 404) {
          return [];
        } else {
          return Error('Unable to retrieve Event Feed');
        }
      });
    });
  }

  static getSpecificPost = (userID, streamID) => {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/user/${userID}/user_feed/${streamID}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((response) => {
        if (response.ok) return response.json();
        else throw new Error('Error retrieving specific event');
      });
    });
  };

  static getPinnedPost() {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/user/${
          userProfile.getUserProfile().id
        }/aggregated_timeline_feed/pinned_post`,
        {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ).then((response) => {
        if (response.ok) return response.json();
        else return [];
      });
    });
  }

  static createEventPost(data, id) {
    return authentication.getAccessToken().then((accessToken) => {
      const url = DOMAIN + `api/v1/mobile_event/${id}/timeline`;
      return fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: data,
      }).then(jsonOrThrow);
    });
  }

  static getEventFeed(id, offset) {
    return authentication.getAccessToken().then((accessToken) => {
      let url = DOMAIN + `api/v1/mobile_event/${id}/timeline`;
      if (offset) url += `?offset=${offset}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache',
        },
      }).then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 404) {
          return [];
        } else {
          return Error('Unable to retrieve Event Feed');
        }
      });
    });
  }

  // general user search
  static searchUser(input) {
    return authentication.getAccessToken().then((accessToken) => {
      const chapterID = userProfile.getUserProfile().preferred_chapter.id;
      let url = `${DOMAIN}api/v1/search/user?name=${input}`;
      // if chapterID is null, do not send that to avoid an error
      if (chapterID) url += `&chapter_id=${chapterID}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((response) => {
        if (response.status === 200) {
          return response.json().then((result) => {
            return result.hits;
          });
        }
      });
    });
  }

  // used to search members in a group
  static searchGroupMembers(input, groupID) {
    return authentication.getAccessToken().then((accessToken) => {
      let url = `${DOMAIN}api/v1/search/user/group?name=${input}`;
      if (groupID) url += `&group_id=${groupID}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((response) => {
        if (response.status === 200) {
          return response.json().then((result) => {
            return result.hits;
          });
        } else {
          return Error('Unable to search group members');
        }
      });
    });
  }

  static getFollows = (id, relation, offset) => {
    if (!id) return Error('User ID is required');
    const url =
      DOMAIN + `api/v1/user/${id}/follow?relation=${relation}&offset=${offset}`;
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache',
        },
      })
        .then((response) => {
          if (response.ok) {
            return response
              .json()
              .then((result) => {
                return result.data.results;
              })
              .catch((error) => {
                console.warn(error);
              });
          } else {
            console.warn(response);
          }
        })
        .catch((error) => {
          console.warn(error);
        });
    });
  };

  static getFollowSummary = (id) => {
    const url = DOMAIN + `api/v1/user/${id}/follow/summary`;
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache',
        },
      })
        .then((response) => {
          if (response.ok) {
            return response
              .json()
              .then((result) => {
                return result.data;
              })
              .catch((error) => {
                console.error(error);
              });
          } else {
            console.error(response);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    });
  };

  static getFollowingRelationships = (source, target) => {
    const url = DOMAIN + `api/v1/user/${source}/follow/${target}`;
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => {
          if (response.ok) {
            return response
              .json()
              .then((result) => {
                return result.data;
              })
              .catch((error) => {
                console.error(error);
              });
          } else {
            console.error(response);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    });
  };

  static followUser(target_id) {
    return authentication.getAccessToken().then((accessToken) => {
      const url =
        DOMAIN +
        `api/v1/user/${userProfile.getUserProfile().id}/follow/${target_id}`;
      return fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then(jsonOrThrow)
        .then((json) => {
          return json;
        });
    });
  }

  static unfollowUser(target_id) {
    return authentication.getAccessToken().then((accessToken) => {
      const url =
        DOMAIN +
        `api/v1/user/${userProfile.getUserProfile().id}/follow/${target_id}`;
      return fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then(jsonOrThrow)
        .then((json) => {
          return json;
        });
    });
  }

  static getMediaUploadURL(data) {
    let updatedData = JSON.parse(data);
    // add the date to images to prevent overwritten of images with the same name
    updatedData.media_filename = `${new Date().toISOString()}-${
      updatedData.media_filename
    }`;
    return authentication.getAccessToken().then((accessToken) => {
      const url = DOMAIN + `api/v1/media_upload_url`;
      return fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      }).then((result) => {
        if (result.ok) return result.json();
        else throw new Error('Error uploading image');
      });
    });
  }

  static putMediaUpload(url, data) {
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-ms-blob-type': 'BlockBlob',
      },
      body: data,
    }).then((result) => {});
  }

  // Notifications
  static getNotifications = (offset) => {
    let url = `${DOMAIN}api/v1/user/${
      userProfile.getUserProfile().id
    }/notifications?items=25`;
    if (offset) url += `&offset=${offset}`;
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(url, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then((response) => {
        if (response.ok) return response.json();
        else throw new Error('Error retrieving Notifications');
      });
  };

  static getUnseenNotifications = () => {
    const url = `${DOMAIN}api/v1/user/${
      userProfile.getUserProfile().id
    }/notifications/check`;
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(url, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then((response) => {
        if (response.ok) return response.json();
        else {
          console.warn(response);
          throw new Error('Error retrieving unseen Notifications');
        }
      });
  };

  // Reactions
  // This is used on a single post. Client side it is used to retrieve updated reactions on pull refresh
  static getReactions = (creatorID, streamID, offset, kind) => {
    let url = `${DOMAIN}api/v1/user/${creatorID}/reactions/${streamID}`;
    if (offset) url += `?offset=${offset}`;
    if (kind) url += `${offset ? '&' : '?'}kind=${kind}`; // if both optional params are passed, should be &
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(url, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache', //not sure if needed, but not sure if side effects with this get
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then((response) => {
        if (response.ok) return response.json();
        else {
          console.warn(response);
          throw new Error('Error retrieving Reactions');
        }
      });
  };

  static postReaction = (creatorID, streamID, data) => {
    if (!JSON.parse(data).kind) throw new Error('Reaction Kind is required');
    const url = `${DOMAIN}api/v1/user/${creatorID}/reactions/${streamID}`;
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: data,
        });
      })
      .then((response) => {
        return response.json().then((result) => {
          if (response.ok) return result.data;
          else throw result.error.message;
        });
      });
  };

  // will be used to "unlike" a post or delete a comment
  static deleteReaction = (creatorID, streamID, data, commentID) => {
    if (!JSON.parse(data).kind) throw new Error('Reaction Kind is required');
    let url = `${DOMAIN}api/v1/user/${creatorID}/reactions/${streamID}`;
    if (commentID) url += `/${commentID}`;
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(url, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: data,
        });
      })
      .then((response) => {
        return response.json().then((result) => {
          if (response.ok) return result.data;
          else throw result.error.message;
        });
      });
  };

  static updateReaction = (creatorID, streamID, data, commentID) => {
    if (JSON.parse(data).kind != 'comment')
      throw new Error('Comment Kind is required');
    let url = `${DOMAIN}api/v1/user/${creatorID}/reactions/${streamID}/${commentID}`;
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(url, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: data,
        });
      })
      .then((response) => {
        return response.json().then((result) => {
          if (response.ok) return result.data;
          else throw result.error.message;
        });
      });
  };

  // Event Reactions
  static getEventReactions = (eventID, streamID) => {
    const url = `${DOMAIN}api/v1/mobile_event/${eventID}/reactions/${streamID}`;
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(url, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache', //not sure if needed, but not sure if side effects with this get
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then((response) => {
        if (response.ok) return response.json();
        else {
          console.warn(response);
          throw new Error('Error retrieving Reactions');
        }
      });
  };

  static postEventReaction = (eventID, streamID, data) => {
    if (!JSON.parse(data).kind) throw new Error('Reaction Kind is required');
    const url = `${DOMAIN}api/v1/mobile_event/${eventID}/reactions/${streamID}`;
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: data,
        });
      })
      .then((response) => {
        if (response.ok) return;
        else {
          return response.json().then((result) => {
            throw result.error.message;
          });
        }
      });
  };

  // will be used to "unlike" a post
  static deleteEventReaction = (eventID, streamID, data) => {
    if (!JSON.parse(data).kind) throw new Error('Reaction Kind is required');
    const url = `${DOMAIN}api/v1/mobile_event/${eventID}/reactions/${streamID}`;
    return authentication
      .getAccessToken()
      .then((accessToken) => {
        return fetch(url, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: data,
        });
      })
      .then((response) => {
        if (response.ok) return;
        else {
          return response.json().then((result) => {
            throw result.error.message;
          });
        }
      });
  };

  static updatePost = (data, id) => {
    const url = `${DOMAIN}api/v1/user/${
      userProfile.getUserProfile().id
    }/user_feed/${id}`;
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: data,
      }).then((response) => {
        if (response.status === 200) return response.json();
        else return Error('Unable to update post.');
      });
    });
  };

  // reporting

  static reportUser(reportedID, reporterID) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(`${DOMAIN}api/v1/report/user/${reportedID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: reporterID,
      })
        .then((response) => {
          if (response.ok) return response.json();
          else throw new Error('Error reporting user');
        })
        .catch((err) => {
          console.warn(err);
          throw new Error('Error reporting user');
        });
    });
  }

  static reportUserPost = (reportedID, reportedStreamID, reporterUserID) => {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/report/user/${reportedID}/post/${reportedStreamID}`;
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: reporterUserID,
      }).then((result) => {
        if (result.ok) return;
        else throw new Error('Error reporting user post');
      });
    });
  };

  static reportEvent = (eventID, reporterUserID) => {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/report/event/${eventID}`;
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: reporterUserID,
      }).then((result) => {
        if (result.ok) return;
        else throw new Error('Error reporting the event');
      });
    });
  };

  static reportEventPost = (eventID, streamID, reporterUserID) => {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/report/event/${eventID}/post/${streamID}`;
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: reporterUserID,
      }).then((result) => {
        if (result.ok) return;
        else throw new Error('Error reporting the event post');
      });
    });
  };

  static reportUserComment = (reportedID, reactionID, reporterUserID) => {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/report/user/${reportedID}/reaction/${reactionID}`;
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: reporterUserID,
      }).then((result) => {
        if (result.ok) return;
        else throw new Error('Error reporting the comment');
      });
    });
  };

  // currently unused
  static reportGroup = (groupID, reporterUserID) => {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/report/group/${groupID}`;
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: reporterUserID,
      }).then((result) => {
        if (result.ok) return;
        else throw new Error('Error reporting the group');
      });
    });
  };

  static reportGroupPost = (groupID, streamID, reporterUserID) => {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/report/group/${groupID}/post/${streamID}`;
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: reporterUserID,
      }).then((result) => {
        if (result.ok) return;
        else throw new Error('Error reporting the group');
      });
    });
  };

  // groups
  static joinGroup = (groupId) => {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/group/${groupId}/user/${
        userProfile.getUserProfile().id
      }`;
      return fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((result) => {
        if (result.ok) return;
        else throw new Error('Unable to join the group');
      });
    });
  };

  static leaveGroup = (groupId) => {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/group/${groupId}/user/${
        userProfile.getUserProfile().id
      }`;
      return fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((result) => {
        if (result.ok) return;
        else throw new Error('Unable to leave the group');
      });
    });
  };

  // more to do
  // type can be "nearby", "my", "favorites"
  static retrieveGroups = (type, nearbyData) => {
    if (!type) throw new Error('Type is required to retrieve groups');
    let url = `${DOMAIN}api/v1/group?type=${type}`;
    if (type === 'nearby' && nearbyData) {
      // nearby data is either a lat/long object, or chapter id
      if (nearbyData.chapter_id) url += `&chapter_id=${nearbyData.chapter_id}`;
      else url += `&lat=${nearbyData.lat}&long=${nearbyData.long}`;
    }
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache',
        },
      }).then((result) => {
        if (result.ok) return result.json();
        else throw new Error('Unable to retrieve groups');
      });
    });
  };

  static getGroup = (groupId) => {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/group/${groupId}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache',
        },
      }).then((result) => {
        if (result.ok) return result.json();
        else throw new Error('Unable to load the group');
      });
    });
  };

  // check if the user has joined and favorited this group
  static getGroupRelation = (userId, groupId) => {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/user/${userId}/group/${groupId}/relation`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((result) => {
        if (result.ok) return result.json();
        else throw new Error('Unable to load the group relationship');
      });
    });
  };

  /**
   * Lookup groups
   * @param {string} input - user input, expecting a group name
   * @param {object} locationObj - an object containing either the lat and long, or the chapter_id associated with the user when lat/long cannot be accessed
   * @param {int} offset - which iteration of results should be retrieved, starting at 0
   */

  static searchGroups = (input, locationObj, offset) => {
    return authentication.getAccessToken().then((accessToken) => {
      let url = `${DOMAIN}api/v1/search/group?name=${input}&user_id=${
        userProfile.getUserProfile().id
      }`;
      // if (locationObj.chapter_id) url += `&chapter_id=${locationObj.chapter_id}`;
      // else url += `&lat=${locationObj.lat}&long=${locationObj.long}`;
      // if (offset) url += `&offset=${offset}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache', // cache disabled to ensure list shows updated groups joined/left
        },
      }).then((result) => {
        if (result.ok) return result.json();
        else throw new Error('Unable to find groups');
      });
    });
  };

  static retrieveGroupMembers = (groupId, page) => {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/group/${groupId}/members?page=${page}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((result) => {
        if (result.ok) return result.json();
        else throw new Error('Unable to retrieve group member list');
      });
    });
  };

  static getGroupFeed(id, offset) {
    return authentication.getAccessToken().then((accessToken) => {
      let url = DOMAIN + `api/v1/group/${id}/timeline`;
      if (offset) url += `?offset=${offset}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache',
        },
      }).then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 404) {
          return [];
        } else {
          return Error('Unable to retrieve Group Feed');
        }
      });
    });
  }

  static createGroupPost(data, id) {
    return authentication.getAccessToken().then((accessToken) => {
      const url = DOMAIN + `api/v1/group/${id}/timeline`;
      return fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: data,
      }).then((response) => {
        if (response.status === 200) return response.json();
        else return Error('Unable to post to group.');
      });
    });
  }

  static isGroupAdmin(groupId) {
    return authentication.getAccessToken().then((accessToken) => {
      const url = DOMAIN + `api/v1/group/${groupId}/isAdmin`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache', // cache disabled to ensure it shows updated value
        },
      }).then((response) => {
        if (response.status === 200) return response.json();
        else
          throw Error('Unable to retrieve if user is an admin of the group.');
      });
    });
  }

  static deleteGroupPost(groupID, streamID) {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/group/${groupID}/timeline/${streamID}`;
      return fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then(jsonOrThrow)
        .then((json) => {
          return json;
        });
    });
  }

  // stripe

  static putPaymentIntent(data) {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/stripe`;
      return fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: data,
      }).then((response) => {
        if (response.ok) return response.json();
        else {
          return response.json().then((error) => {
            throw error;
          });
        }
      });
    });
  }

  static getNotificationSettings() {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/user/${userProfile.getUserProfile().id}/push_settings`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ).then((result) => {
        if (result.ok) {
          return result.json();
        } else throw new Error('Error retrieving notification settings');
      });
    });
  }

  static updateNotificationSettings(data) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/user/${userProfile.getUserProfile().id}/push_settings`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            Authorization: `Bearer ${accessToken}`,
          },
          body: data,
        },
      ).then((result) => {
        if (result.ok) {
          return result.json();
        } else throw new Error('Error updating notification settings');
      });
    });
  }

  static getChallenges(urlParams) {
    return authentication.getAccessToken().then((accessToken) => {
      let url = `${DOMAIN}api/v1/user/${
        userProfile.getUserProfile().id
      }/challenge`;
      if (urlParams) url += urlParams;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'cache-control': 'no-cache', // ensure the user sees their newly joined challenge
        },
      }).then((result) => {
        if (result.ok) return result.json();
        else throw new Error('Error retrieving challenges');
      });
    });
  }

  static getChallenge(challengeId) {
    return authentication.getAccessToken().then((accessToken) => {
      let url = `${DOMAIN}api/v1/challenge/${challengeId}?after=${moment().toISOString()}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).then((result) => {
        if (result.ok) return result.json();
        else throw new Error('Error retrieving challenge');
      });
    });
  }

  static getChallengeParticipants(challengeId, page = 0) {
    return authentication.getAccessToken().then((accessToken) => {
      let url = `${DOMAIN}api/v1/challenge/${challengeId}/participants?page=${page}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache',
        },
      }).then((result) => {
        if (result.ok) return result.json();
        else if (result.status === 404) return {participants: []};
        else throw new Error('Error retrieving challenge participants');
      });
    });
  }

  static getChallengeFollowingParticipants(challengeIds) {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/user/${
        userProfile.getUserProfile().id
      }/followed_participants?challenge_ids=${challengeIds}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache',
        },
      }).then((result) => {
        if (result.ok) return result.json();
        else if (result.status === 404) return [{attendees: []}];
        else throw new Error('Error retrieving followers for challenges');
      });
    });
  }

  static joinChallenge(challengeId) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/challenge/${challengeId}/participants/${
          userProfile.getUserProfile().id
        }`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ).then((result) => {
        if (!result.ok) throw new Error('Error joining challenge');
      });
    });
  }

  static leaveChallenge(challengeId) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/challenge/${challengeId}/participants/${
          userProfile.getUserProfile().id
        }`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ).then((result) => {
        if (!result.ok) throw new Error('Error joining challenge');
      });
    });
  }

  static hasJoinedChallenge(challengeId) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/challenge/${challengeId}/participants/${
          userProfile.getUserProfile().id
        }`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Cache-Control': 'no-cache',
          },
        },
      ).then((result) => {
        if (result.status === 404) return false;
        else if (result.status === 200) return true;
        else throw new Error('Error getting if user has joined the challenge');
      });
    });
  }

  // checking if the current has earned the badge for a specific challenge. Returned badge info is not needed.
  static getBadgeStatus(challengeId) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/user/${
          userProfile.getUserProfile().id
        }/challenge/${challengeId}/badges`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Cache-Control': 'no-cache',
          },
        },
      ).then((result) => {
        if (result.status === 404) return false;
        else if (result.status === 200) return true;
        else
          throw new Error(
            'Unable to determine if the user has acquired the badge for the associated challenge',
          );
      });
    });
  }

  static putWorkout(eventId, data) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/mobile_event/${eventId}/workout/${
          userProfile.getUserProfile().id
        }`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: data,
        },
      ).then((result) => {
        if (result.ok) return;
        else throw new Error('Error updating workout');
      });
    });
  }

  static getWorkout(eventId) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/mobile_event/${eventId}/workout/${
          userProfile.getUserProfile().id
        }`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Cache-Control': 'no-cache',
          },
        },
      ).then((result) => {
        if (result.ok) return result.json();
        else throw new Error('Error retrieving workout');
      });
    });
  }

  static getUserWorkouts() {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/user/${userProfile.getUserProfile().id}/workout`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Cache-Control': 'no-cache',
          },
        },
      ).then((result) => {
        if (result.ok) return result.json();
        else throw new Error('Error retrieving user workouts');
      });
    });
  }

  static deleteWorkout(eventId) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/mobile_event/${eventId}/workout/${
          userProfile.getUserProfile().id
        }`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ).then((result) => {
        if (result.ok) return;
        else throw new Error('Error deleting workout');
      });
    });
  }

  static getLeaderboardRank(challengeId) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/leaderboard/challenge/${challengeId}/user/${
          userProfile.getUserProfile().id
        }/rank`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Cache-Control': 'no-cache',
          },
        },
      ).then((result) => {
        if (result.ok) return result.json();
        else throw new Error('Error retrieving user ranking');
      });
    });
  }

  static getLeaderboardTop(challengeId) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/leaderboard/challenge/${challengeId}/top25`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Cache-Control': 'no-cache',
          },
        },
      ).then((result) => {
        if (result.ok) return result.json();
        else throw new Error('Error retrieving leaderboard top 25');
      });
    });
  }

  static getLeaderboardCentered(challengeId) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/leaderboard/challenge/${challengeId}/user/${
          userProfile.getUserProfile().id
        }/centered`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Cache-Control': 'no-cache',
          },
        },
      ).then((result) => {
        if (result.ok) return result.json();
        else throw new Error('Error retrieving user centered 25');
      });
    });
  }

  static getChallengeFeed(id, offset) {
    return authentication.getAccessToken().then((accessToken) => {
      let url = `${DOMAIN}api/v1/challenge/${id}/timeline`;
      if (offset) url += `?offset=${offset}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache',
        },
      }).then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 404) {
          return [];
        } else {
          return Error('Unable to retrieve Challenge Feed');
        }
      });
    });
  }

  static createChallengePost(data, id) {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/challenge/${id}/timeline`;
      return fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: data,
      }).then((response) => {
        if (response.status === 200) return response.json();
        else return Error('Unable to post to challenge.');
      });
    });
  }

  static deleteChallengePost(id, streamId) {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/challenge/${id}/timeline/${streamId}`;
      return fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }).then((response) => {
        if (response.status === 200) return;
        else return Error('Unable to delete post.');
      });
    });
  }

  static getUserBadges(userId) {
    return authentication.getAccessToken().then((accessToken) => {
      let url = `${DOMAIN}api/v1/user/${userId}/badges`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache',
        },
      }).then((result) => {
        if (result.ok) return result.json();
        else throw new Error('Error retrieving user badges');
      });
    });
  }

  static getUserMetrics() {
    return authentication.getAccessToken().then((accessToken) => {
      const d = new Date();
      let url = `${DOMAIN}api/v1/user/${
        userProfile.getUserProfile().id
      }/workout/metrics?month=${d.getFullYear()}-${d.getMonth() + 1}`;
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache',
        },
      }).then((result) => {
        if (result.ok) return result.json();
        else throw new Error('Error retrieving user year to date metrics');
      });
    });
  }

  static deleteAccount(data) {
    return authentication.getAccessToken().then((accessToken) => {
      const url = `${DOMAIN}api/v1/user/${userProfile.getUserProfile().id}`;
      return fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: data,
      }).then((response) => {
        if (response.ok) {
          return true;
        } else if (response.status === 400) {
          return false;
        } else {
          throw new Error('Unable to delete account.');
        }
      });
    });
  }

  static blockPost(activityID) {
    return authentication.getAccessToken().then((accessToken) => {
      return fetch(
        `${DOMAIN}api/v1/user/${
          userProfile.getUserProfile().id
        }/block_post/${activityID}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ).then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error('Error blocking post.');
        }
      });
    });
  }
}
