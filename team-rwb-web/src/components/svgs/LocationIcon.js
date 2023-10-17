import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class LocationIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path
            d="M11.74 7.4l-2.84 6a1 1 0 0 1-.9.6 1 1 0 0 1-.89-.55l-2.85-6A3.18 3.18 0 0 1 4 6a4 4 0 0 1 8 0 3.18 3.18 0 0 1-.26 1.4zM8 4a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"
            fill={this.props.tintColor}
          />
          <path fill="none" d="M0 0h16v16H0z" />
        </g>
      </svg>
    );
  }
}

LocationIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

LocationIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
