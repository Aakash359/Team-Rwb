import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class PostOptionIcon extends Component {
  render() {
    return (
      <svg
        viewBox="0 0 16 16"
        className={this.props.className}
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path fill="none" d="M0 0h16v16H0z" />
          <path
            d="M9.5 4.75a.76.76 0 01-.75.75h-1.5a.76.76 0 01-.75-.75v-1.5a.76.76 0 01.75-.75h1.5a.76.76 0 01.75.75zm0 4a.76.76 0 01-.75.75h-1.5a.76.76 0 01-.75-.75v-1.5a.76.76 0 01.75-.75h1.5a.76.76 0 01.75.75zm0 4a.76.76 0 01-.75.75h-1.5a.76.76 0 01-.75-.75v-1.5a.76.76 0 01.75-.75h1.5a.76.76 0 01.75.75z"
            fill={this.props.tintColor}
          />
        </g>
      </svg>
    );
  }
}

PostOptionIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#C1C2C3',
};

PostOptionIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

