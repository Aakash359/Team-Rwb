import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class EventsIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 24 24"
        width={this.props.width}
        height={this.props.height}>
        <path
          d={
            this.props.filledIcon
              ? 'M17 13h-5v5h5v-5zM16 2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-1V2h-2zm3 18H5V9h14v11z'
              : 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z'
          }
          fill={this.props.tintColor}
        />
      </svg>
    );
  }
}

EventsIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#828588',
  filledIcon: true,
};

EventsIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  filledIcon: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
};
