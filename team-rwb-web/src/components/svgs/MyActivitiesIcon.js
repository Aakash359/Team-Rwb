import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class MyActivitiesIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 17.99 14.14"
        width={this.props.width}
        height={this.props.height}>
        <path
          d="M5.14 2.89a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1h3.18a1 1 0 0 1 1 1zm0 5.11a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V6.1a1 1 0 0 1 1-1h3.18a1 1 0 0 1 1 1zm0 5.14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-1.89a1 1 0 0 1 1-1h3.18a1 1 0 0 1 1 1zM18 2.89a1 1 0 0 1-1 1H7.39a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1H17a1 1 0 0 1 1 1zM18 8a1 1 0 0 1-1 1H7.39a1 1 0 0 1-1-1V6.1a1 1 0 0 1 1-1H17a1 1 0 0 1 1 1zm0 5.14a1 1 0 0 1-1 1H7.39a1 1 0 0 1-1-1v-1.89a1 1 0 0 1 1-1H17a1 1 0 0 1 1 1z"
          fill={this.props.tintColor}
          data-name="Layer 2"
        />
      </svg>
    );
  }
}

MyActivitiesIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#838588',
};

MyActivitiesIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
