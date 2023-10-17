import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class NoEventIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 36.01 33.44"
        width={this.props.width}
        height={this.props.height}>
        <path
          d="M35.69 29.64a2.57 2.57 0 0 1-2.25 3.8H2.57a2.56 2.56 0 0 1-2.21-1.27 2.54 2.54 0 0 1 0-2.53L15.75 1.35a2.55 2.55 0 0 1 4.5 0zM20.9 10.89a.48.48 0 0 0-.2-.38.82.82 0 0 0-.49-.22h-4.42a.82.82 0 0 0-.48.22.56.56 0 0 0-.2.42l.34 9.19c0 .26.3.46.68.46h3.72c.36 0 .67-.2.69-.46zm-.32 12.92a.66.66 0 0 0-.65-.66h-3.86a.65.65 0 0 0-.64.66v3.82a.65.65 0 0 0 .64.66h3.86a.66.66 0 0 0 .65-.66z"
          fill={this.props.tintColor}
          data-name="Layer 2"
        />
      </svg>
    );
  }
}

NoEventIcon.defaultProps = {
  width: 60,
  height: 60,
  tintColor: '#bf0d3e',
};

NoEventIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
