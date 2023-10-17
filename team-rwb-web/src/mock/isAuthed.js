function promiseDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const fakeAuth = {
  isAuthenticated: true,
  authenticate() {
    this.isAuthenticated = true;
    return promiseDelay(500).then(() => {
      return this.isAuthenticated;
    });
  },
  signout() {
    this.isAuthenticated = false;
    return promiseDelay(500).then(() => {
      return this.isAuthenticated;
    });
  },
  getAccessToken() {
    return promiseDelay(500).then(() => {
      if (this.isAuthenticated) {
        return 'mock access token';
      } else throw new Error();
    });
  },
};

export default fakeAuth;
