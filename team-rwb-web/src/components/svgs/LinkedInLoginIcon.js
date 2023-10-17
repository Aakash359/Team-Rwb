import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class LinkedInLoginIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 30 30"
        width={this.props.width}
        height={this.props.height}>
        <g id="prefix__Layer_2" data-name="Layer 2">
          <g id="prefix__Art">
            <path fill="#1280af" d="M0 0h30v30H0z" />
            <path
              fill="#ffffff"
              className="prefix__cls-2"
              d="M10 8a2 2 0 0 1-2.11 2A2 2 0 1 1 8 6a1.94 1.94 0 0 1 2 2zM6 24V11.44h3.88V24zM12.21 15.45c0-1.57-.05-2.88-.1-4h3.39l.18 1.75h.08a4.5 4.5 0 0 1 3.87-2c2.57 0 4.5 1.72 4.5 5.42V24h-3.91v-7c0-1.62-.56-2.72-2-2.72a2.13 2.13 0 0 0-2 1.46 2.68 2.68 0 0 0-.13 1V24h-3.88z"
            />
          </g>
        </g>
      </svg>
    );
  }
}

LinkedInLoginIcon.defaultProps = {
  width: 40,
  height: 40,
};

LinkedInLoginIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
