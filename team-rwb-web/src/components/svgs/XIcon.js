import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class XIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path
            d="M12.42 11.36l-1.06 1.06a.77.77 0 0 1-.53.22.75.75 0 0 1-.53-.22L8 10.12l-2.3 2.3a.75.75 0 0 1-.53.22.77.77 0 0 1-.53-.22l-1.06-1.06a.77.77 0 0 1-.22-.53.75.75 0 0 1 .22-.53L5.88 8l-2.3-2.3a.75.75 0 0 1-.22-.53.77.77 0 0 1 .22-.53l1.06-1.06a.77.77 0 0 1 .53-.22.75.75 0 0 1 .53.22L8 5.88l2.3-2.3a.75.75 0 0 1 .53-.22.77.77 0 0 1 .53.22l1.06 1.06a.77.77 0 0 1 .22.53.75.75 0 0 1-.22.53L10.12 8l2.3 2.3a.75.75 0 0 1 .22.53.77.77 0 0 1-.22.53z"
            fill={this.props.tintColor}
          />
          <path fill="none" d="M0 0h16v16H0z" />
        </g>
      </svg>
    );
  }
}

XIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

XIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
