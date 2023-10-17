import React from 'react';
import PropTypes from 'prop-types';
import styles from './RWBDropdown.module.css';
import ChevronDownIcon from './svgs/ChevronDownIcon';

function RWBDropdown(props) {
  return (
    <div className={styles.container}>
      <p className="formLabel">{props.label}</p>
      <div className={styles.dropdownContent} onClick={props.onClick}>
        <p className={styles.valueText}>{props.value}</p>
        <ChevronDownIcon className={styles.icon} />
      </div>
      <p className="errorMessage">{props.error}</p>
    </div>
  );
}

RWBDropdown.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default RWBDropdown;
