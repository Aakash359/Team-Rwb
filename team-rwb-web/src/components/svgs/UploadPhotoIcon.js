import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class UploadPhotoIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path
            d="M14.43 5.86v6a1.72 1.72 0 0 1-1.71 1.71H3.28a1.72 1.72 0 0 1-1.71-1.71v-6a1.72 1.72 0 0 1 1.71-1.72h1.5l.35-.91a1.33 1.33 0 0 1 1.16-.8h3.42a1.33 1.33 0 0 1 1.16.8l.34.91h1.51a1.72 1.72 0 0 1 1.71 1.72zm-3.43 3a3 3 0 1 0-3 3 3 3 0 0 0 3-3zm-1.07 0A1.93 1.93 0 1 1 8 6.93a1.94 1.94 0 0 1 1.93 1.93z"
            fill={this.props.tintColor}
          />
          <path fill="none" d="M0 0h16v16H0z" />
        </g>
      </svg>
    );
  }
}

UploadPhotoIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

UploadPhotoIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
