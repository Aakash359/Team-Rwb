import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class InterestedIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path
            d="M7.73 12.6L3.9 8.91a4.34 4.34 0 0 1-1.4-2.75 2.67 2.67 0 0 1 2.94-2.87A4.12 4.12 0 0 1 8 4.61a4.12 4.12 0 0 1 2.56-1.32 2.67 2.67 0 0 1 2.94 2.87 4.36 4.36 0 0 1-1.41 2.76L8.27 12.6a.39.39 0 0 1-.54 0z"
            fill={this.props.tintColor}
          />
          <path fill="none" d="M0 0h16v16H0z" />
        </g>
      </svg>
    );
  }
}

InterestedIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#838588',
};

InterestedIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
