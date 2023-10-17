'use strict';

import { ONEALL_DOMAIN, DOMAIN } from '../constants/URLs';
import { rwbApi } from './api';
import { authentication } from '../models/Authentication';
import { userProfile } from '../models/UserProfile';
import { jsonOrThrow } from '../utils/Helpers';

// https://docs.oneall.com/api/resources/users/import-user/

// user token key varies depending on the provider
const OAputUser = (provider_key, user_token, token_key, access_token_secret ) => {

  let access_token = null;
  let id_token = null;
  if (provider_key === 'apple') id_token = {'value': token_key};
  else access_token = {'key':  token_key};

  if (access_token_secret !== "") {
    Object.assign(
      id_token ? id_token : access_token,
      {
        secret: access_token_secret
      }
    );
  }

  let identity = {
    source: {
      key: provider_key,
    }
  };

  if (id_token)
    identity.source.id_token = id_token;
  else identity.source.access_token = access_token;

  let user = Object.assign({},
    user_token === "" ? {} : { user_token },
    { identity },
  );

  let payload = {
    request: {
      user,
    }
  };
  const body = JSON.stringify(payload);
  return rwbApi.getClientCredentialsToken().then((clientCreds) => {
    return fetch(`${DOMAIN}api/v1/oneall_proxy`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${clientCreds.access_token}`,
        'Content-Type': `application/json`,
        'Content-Length': body.length,
      },
      body: body,
    });
  }).catch((err) => {
    console.warn("err: ", err);
  });

};

export const OAcreateUser = (provider_key, user_token, access_token_key, access_token_secret) => {
  return OAputUser(provider_key, user_token, access_token_key, access_token_secret)
    .then(jsonOrThrow)
    .then((response) => {
      const { user } = response.response.result.data;
      const userToken = user.user_token;
      const identityToken = user.identity.identity_token;
      return rwbApi.createNewUserFromOneAll(userToken, identityToken)
        .then(jsonOrThrow)
        .then((response) => {
          authentication.setAuthentication(response);
          userProfile.setUserId(response.user_id);
          return response.user_id;
        })
        .then(rwbApi.getUser);
    })
    .catch((error) => {
      throw error;
    });
};

export const OAAppleCreateUser = (id_token) => {
  return (OAputUser('apple', '', id_token, '' ))
    .then(jsonOrThrow)
    .then(response => {
      const { user } = response.response.result.data;
      const userToken = user.user_token;
      const identityToken = user.identity.identity_token;
      return rwbApi.createNewUserFromOneAll(userToken, identityToken)
      .then(jsonOrThrow)
      .then(response => {
        authentication.setAuthentication(response);
        userProfile.setUserId(response.user_id)
        return response.user_id;
      })
    })
    .catch(error => {
      throw error;
    });

}
