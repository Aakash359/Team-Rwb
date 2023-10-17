import AsyncStorage from './StorageHandler';
import { isObject } from '../utils/Helpers';
// Device location if they use current location or edit location from EventsListView
class UserLocation {
    locale = '';
    street = '';
    city = '';
    state = '';
    zip = '';
    lat = 0;
    long = 0;
    _setUserLocation(data) {
        const { street, city, state, zip, lat, long } = data;
        this.street = street;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.lat = lat;
        this.long = long;
    }
    saveToUserLocation(value) {
        if (!value || !isObject(value)) {
            throw new Error("value must be of type Object");
        }
        this._setUserLocation(value);
        return new Promise((resolve) => {
            try {
                AsyncStorage.setItem('user_location', JSON.stringify(value)).then(resolve);
            }
            catch (error) {
                throw Error(error);
            }
        });
    }
    loadUserLocation() {
        return AsyncStorage.getItem('user_location').then((value) => {
            if (!value)
                return false;
            try {
                this._setUserLocation(JSON.parse(data));
                return this.getUserLocation();
            }
            catch (error) {
                throw Error(error);
            }
        });
    }
    getUserLocation() {
        const { street, city, state, zip, lat, long, } = this;
        return {
            street,
            city,
            state,
            zip,
            lat,
            long
        };
    }
    deleteUserLocation() {
        this.locale = '';
        this.street = '';
        this.city = '';
        this.state = '';
        this.zip = '';
        this.lat = 0;
        this.long = 0;
        return AsyncStorage.removeItem('user_location');
    }
}

export let userLocation = new UserLocation();
