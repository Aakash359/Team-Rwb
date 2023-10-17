import React, {Component} from 'react';
import styles from './SearchGooglePlaces.module.css';
import LocationIcon from './svgs/LocationIcon';
import ClearSearchIcon from './svgs/ClearSearchIcon';
import PlacesAutocomplete from '../react-places-autocomplete/dist/PlacesAutocomplete';

export default class SearchGooglePlaces extends Component {
  shouldComponentUpdate = (nextProps) => {
    const {value, placeholder} = this.props;
    return value !== nextProps.value || placeholder !== nextProps.placeholder;
  };

  isDefaultSearch = () => {
    const {lat} = this.props;
    // lat is originally null, or an int
    // later, it becomes a string.
    return !lat || typeof lat === 'number';
  };

  render() {
    const {
      value,
      placeholder,
      onChange,
      onClearSearch,
      getSuggestions,
      type,
      displayIcon,
      error,
      handleError,
      persistentClear,
      clearPlaceholder,
      noLeftRadius,
    } = this.props;
    return (
      <div className={styles.container}>
        {displayIcon ? <LocationIcon className={styles.icon} /> : null}
        <PlacesAutocomplete
          value={value}
          onChange={onChange}
          shouldFetchSuggestions={value.length > 2}
          debounce={500}
          onError={handleError}
          searchOptions={{
            types: [type],
          }}>
          {({getInputProps, suggestions}) => {
            return (
              <div>
                <input
                  // some location names are very long, and with how positioning is set up those locations would go over the reset "X"
                  style={{width: persistentClear ? '95%' : '100%'}}
                  className={`${styles.searchBar} ${
                    noLeftRadius && styles.noLeftRadius
                  } bodyCopyForm`}
                  type="text"
                  {...getInputProps()}
                  placeholder={placeholder}
                />
                {/* without this check, get suggestions updates suggestions to an empty array, causing an infinite spinner if the user clicks out of the box before selection a location */}
                {suggestions.length > 0 ? getSuggestions(suggestions) : null}
              </div>
            );
          }}
        </PlacesAutocomplete>
        {/* clear button with input */}
        <div
          className={[
            styles.clearSearch,
            (value !== '' || !this.isDefaultSearch()) && styles.hideClear,
          ].join(' ')}
          onClick={onClearSearch}>
          <ClearSearchIcon />
        </div>
        {noLeftRadius && value === '' && this.isDefaultSearch() && (
          <div className={styles.iconRight}>
            <LocationIcon />
          </div>
        )}

        {/* clear button with value (only used on event creation) */}
        {persistentClear ? (
          <div
            className={[
              styles.clearSearch,
              value === '' &&
                placeholder.trim() !== 'Enter Location' &&
                styles.hideClear,
            ].join(' ')}
            style={{right: 0}}
            onClick={clearPlaceholder}>
            <ClearSearchIcon />
          </div>
        ) : null}
      </div>
    );
  }
}

SearchGooglePlaces.defaultProps = {
  placeholder: 'Search',
};
