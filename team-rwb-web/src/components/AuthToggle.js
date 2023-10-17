import React, {useState} from 'react';
import fakeAuth from '../mock/isAuthed';

export default function AuthToggle() {
  const [auth, setAuth] = useState(fakeAuth.isAuthenticated);
  function toggleAuth() {
    if (auth) {
      fakeAuth.signout().then((newAuthState) => {
        setAuth(newAuthState);
      });
    } else {
      fakeAuth.authenticate().then((newAuthState) => {
        setAuth(newAuthState);
      });
    }
  }
  return (
    <div>
      <p>Current auth state: {auth ? 'Authenticated' : 'Unauthenticated'}</p>
      <button onClick={toggleAuth}>Toggle Auth State</button>
    </div>
  );
}
