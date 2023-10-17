import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class SearchIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path
            d="M12.72 13.57a.86.86 0 0 1-.61-.25L9.82 11a4.76 4.76 0 0 1-2.68.83 4.72 4.72 0 1 1 4.72-4.72A4.76 4.76 0 0 1 11 9.82l2.3 2.29a.9.9 0 0 1 .24.61.86.86 0 0 1-.82.85zM7.14 4.14a3 3 0 1 0 3 3 3 3 0 0 0-3-3z"
            fill={this.props.tintColor}
          />
          <path fill="none" d="M0 0h16v16H0z" />
        </g>
      </svg>
    );
  }
}

SearchIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

SearchIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
