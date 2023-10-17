import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class TicketIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path fill="none" d="M0 0h16v16H0z" />
          <path
            d="M7.38 12.94a.8.8 0 0 1-1.11 0l-.77-.77a1.18 1.18 0 0 0-1.67-1.67l-.77-.77a.8.8 0 0 1 0-1.11l5.57-5.56a.8.8 0 0 1 1.11 0l.76.77a1.18 1.18 0 0 0 1.67 1.67l.77.76a.8.8 0 0 1 0 1.11zm3.9-5.45a.39.39 0 0 0 0-.55L9.06 4.72a.39.39 0 0 0-.55 0L4.72 8.51a.38.38 0 0 0 0 .55l2.22 2.22a.39.39 0 0 0 .27.11.39.39 0 0 0 .28-.11zm-.56-.28l-3.51 3.51-1.93-1.94 3.5-3.5z"
            fill={this.props.tintColor}
          />
        </g>
      </svg>
    );
  }
}

TicketIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

TicketIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
