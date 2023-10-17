import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class PinnedPostIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <path
          d="M11.4 10.1H8.6l-.3 3.2c0 .1-.1.2-.2.2s-.2-.1-.2-.2l-.5-3.2H4.6c-.2 0-.4-.2-.4-.4 0-1.1.8-2.1 1.7-2.1V4.1c-.5 0-.9-.3-.9-.8s.4-.9.9-.9h4.3c.5 0 .9.4.9.9s-.4.9-.9.9v3.4c.9 0 1.7 1 1.7 2.1 0 .2-.2.4-.5.4zm-4-5.7c0-.1-.1-.2-.2-.2s-.3 0-.3.2v3c0 .1.1.2.2.2s.2-.1.2-.2v-3z"
          fill={this.props.tintColor}
        />
      </svg>
    );
  }
}

PinnedPostIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

PinnedPostIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
