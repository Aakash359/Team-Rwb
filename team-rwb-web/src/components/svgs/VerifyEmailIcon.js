import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class VerifyEmailIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 46 37.57"
        width={this.props.width}
        height={this.props.height}>
        <path
          d="M35 0a11 11 0 0 0-10.85 9.28H3.21A3.22 3.22 0 0 0 0 12.49v21.87a3.22 3.22 0 0 0 3.21 3.21H32.8a3.22 3.22 0 0 0 3.2-3.21V22a11 11 0 0 0-1-22zM3.21 11.85H24a11 11 0 0 0 4.4 8c-2 1.58-4 3.16-6 4.75-1.07.86-3 2.71-4.4 2.71-1.41 0-3.34-1.85-4.41-2.71q-4-3.19-8-6.37a7.26 7.26 0 0 1-3-5.71.66.66 0 0 1 .62-.67zm30.23 22.51a.66.66 0 0 1-.64.64H3.21a.66.66 0 0 1-.64-.64V18.92A10.27 10.27 0 0 0 4 20.25c2.87 2.21 5.77 4.46 8.56 6.79C14 28.31 15.9 29.86 18 29.86c2.09 0 3.95-1.55 5.46-2.82 2.41-2 4.88-3.94 7.36-5.86a10.77 10.77 0 0 0 2.59.7zm7.4-25.83L36 13.36l-.83.83-1.06 1.06a.77.77 0 0 1-.53.22.75.75 0 0 1-.53-.22l-.14-.13-.91-.93-2.33-2.34-.5-.49a.76.76 0 0 1-.21-.53.74.74 0 0 1 .21-.53l1-1h.05a.74.74 0 0 1 .54-.3.76.76 0 0 1 .53.21l2.26 2.26L35 10.15l3.73-3.74a.77.77 0 0 1 .53-.22.75.75 0 0 1 .53.22l1.07 1.06a.75.75 0 0 1 .22.53.77.77 0 0 1-.24.53z"
          fill={this.props.tintColor}
          data-name="Layer 2"
        />
      </svg>
    );
  }
}

VerifyEmailIcon.defaultProps = {
  width: 46,
  height: 38,
  tintColor: '#bf0d3e',
};

VerifyEmailIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
