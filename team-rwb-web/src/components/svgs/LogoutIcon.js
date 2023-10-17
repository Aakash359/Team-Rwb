import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class LogoutIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path
            d="M6.62 13h-2.5a2.24 2.24 0 0 1-2.24-2.25v-5.5A2.24 2.24 0 0 1 4.12 3h2.5a.26.26 0 0 1 .26.25c0 .22.1.75-.26.75h-2.5a1.25 1.25 0 0 0-1.24 1.25v5.5A1.25 1.25 0 0 0 4.12 12h2.26c.19 0 .5 0 .5.25S7 13 6.62 13zM14 8.35L9.73 12.6a.49.49 0 0 1-.35.15.5.5 0 0 1-.5-.5V10h-3.5a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5h3.5V3.75a.5.5 0 0 1 .5-.5.49.49 0 0 1 .35.15L14 7.65a.51.51 0 0 1 0 .7z"
            fill={this.props.tintColor}
          />
          <path fill="none" d="M0 0h16v16H0z" />
        </g>
      </svg>
    );
  }
}

LogoutIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

LogoutIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
