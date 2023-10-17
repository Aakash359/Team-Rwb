import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import styles from './RWBRowButton.module.css';
import ChevronRightIcon from './svgs/ChevronRightIcon';

export default class RWBRowButton extends Component {
  render() {
    return (
      <div
        className={`${styles.rowButton} ${this.props.className}`}
        onClick={this.props.onClick}>
        {this.props.children}
        <h3 className={styles.label}>{this.props.label}</h3>
        <ChevronRightIcon />
      </div>
    );
  }
}

RWBRowButton.defaultProps = {
  link: false,
};

RWBRowButton.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  link: PropTypes.bool,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
