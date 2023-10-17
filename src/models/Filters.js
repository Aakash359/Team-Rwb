/**
 * Exports a singleton containing getters and setters for Team RWB Event search filters
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_LOCAL_OPTIONS,
  DEFAULT_VIRTUAL_OPTIONS,
} from '../../shared/constants/DefaultFilters';

class Filters {
  hasRetrieved = false;
  eventDistance = DEFAULT_LOCAL_OPTIONS.eventDistance;
  eventDate = DEFAULT_LOCAL_OPTIONS.eventDate;
  eventHost = DEFAULT_LOCAL_OPTIONS.eventHost;
  sortBy = DEFAULT_LOCAL_OPTIONS.sortBy;
  eventCategory = DEFAULT_LOCAL_OPTIONS.eventCategory;
  eventGroupOption = DEFAULT_LOCAL_OPTIONS.eventGroupOption;
  eventFilterNavTab = DEFAULT_LOCAL_OPTIONS.eventFilterNavTab;

  // virtual specific filters
  virtualSubtype = DEFAULT_VIRTUAL_OPTIONS.virtualSubtype;
  virtualEventDate = DEFAULT_VIRTUAL_OPTIONS.virtualEventDate;
  virtualSortBy = DEFAULT_VIRTUAL_OPTIONS.virtualSortBy;
  virtualEventCategory = DEFAULT_VIRTUAL_OPTIONS.virtualEventCategory;
  virtualEventGroupOption = DEFAULT_VIRTUAL_OPTIONS.virtualEventGroupOption;
  virtualTime = DEFAULT_VIRTUAL_OPTIONS.virtualTime;

  _retrieveFilters = () => {
    return AsyncStorage.getItem('filters')
      .then(JSON.parse)
      .then((storedFilters) => {
        if (storedFilters) {
          this.eventDistance =
            storedFilters.eventDistance || this.eventDistance;
          this.eventDate = storedFilters.eventDate || this.eventDate;
          this.eventHost = storedFilters.eventHost || this.eventHost;
          this.eventFilterNavTab =
            storedFilters.eventFilterNavTab || this.eventFilterNavTab;
          this.eventGroupOption =
            storedFilters.eventGroupOption || this.eventGroupOption;
          this.sortBy = storedFilters.sortBy || this.sortBy;
          this.eventCategory =
            storedFilters.eventCategory || this.eventCategory;
          // virtual specific filters
          this.virtualSubtype =
            storedFilters.virtualSubtype || this.virtualSubtype;
          this.virtualEventDate =
            storedFilters.virtualEventDate || this.virtualEventDate;
          this.virtualEventGroupOption =
            storedFilters.virtualEventGroupOption ||
            this.virtualEventGroupOption;
          this.virtualSortBy =
            storedFilters.virtualSortBy || this.virtualSortBy;
          this.virtualEventCategory =
            storedFilters.virtualEventCategory || this.virtualEventCategory;
          this.virtualTime = storedFilters.virtualTime || this.virtualTime;
        }
        this.hasRetrieved = true;
      })
      .catch((error) => {});
  };

  /**
   * Sets a new filter onto the singleton, then saves to AsyncStorage
   *
   * @param {object} newFilters Object containing new filters.
   */
  setFilter = (newFilters) => {
    this.getFilters().then((previousFilters) => {
      const assignedFilters = Object.assign(previousFilters, newFilters);
      AsyncStorage.setItem('filters', JSON.stringify(assignedFilters))
        .then(() => {
          this.eventCategory =
            assignedFilters.eventCategory || this.eventCategory;
          this.eventDate = assignedFilters.eventDate || this.eventDate;
          this.eventDistance =
            assignedFilters.eventDistance || this.eventDistance;
          this.eventHost = assignedFilters.eventHost || this.eventHost;
          this.sortBy = assignedFilters.sortBy || this.sortBy;
          this.eventFilterNavTab =
            assignedFilters.eventFilterNavTab || this.eventFilterNavTab;
          this.eventGroupOption =
            assignedFilters.eventGroupOption || this.eventGroupOption;
          // virtual specific filters
          this.virtualEventCategory =
            assignedFilters.virtualEventCategory || this.virtualEventCategory;
          this.virtualEventDate =
            assignedFilters.virtualEventDate || this.virtualEventDate;
          this.virtualSortBy =
            assignedFilters.virtualSortBy || this.virtualSortBy;
          this.virtualSubtype =
            assignedFilters.virtualSubtype || this.virtualSubtype;
          this.virtualEventGroupOption =
            assignedFilters.virtualEventGroupOption ||
            this.virtualEventGroupOption;
          this.virtualTime = assignedFilters.virtualTime || this.virtualTime;
        })
        .catch((error) => {});
    });
  };

  /**
   * Resets a specific "category" saved in filters
   * this is needed because causing setFilter right after one another (after resetting) only allows the last value (activity for local) passed in to be saved
   * Expects a type ("local" or "virtual") to determine which to reset
   *
   * @returns {void}
   */
  resetFilters = (type) => {
    if (type !== 'local' && type !== 'virtual')
      throw new Error("Expecting type 'local' or 'virtual'");
    const defaultFilterObj =
      type === 'local' ? DEFAULT_LOCAL_OPTIONS : DEFAULT_VIRTUAL_OPTIONS;
    this.getFilters()
      .then((previousFilters) => {
        const allFiltersObj = Object.assign(previousFilters, defaultFilterObj);
        AsyncStorage.setItem('filters', JSON.stringify(allFiltersObj)).then(
          () => {
            if (type === 'local') this.resetLocalFilters();
            else if (type === 'virtual') this.resetVirtualFilters();
          },
        );
      })
      .catch((error) => {});
  };

  /**
   * Returns all saved filters, retrieving them from AsyncStorage if needed.
   *
   * @returns {object} Object with all saved filters
   */
  getFilters = () => {
    if (this.hasRetrieved) {
      const currentFilters = {
        eventDistance: this.eventDistance,
        eventDate: this.eventDate,
        eventHost: this.eventHost,
        sortBy: this.sortBy,
        eventCategory: this.eventCategory,
        eventFilterNavTab: this.eventFilterNavTab,
        eventGroupOption: this.eventGroupOption,
        virtualSubtype: this.virtualSubtype,
        virtualEventDate: this.virtualEventDate,
        virtualSortBy: this.virtualSortBy,
        virtualEventCategory: this.virtualEventCategory,
        virtualEventGroupOption: this.virtualEventGroupOption,
        virtualTime: this.virtualTime,
      };
      return new Promise((resolve) => {
        resolve(currentFilters);
      });
    } else {
      return this._retrieveFilters().then(this.getFilters);
    }
  };

  /**
   * Resets all saved search filters to default.
   *
   * @returns {void}
   */
  deleteFilters = () => {
    this.hasRetrieved = false;
    this.resetLocalFilters();
    this.resetVirtualFilters();
    AsyncStorage.removeItem('filters').catch((error) => {});
  };

  resetLocalFilters = () => {
    this.eventDistance = DEFAULT_LOCAL_OPTIONS.eventDistance;
    this.eventDate = DEFAULT_LOCAL_OPTIONS.eventDate;
    this.eventHost = DEFAULT_LOCAL_OPTIONS.eventHost;
    this.sortBy = DEFAULT_LOCAL_OPTIONS.sortBy;
    this.eventCategory = DEFAULT_LOCAL_OPTIONS.eventCategory;
    this.eventGroupOption = DEFAULT_LOCAL_OPTIONS.eventGroupOption;
    this.eventFilterNavTab = DEFAULT_LOCAL_OPTIONS.eventFilterNavTab;
  };

  resetVirtualFilters = () => {
    this.virtualEventCategory = DEFAULT_VIRTUAL_OPTIONS.virtualEventCategory;
    this.virtualEventDate = DEFAULT_VIRTUAL_OPTIONS.virtualEventDate;
    this.virtualSubtype = DEFAULT_VIRTUAL_OPTIONS.virtualSubtype;
    this.virtualSortBy = DEFAULT_VIRTUAL_OPTIONS.virtualSortBy;
    this.virtualEventGroupOption =
      DEFAULT_VIRTUAL_OPTIONS.virtualEventGroupOption;
    this.virtualTime = DEFAULT_VIRTUAL_OPTIONS.virtualTime;
  };
}

export let filters = new Filters();
