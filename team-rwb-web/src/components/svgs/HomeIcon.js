import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class HomeIcon extends Component {
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
              ? 'M12 3L6 7.6V6H4v3.1l-3 2.3L2.2 13 4 11.6V21h7v-6h2v6h7v-9.4l1.8 1.4 1.2-1.6L12 3z'
              : 'M12 3L6 7.6V6H4v3.1l-3 2.3L2.2 13 4 11.6V21h16v-9.4l1.8 1.4 1.2-1.6L12 3zm6 16h-5v-4h-2v4H6v-8.9l6-4.6 6 4.6V19z'
          }
          fill={this.props.tintColor}
        />
      </svg>
    );
  }
}

HomeIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#828588',
  filledIcon: true,
};

HomeIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  filledIcon: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
};
