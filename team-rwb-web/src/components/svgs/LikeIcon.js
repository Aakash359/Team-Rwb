import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class LikeIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g fill="none" data-name="Layer 2">
          <path d="M0 0h16v16H0z" />
          <path
            d="M7.66 13.86l-4.88-4.7A5.54 5.54 0 011 5.66 3.4 3.4 0 014.73 2 5.23 5.23 0 018 3.69 5.23 5.23 0 0111.27 2 3.4 3.4 0 0115 5.66a5.55 5.55 0 01-1.79 3.51l-4.87 4.69a.48.48 0 01-.68 0z"
            stroke={this.props.strokeColor || '#bf0d3e'}
            strokeMiterlimit={10}
            fill={this.props.tintColor}
          />
        </g>
      </svg>
    );
  }
}

LikeIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#fff',
};

LikeIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
