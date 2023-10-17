import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class RemoveIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path
            d="M12.72 5.21a.22.22 0 0 1-.22.22h-.64v6.35a1.26 1.26 0 0 1-1.07 1.36H5.21a1.23 1.23 0 0 1-1.07-1.34V5.43H3.5a.22.22 0 0 1-.22-.22v-.42a.22.22 0 0 1 .22-.22h2.07L6 3.45a1 1 0 0 1 .89-.59h2.18a1 1 0 0 1 .89.59l.47 1.12h2.07a.22.22 0 0 1 .22.22zM11 5.43H5v6.35a.61.61 0 0 0 .21.51h5.58a.61.61 0 0 0 .21-.51zm-4.29 5.36a.21.21 0 0 1-.21.21h-.43a.21.21 0 0 1-.21-.21V6.93a.21.21 0 0 1 .21-.22h.43a.21.21 0 0 1 .21.22zM9.5 4.57l-.32-.78a.25.25 0 0 0-.12-.08H6.94a.23.23 0 0 0-.11.08l-.33.78zm-1.07 6.22a.21.21 0 0 1-.22.21h-.42a.21.21 0 0 1-.22-.21V6.93a.22.22 0 0 1 .22-.22h.42a.22.22 0 0 1 .22.22zm1.71 0a.21.21 0 0 1-.21.21H9.5a.21.21 0 0 1-.21-.21V6.93a.21.21 0 0 1 .21-.22h.43a.21.21 0 0 1 .21.22z"
            fill={this.props.tintColor}
          />
          <path fill="none" d="M0 0h16v16H0z" />
        </g>
      </svg>
    );
  }
}

RemoveIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

RemoveIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
