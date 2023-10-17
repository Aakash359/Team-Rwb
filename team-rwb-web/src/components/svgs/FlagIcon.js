import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class FlagIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path
            d="M2.75 3.86v9.89a.26.26 0 0 1-.25.25H2a.26.26 0 0 1-.25-.25V3.86a1 1 0 1 1 1 0zm12 5.6c0 .29-.18.4-.41.52a6.28 6.28 0 0 1-2.88.9c-1.44 0-2.12-1.09-3.83-1.09A8.1 8.1 0 0 0 4 10.93a.5.5 0 0 1-.76-.43V4.7a.52.52 0 0 1 .24-.43c.19-.12.42-.23.62-.33A7.65 7.65 0 0 1 7.4 3a7.49 7.49 0 0 1 3.27.91 1.51 1.51 0 0 0 .69.15c1.23 0 2.55-1.06 2.89-1.06a.51.51 0 0 1 .5.5z"
            fill={this.props.tintColor}
          />
          <path fill="none" d="M0 0h16v16H0z" />
        </g>
      </svg>
    );
  }
}

FlagIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

FlagIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
