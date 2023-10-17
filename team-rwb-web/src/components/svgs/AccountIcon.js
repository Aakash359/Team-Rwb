import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class AccountIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path
            d="M11.41 14H4.59a1.92 1.92 0 0 1-2.09-2c0-1.77.41-4.48 2.7-4.48.25 0 1.27 1.09 2.8 1.09s2.55-1.11 2.8-1.11c2.29 0 2.7 2.71 2.7 4.48A1.92 1.92 0 0 1 11.41 14zM8 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3z"
            fill={this.props.tintColor}
          />
          <path fill="none" d="M0 0h16v16H0z" />
        </g>
      </svg>
    );
  }
}

AccountIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

AccountIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
