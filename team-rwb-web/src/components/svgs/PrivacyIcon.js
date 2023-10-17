import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class PrivacyIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path
            d="M11 7V5a3 3 0 0 0-6 0v2H3.5v7h9V7zm-2.5 3.86V12h-1v-1.14A1 1 0 0 1 7 10a1 1 0 0 1 2 0 1 1 0 0 1-.5.86zM6 7V5a2 2 0 0 1 4 0v2z"
            fill={this.props.tintColor}
          />
          <path fill="none" d="M0 0h16v16H0z" />
        </g>
      </svg>
    );
  }
}

PrivacyIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

PrivacyIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
