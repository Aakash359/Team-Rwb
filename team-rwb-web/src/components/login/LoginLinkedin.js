import React, {Component} from 'react';
import {ONEALL_CALLBACK} from '../../../../shared/constants/URLs';
import LinkedInLoginIcon from '../svgs/LinkedInLoginIcon';
import {v4} from 'uuid';

const getURLWithQueryParams = (base, params) => {
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return `${base}?${query}`;
};

// const getLinkedinURL = (clientId, state, scope, callback) => {
//   const current = callback; // encodeURIComponent(window.location.href);
//   const base =
//     'https://www.linkedin.com/oauth/v2/authorization?response_type=code&';

//   const fullScope =
//     scope && scope.length
//       ? `&scope=${encodeURIComponent(scope.join(' '))}`
//       : '';

//   return `${base}client_id=${clientId}&redirect_uri=${current}&state=${state}${fullScope}`;
// };

const LINKEDIN_STATE = 'random_string';

class LoginLinkedin extends Component {
  state = {
    authState: v4(),
  };
  componentDidMount() {
    this.restart();
  }

  restart = () => {
    if (!localStorage) return; // this is used to prevent an issue on android with push notifications
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUri = localStorage.linkedInReactRedirectUri;
    const previousState = localStorage.linkedInReactState;

    localStorage.linkedInReactState = '';
    localStorage.linkedInReactRedirectUri = '';

    const newState = urlParams.get('state');
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    let newURL = window.location.pathname;
    urlParams.delete('state');
    urlParams.delete('error');
    urlParams.delete('error_description');
    urlParams.delete('code');
    if (urlParams.toString()) {
      newURL = newURL + '?' + urlParams.toString();
    }

    window.history.replaceState(null, null, newURL);

    if (error) {
      this.props.callback(error, null, null);
    } else if (redirectUri && code && previousState === newState) {
      this.props.callback(null, code, redirectUri);
    }
  };

  start = () => {
    const {clientId, scope, callback} = this.props;
    // const state = Math.random().toString(36).substring(7);
    // localStorage.linkedInReactState = state;
    // localStorage.linkedInReactRedirectUri = window.location.href;
    // window.open(
    //   getLinkedinURL(clientId, state, scope, ONEALL_CALLBACK),
    //   'Login with LinkedIn',
    //   'height=600,width=400',
    // ); // build url out of clientid, scope and state
    // console.log('localStorage', localStorage);

    const LINKEDIN_SCOPE = 'r_liteprofile r_emailaddress';
    const LINKEDIN_REDIRECT = ONEALL_CALLBACK;
    const LINKEDIN_CLIENT_ID = clientId;

    const LINKEDIN_URL = getURLWithQueryParams(
      'https://www.linkedin.com/oauth/v2/authorization',
      {
        response_type: 'code',
        client_id: LINKEDIN_CLIENT_ID,
        redirect_uri: LINKEDIN_REDIRECT,
        state: this.state.authState, //LINKEDIN_STATE,
        scope: LINKEDIN_SCOPE,
      },
    );

    this.popup = window.open(LINKEDIN_URL, '_blank', 'width=600, height=600');
    window.addEventListener('message', this.receiveLinkedInMessage);
  };

  receiveLinkedInMessage = ({origin, data: {state, code, error, ...rest}}) => {
    console.log('code before', code);

    if (origin !== window.location.origin || state !== LINKEDIN_STATE) return;
    console.log('code', code);

    // if (code) {
    //   this.props.receiveProviderToken({
    //     provider: PROVIDER.LINKEDIN,
    //     token: code,
    //   });
    // } else if (
    //   error &&
    //   !['user_cancelled_login', 'user_cancelled_authorize'].includes(error)
    // ) {
    //   this.props.failToReceiveProviderToken({
    //     provider: PROVIDER.LINKEDIN,
    //     error: {error, ...rest},
    //   });
    // }
    this.popup.close();
  };

  componentWillUnmount() {
    window.removeEventListener('message', this.receiveLinkedInMessage);
    this.popup && this.popup.close();
  }

  render() {
    return (
      <div onClick={this.start}>
        <LinkedInLoginIcon className={this.props.className} />
      </div>
    );
  }
}

export default LoginLinkedin;
