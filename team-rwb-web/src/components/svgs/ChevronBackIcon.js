import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class ChevronBackIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 10.4 16.18"
        width={this.props.width}
        height={this.props.height}>
        <path
          d="M4.88 8.09l5.33 5.33a.63.63 0 0 1 0 .9L8.54 16a.63.63 0 0 1-.9 0L.19 8.54a.63.63 0 0 1 0-.9L7.64.19a.63.63 0 0 1 .9 0l1.67 1.67a.63.63 0 0 1 0 .9z"
          fill={this.props.tintColor}
          data-name="Layer 2"
        />
      </svg>
    );
  }
}

ChevronBackIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#fff',
};

ChevronBackIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
