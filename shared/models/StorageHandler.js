'use strict';

const asyncLocalStorage = {
    setItem: function (key, value) {
        return Promise.resolve().then(() => {
            // The warning: if Unhandled Rejection (QuotaExceededError): Failed to execute 'setItem' on 'Storage': Setting the value of 'user_profile' exceeded the quota.
            // happens if the user has an invalid photo that is too large. This issue has been resolved so it should not happen, but if new photos ever get added
            // and this error pops up, it is because a new image was uploaded incorrectly and is too large
            window.localStorage.setItem(key, value);
        });
    },
    getItem: function (key) {
        return Promise.resolve().then(() => {
            return window.localStorage.getItem(key);
        });
    },
    removeItem: function (key) {
        return Promise.resolve().then(() => {
            return window.localStorage.removeItem(key);
        })
    },
    clear: function () {
        return Promise.resolve().then(() => {
            console.log('This operation not used throughout codebase.');
            return window.localStorage.clear();
        })
    }
};

export default asyncLocalStorage;
