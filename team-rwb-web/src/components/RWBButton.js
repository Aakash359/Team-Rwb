import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import styles from './RWBButton.module.css';

export default class RWBButton extends Component {
  render() {
    let buttonStyling;
    if (this.props.buttonStyle === 'primary') {
      buttonStyling = styles.primary;
    } else if (this.props.buttonStyle === 'primaryDisabled') {
      buttonStyling = styles.primaryDisabled;
    } else if (this.props.buttonStyle === 'secondary') {
      buttonStyling = styles.secondary;
    } else if (this.props.buttonStyle === 'tertiary') {
      buttonStyling = styles.tertiary;
    } else {
      buttonStyling = styles.default;
    }

    return (
      <div>
        {this.props.link ? (
          <Link
            to={this.props.to}
            state={this.props.state}
            onClick={this.props.onClick}
            className={this.props.disabled ? styles.disabledLink : null}>
            <button className={`${styles.button} ${buttonStyling}`}>
              {this.props.label}
            </button>
          </Link>
        ) : (
          <button
            disabled={this.props.disabled}
            className={`${styles.button} ${buttonStyling}`}
            onClick={this.props.onClick}>
            {this.props.label}
          </button>
        )}
      </div>
    );
  }
}

RWBButton.defaultProps = {
  link: false,
};

RWBButton.propTypes = {
  label: PropTypes.string.isRequired,
  buttonStyle: PropTypes.string,
  onClick: PropTypes.func,
  link: PropTypes.bool,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
