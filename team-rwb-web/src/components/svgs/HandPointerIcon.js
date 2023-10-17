import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class HandPointerIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 40 47"
        width={this.props.width}
        height={this.props.height}>
        <path
          d="M32.1 33.2H32c-1.3 1-2.9 1.6-4.6 1.6-.4 0-.7 0-1.1-.1-.9.5-2.1.8-3.1.9v4.3c0 3.6-3 6.6-6.6 6.6-3.5 0-6.5-3-6.5-6.6v-9.6c-1 .4-2.2.6-3.3.6-4.3 0-6.6-3.3-6.6-7.4 0-3.4 4.4-4.5 6.8-6 1.2-.8 2.3-1.6 3.3-2.6.8-.7 3.1-2.5 3.1-3.7V3.8C13.4 2 14.9.5 16.7.5h16.4c1.8 0 3.3 1.5 3.3 3.3v7.4c0 1.6 1 4.2 1.5 5.7.9 2.6 1.8 5.3 1.8 8.1 0 4.8-2.7 8.2-7.6 8.2zm1-22v-.8H16.7v.8c0 2.7-2.3 4.5-4.2 6.2-1.2 1.1-2.4 2-3.7 2.9-.6.4-1.2.7-1.7 1-.6.3-3.5 1.6-3.5 2.3 0 2.2.8 4.1 3.3 4.1 3.3 0 5-2.5 6.6-2.5V40c0 1.7 1.5 3.3 3.3 3.3 1.8 0 3.3-1.5 3.3-3.3v-8.5c.7.5 1.8.9 2.6.9 1.2 0 2.2-.5 3.1-1.4.5.3 1.2.5 1.8.5 1.2 0 2.6-.6 3.2-1.7.5.1.9.1 1.4.1 3 0 4.3-1.9 4.3-4.7-.1-5.2-3.4-9.5-3.4-14zm-1.6-7.4c-.9 0-1.6.7-1.6 1.6S30.6 7 31.5 7s1.6-.7 1.6-1.6-.7-1.6-1.6-1.6z"
          fill={this.props.tintColor}
        />
      </svg>
    );
  }
}

HandPointerIcon.defaultProps = {
  width: 20,
  height: 24,
  tintColor: '#bf0d3e',
};

HandPointerIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
