import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class ActivityIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path fill="none" d="M0 0h16v16H0z" />
          <path
            d="M10 7v6.44a.88.88 0 01-1.75 0v-3h-.5v3a.88.88 0 01-1.75 0V7L3.72 4.72a.75.75 0 111.06-1.06l1.78 1.78h2.88l1.78-1.78a.75.75 0 111.06 1.06zM8 5.19a1.75 1.75 0 111.75-1.75A1.75 1.75 0 018 5.19z"
            fill={this.props.tintColor}
          />
        </g>
      </svg>
    );
  }
}

ActivityIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

ActivityIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
