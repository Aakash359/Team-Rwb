import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class CheckIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <g data-name="Over States">
            <path
              d="M13.84 5.7l-5.66 5.66-1.06 1.06a.77.77 0 0 1-.53.22.79.79 0 0 1-.54-.22L5 11.36 2.16 8.53a.77.77 0 0 1 0-1.06l1.07-1.06a.75.75 0 0 1 .53-.22.77.77 0 0 1 .53.22l2.3 2.3 5.12-5.13a.77.77 0 0 1 .53-.22.75.75 0 0 1 .53.22l1.07 1.06a.76.76 0 0 1 .21.53.74.74 0 0 1-.21.53z"
              fill={this.props.tintColor}
            />
            <path fill="none" d="M0 0h16v16H0z" />
          </g>
        </g>
      </svg>
    );
  }
}

CheckIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

CheckIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
