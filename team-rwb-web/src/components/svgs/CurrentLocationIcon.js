import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class CurrentLocationIcon extends Component {
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
            d="M8.38 12.48a.42.42 0 0 1-.38.24h-.1a.41.41 0 0 1-.33-.41V8.43H3.71a.43.43 0 0 1-.19-.81l8.57-4.29a.46.46 0 0 1 .2-.05.39.39 0 0 1 .3.13.44.44 0 0 1 .08.5z"
            fill={this.props.tintColor}
          />
        </g>
      </svg>
    );
  }
}

CurrentLocationIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

CurrentLocationIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
