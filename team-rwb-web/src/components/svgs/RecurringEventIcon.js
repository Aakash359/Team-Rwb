import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class RecurringEventIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 16 16"
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path
            d="M13.8 9.3a5.95 5.95 0 0 1-9.94 3l-1 1a.47.47 0 0 1-.35.15A.51.51 0 0 1 2 13V9.5a.51.51 0 0 1 .5-.5H6a.51.51 0 0 1 .5.5.47.47 0 0 1-.15.35l-1.07 1.07a4 4 0 0 0 6.13-.83 6.69 6.69 0 0 0 .41-.91.24.24 0 0 1 .23-.18h1.5a.25.25 0 0 1 .25.25zm.2-2.8a.51.51 0 0 1-.5.5H10a.51.51 0 0 1-.5-.5.47.47 0 0 1 .15-.35l1.08-1.08a4 4 0 0 0-6.14.84 6.69 6.69 0 0 0-.41.91A.24.24 0 0 1 4 7H2.39a.25.25 0 0 1-.25-.25A6 6 0 0 1 8 2a6.05 6.05 0 0 1 4.13 1.66l1-1a.47.47 0 0 1 .35-.15A.51.51 0 0 1 14 3z"
            fill={this.props.tintColor}
          />
          <path fill="none" d="M0 0h16v16H0z" />
        </g>
      </svg>
    );
  }
}

RecurringEventIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

RecurringEventIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
