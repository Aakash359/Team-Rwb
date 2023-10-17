import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class ClockIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path fill="none" d="M0 0h16v16H0z" />
          <path
            d="M8 14a6 6 0 116-6 6 6 0 01-6 6zM8 3.75A4.25 4.25 0 1012.25 8 4.26 4.26 0 008 3.75zm1 5a.25.25 0 01-.25.25h-2.5A.25.25 0 016 8.75v-.5A.25.25 0 016.25 8H8V5.25A.25.25 0 018.25 5h.5a.25.25 0 01.25.25z"
            fill={this.props.tintColor}
          />
        </g>
      </svg>
    );
  }
}

ClockIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

ClockIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
