import React from 'react';
import PropTypes from 'prop-types';
import styles from './ToggleSwitch.module.css';

function ToggleSwitch({desc, value, onChange, greenBackground}) {
  return (
    <div className={styles.container}>
      <label className={styles.switch}>
        <input
          type="checkbox"
          checked={value}
          onChange={onChange}
          className={greenBackground ? styles.greenBackground : null}
        />
        <span className={styles.slider}></span>
      </label>
      {desc && <p className={`${styles.description} bodyCopy`}>{desc}</p>}
    </div>
  );
}

ToggleSwitch.propTypes = {
  desc: PropTypes.string,
};

export default ToggleSwitch;
