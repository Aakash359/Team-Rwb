import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class BlockIcon extends Component {
  render() {
    return (
      <svg
        fill="none"
        width={this.props.width}
        height={this.props.height}
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke={this.props.tintColor}
        class="w-6 h-6">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
        />
      </svg>
    );
  }
}

BlockIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

BlockIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
