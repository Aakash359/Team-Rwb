import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class ChevronRightIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path
            d="M6.37 13.27a.42.42 0 0 1-.6 0l-1.11-1.11a.42.42 0 0 1 0-.6L8.21 8 4.66 4.44a.42.42 0 0 1 0-.6l1.11-1.11a.42.42 0 0 1 .6 0l5 5a.42.42 0 0 1 0 .6z"
            fill={this.props.tintColor}
          />
          <path fill="none" d="M0 0h16v16H0z" />
        </g>
      </svg>
    );
  }
}

ChevronRightIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

ChevronRightIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
