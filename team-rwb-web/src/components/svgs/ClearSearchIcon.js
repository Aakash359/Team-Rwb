import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class ClearSearchIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <path fill="none" d="M0 0h16v16H0z" />
        <path
          fill={this.props.tintColor}
          d="M8 2C4.7 2 2 4.7 2 8s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm2.6 8.6c-.2.2-.6.2-.8 0L8 8.8l-1.7 1.7c-.2.2-.6.2-.8 0-.2-.2-.2-.6 0-.8L7.2 8 5.4 6.3c-.2-.3-.2-.6 0-.9s.6-.2.8 0L8 7.2l1.7-1.7c.2-.2.6-.2.8 0 .2.2.2.6 0 .8L8.8 8l1.7 1.7c.3.3.3.6.1.9z"
        />
      </svg>
    );
  }
}

ClearSearchIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#c1c2c3',
};

ClearSearchIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
