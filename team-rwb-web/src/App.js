import React from 'react';
import './App.css';

import BuildInfo from './components/BuildInfo';

import NavigationWrapper from './components/navigation/NavigationWrapper';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_IDS } from '../../shared/constants/APIKeys-obfuscated';

// import TagManager from 'react-gtm-module'
// const tagManagerArgs = {
//   gtmId: 'GTM-KBB52VD'
// }
// TagManager.initialize(tagManagerArgs)

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_IDS.android_webclient_id}>
      <div className="App">
        <BuildInfo />
        <NavigationWrapper />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
