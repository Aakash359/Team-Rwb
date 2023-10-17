import React from 'react';
import {View, TouchableOpacity, Alert} from 'react-native';
import appleAuth, {
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
  AppleAuthCredentialState,
  AppleAuthError,
} from '@invertase/react-native-apple-authentication';
import {OAAppleCreateUser} from '../../shared/apis/oneall-api';
import AppleLoginIcon from '../../svgs/AppleLoginIcon';
import NavigationService from '../models/NavigationService';
import {rwbApi} from '../../shared/apis/api';

async function onAppleButtonPress(props) {
  // performs login request
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: AppleAuthRequestOperation.LOGIN,
    requestedScopes: [
      AppleAuthRequestScope.EMAIL,
      AppleAuthRequestScope.FULL_NAME,
    ],
  });

  // get current authentication state for user
  // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
  const credentialState = await appleAuth.getCredentialStateForUser(
    appleAuthRequestResponse.user,
  );

  // use credentialState response to ensure the user is authenticated
  if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
    // user is authenticated
    const {identityToken, fullName} = appleAuthRequestResponse;
    const nameObj = {
      first_name: fullName.givenName,
      last_name: fullName.familyName,
    };
    props.setLoading(true);
    OAAppleCreateUser(identityToken)
      .then(() => {
        rwbApi.putUser(JSON.stringify(nameObj)).then((response) => {
          props.setLoading(false);
          const {profile_completed, email_verified} = response;
          if (!email_verified) {
            NavigationService.navigate('VerifyEmail');
          } else if (!profile_completed) {
            NavigationService.navigate('PersonalInfo');
          } else {
            NavigationService.navigate('App');
          }
        });
      })
      .catch((err) => {
        props.setLoading(false);
        Alert.alert('Team RWB', 'There was a problem, please try again later.');
        console.warn(err);
      });
  }
  // other options are REVOKED, NOT_FOUND, AND TRANSFERRED
  else {
    Alert.alert('Team RWB', 'Your account is not found or authorized');
  }
}

export default function AppleLoginButton(props) {
  return (
    <View>
      <TouchableOpacity onPress={() => onAppleButtonPress(props)}>
        <AppleLoginIcon width="30" height="30" />
      </TouchableOpacity>
    </View>
  );
}
