import React from 'react';
import styles from './Loading.module.css';
import ClipLoader from 'react-spinners/ClipLoader';

// places spinners (event location lookup and event creation) do not want the full screen spinners
const Loading = ({
  size,
  color,
  loading,
  right,
  transparent,
  places,
  footerLoading,
  notFullHeight,
}) => (
  <>
    {!footerLoading ? (
      <div
        className={
          loading
            ? `${
                notFullHeight
                  ? styles.notFullLoadingContainer
                  : !places
                  ? styles.loadingContainer
                  : null
              } ${right && styles.rightContainer} ${
                transparent && styles.transparent
              }`
            : styles.none
        }>
        <ClipLoader size={size} color={color} loading={true} />
      </div>
    ) : (
      <div className={styles.footerContainer}>
        <ClipLoader size={size} color={color} loading={true} />
      </div>
    )}
  </>
);

export default Loading;
