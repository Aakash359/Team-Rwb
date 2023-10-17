import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class RWBMark extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 50.45 26"
        width={this.props.width}
        height={this.props.height}>
        <g id="prefix__Layer_2" data-name="Layer 2">
          <g id="prefix__Art">
            <path
              fill={this.props.tintColor}
              className="prefix__cls-1"
              d="M32.23 15.73L27.4 16l-2.16-4.4v-.12L0 4c.06 3 2.79 7.89 6.39 8.47l17.11 2.65-.39.78-16.95-.43c.22 3.08 3.54 5.1 5.88 5l9.67-.47-.16.93L12 23c1.35 2.31 6.16 3.45 7.16 2.8l2.6-1.38 3.46-1.82 4.32 2.27-.82-4.81z"
            />
            <path
              fill={this.props.tintColor}
              className="prefix__cls-1"
              d="M26.38 11.15l1.76 3.56 2.1-.1 13.82-2.16C47.55 11.93 50.39 7 50.45 4zM33.18 16.5l-2.91 3.61 8.14.36c2.13.08 5.66-1.92 5.88-5l-10.49.27zM30.76 24.69l.17.95.34.18c1 .65 5.81-.49 7.16-2.8l-8.25-1.74zM32.35 2.78A10.57 10.57 0 0 0 30 1.52 3.43 3.43 0 0 0 27.3.09c-3-.35-4.7.28-6.34 2.26s-1.78 5.91-1.78 5.91l6.16 2 4.4-1.34a2.82 2.82 0 0 1-.45-1.21 3.09 3.09 0 0 1 .13-2.28 3.82 3.82 0 0 1 .72-.81s.57.13.81.16l.8.1a1.76 1.76 0 0 1 .06.93c0 .15.27.17.52-.2s1.15-1.99.02-2.83zm-3.46.16a.94.94 0 0 1-1.29.51c-.68-.2-.58-1.26-.58-1.26l2.13.41a1.79 1.79 0 0 0-.26.34z"
            />
          </g>
        </g>
      </svg>
    );
  }
}

RWBMark.defaultProps = {
  width: 50,
  height: 24,
  tintColor: '#041E42',
};

RWBMark.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
