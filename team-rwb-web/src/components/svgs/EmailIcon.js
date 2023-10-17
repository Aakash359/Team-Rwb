import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class EmailIcon extends Component {
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
            d="M13.66 5.89L10 8.43c-.5.35-1.36 1.07-2 1.07-.63 0-1.49-.72-2-1.07L2.34 5.89A3.05 3.05 0 011 3.92 1.27 1.27 0 012.25 2.5h11.5A1.26 1.26 0 0115 3.75a2.83 2.83 0 01-1.34 2.14zM15 12.25a1.25 1.25 0 01-1.25 1.25H2.25A1.25 1.25 0 011 12.25v-6.2a4.72 4.72 0 00.79.68c1.3.88 2.61 1.76 3.88 2.69A4.26 4.26 0 008 10.5a4.26 4.26 0 002.32-1.08c1.27-.92 2.58-1.81 3.89-2.69a5.07 5.07 0 00.79-.68z"
            fill={this.props.tintColor}
          />
        </g>
      </svg>
    );
  }
}

EmailIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

EmailIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
