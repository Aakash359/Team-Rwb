class ClientCredentialsToken {
    accessToken = null;
    getAccessToken() {
        return this.accessToken;
    }
    setAccessToken(accessToken) {
        this.accessToken = accessToken;
        return this.getAccessToken();
    }
}

export let clientCredentialsToken = new ClientCredentialsToken();
