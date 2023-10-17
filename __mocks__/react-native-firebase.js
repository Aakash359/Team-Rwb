const firebase = {
    analytics: () => {
        let obj = {};
        obj.setAnalyticsCollectionEnabled = () => (() => {});
        obj.logEvent = () => {};
        return obj;
    }
};


export default firebase;
