import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class ChallengeTabIcon extends Component {
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
              ? 'M19,5H17V3H7V5H5A2.006,2.006,0,0,0,3,7V8a4.991,4.991,0,0,0,4.39,4.94A5.009,5.009,0,0,0,11,15.9V19H7v2H17V19H13V15.9a5.009,5.009,0,0,0,3.61-2.96A4.991,4.991,0,0,0,21,8V7A2.006,2.006,0,0,0,19,5ZM5,8V7H7v3.82A3.01,3.01,0,0,1,5,8ZM19,8a3.01,3.01,0,0,1-2,2.82V7h2Z'
              : 'M19,5H17V3H7V5H5A2.006,2.006,0,0,0,3,7V8a4.991,4.991,0,0,0,4.39,4.94A5.009,5.009,0,0,0,11,15.9V19H7v2H17V19H13V15.9a5.009,5.009,0,0,0,3.61-2.96A4.991,4.991,0,0,0,21,8V7A2.006,2.006,0,0,0,19,5ZM5,8V7H7v3.82A3.01,3.01,0,0,1,5,8Zm7,6a3.009,3.009,0,0,1-3-3V5h6v6A3.009,3.009,0,0,1,12,14Zm7-6a3.01,3.01,0,0,1-2,2.82V7h2Z'
          }
          fill={this.props.tintColor}
        />
      </svg>
    );
  }
}

ChallengeTabIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#828588',
  filledIcon: true,
};

ChallengeTabIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  filledIcon: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
};
