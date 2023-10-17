import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class MyProfileIcon extends Component {
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
              ? 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
              : 'M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
          }
          fill={this.props.tintColor}
        />
      </svg>
    );
  }
}

MyProfileIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#828588',
  filledIcon: true,
};

MyProfileIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  filledIcon: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
};
