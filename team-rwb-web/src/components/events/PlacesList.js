import React from 'react';
import styles from './PlacesList.module.css';
import Loading from '../Loading';
import CurrentLocationIcon from '../svgs/CurrentLocationIcon';

const PlacesList = ({
  locationSuggestions,
  onSelect,
  onCurrentLocationSelect,
  locationError,
}) => {
  return (
    <div className={styles.container}>
      <div
        className={styles.suggestionContainer}
        onClick={onCurrentLocationSelect}
        key={-1}>
        <CurrentLocationIcon tintColor={'var(--navy'} />
        <p className={styles.currentLocationText}>{'Use Current Location'}</p>
      </div>
      {locationSuggestions.length > 0 ? (
        locationSuggestions.map((suggestion, i) => (
          <div
            className={styles.suggestionContainer}
            onClick={() =>
              onSelect(
                suggestion.description,
                suggestion.formattedSuggestion.mainText,
              )
            }
            key={i}>
            <p>{suggestion.description} </p>
          </div>
        ))
      ) : locationError ? (
        <div className={styles.loadingContainer}>
          <p>{locationError}</p>
        </div>
      ) : (
        <div className={styles.loadingContainer}>
          <Loading
            size={50}
            color={'var(--grey40)'}
            loading={true}
            transparent
            places={true}
          />
        </div>
      )}
    </div>
  );
};

export default PlacesList;
