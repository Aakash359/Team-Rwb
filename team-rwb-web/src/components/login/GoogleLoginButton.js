import React from 'react';
import styles from './Login.module.css';
import {useGoogleLogin} from '@react-oauth/google';

// SVGs
import GoogleLoginIcon from '../svgs/GoogleLoginIcon';

function GoogleLoginButton({handleLogin}) {
    const login = useGoogleLogin({
        onSuccess: tokenResponse => handleLogin(tokenResponse),
      });      

    return (
        <div onClick={() => login()}>
            <GoogleLoginIcon className={styles.socialLoginIcons} />
        </div>
    );
}

export default GoogleLoginButton;