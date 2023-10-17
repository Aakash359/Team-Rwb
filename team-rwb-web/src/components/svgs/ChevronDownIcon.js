import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class ChevronDownIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <path
          d="M2.7 6.4c-.2-.2-.2-.4 0-.6l1.1-1.1c.2-.2.4-.2.6 0L8 8.2l3.6-3.6c.2-.2.4-.2.6 0l1.1 1.1c.2.2.2.4 0 .6l-5 5c-.2.2-.4.2-.6 0l-5-4.9z"
          fill={this.props.tintColor}
        />
        <path fill="none" d="M0 0h16v16H0z" />
      </svg>
    );
  }
}

ChevronDownIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

ChevronDownIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
