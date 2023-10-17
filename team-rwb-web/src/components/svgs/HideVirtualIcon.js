import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class HideVirtualIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g id="prefix__Layer_2" data-name="Layer 2">
          <g id="prefix__Art">
            <path fill="none" d="M0 0h16v16H0z" />
            <path
              className="prefix__cls-2"
              d="M12 9.5a.24.24 0 0 1-.22.22H7.9l-.9.85h4.78a1.07 1.07 0 0 0 1.11-1.07V4.78l-.89.8zM6.61 11l-1.28 1.29h8.21c.58 0 1.07-.29 1.07-.65V11h-8zm2.1.64H7.64a.1.1 0 0 1-.11-.1.11.11 0 0 1 .11-.11h1.07a.11.11 0 0 1 .11.11.1.1 0 0 1-.11.1zM2.8 13.4L13.6 2.6l-.71-.7-1.81 1.81H4.53a1.08 1.08 0 0 0-1.07 1.07V9.5a1.06 1.06 0 0 0 .81 1l-.48.5h-2v.64c0 .3.34.54.79.61L1.39 13.4l.71.7.71-.7zm1.52-8.62a.22.22 0 0 1 .21-.21h5.69L5.07 9.72h-.54a.23.23 0 0 1-.21-.22z"
              fill={this.props.tintColor}
            />
          </g>
        </g>
      </svg>
    );
  }
}

HideVirtualIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#63666a',
};

HideVirtualIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
