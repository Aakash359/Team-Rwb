import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class ReportIcon extends Component {
  render() {
    return (
      <svg
        viewBox="0 0 16 16"
        className={this.props.className}
        width={this.props.width}
        height={this.props.height}>
        <g data-name="Layer 2">
          <path fill="none" d="M0 0h16v16H0z" />
          <path
            d="M9.3 8.86a.46.46 0 01-.44.43H7.14a.46.46 0 01-.44-.43l-.19-5.15a.42.42 0 01.42-.43h2.14a.42.42 0 01.42.43zm0 3.43a.44.44 0 01-.43.43H7.14a.44.44 0 01-.43-.43v-1.5a.43.43 0 01.43-.43h1.72a.43.43 0 01.43.43z"
            fill={this.props.tintColor}
          />
        </g>
      </svg>
    );
  }
}

ReportIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

ReportIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
