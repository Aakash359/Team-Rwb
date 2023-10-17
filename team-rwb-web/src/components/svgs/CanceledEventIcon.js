import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class CanceledEventIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path
            d="M8 14a6 6 0 1 1 6-6 6 6 0 0 1-6 6zm2.34-9.58A4.17 4.17 0 0 0 8 3.73a4.26 4.26 0 0 0-3.55 6.6zm1.23 1.25l-5.89 5.9a4.26 4.26 0 0 0 5.89-5.88z"
            fill={this.props.tintColor}
          />
          <path fill="none" d="M0 0h16v16H0z" />
        </g>
      </svg>
    );
  }
}

CanceledEventIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

CanceledEventIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
