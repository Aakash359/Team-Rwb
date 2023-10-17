import React from 'react';
import styles from './AddressesList.module.css';
import Loading from '../Loading';
import CurrentLocationIcon from '../svgs/CurrentLocationIcon';

const AddressesList = ({
  addressSuggestions,
  onSelect,
  //   onCurrentLocationSelect,
}) => {
  return (
    <div className={styles.container}>
      {/* <div
        className={styles.suggestionContainer}
        onClick={onCurrentLocationSelect}
        key={-1}>
        <CurrentLocationIcon tintColor={'var(--navy'} />
        <p className={styles.currentLocationText}>{'Use Current Location'}</p>
      </div> */}
      {addressSuggestions.length > 0 ? (
        addressSuggestions.map((suggestion, i) => (
          <div
            className={styles.suggestionContainer}
            onClick={() => onSelect(suggestion.key)}
            key={i}>
            <p className={styles.address}>
              {suggestion.key.fullAddress} {suggestion.key.suiteName}
            </p>
          </div>
        ))
      ) : (
        <div className={styles.loadingContainer}>
          <Loading
            size={50}
            color={'var(--grey40)'}
            loading={true}
            notFullHeight={true}
            transparent
          />
        </div>
      )}
    </div>
  );
};

export default AddressesList;
