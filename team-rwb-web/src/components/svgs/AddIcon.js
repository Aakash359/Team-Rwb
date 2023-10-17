import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class AddIcon extends Component {
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
            d="M13.5 8.75a.76.76 0 01-.75.75H9.5v3.25a.76.76 0 01-.75.75h-1.5a.76.76 0 01-.75-.75V9.5H3.25a.76.76 0 01-.75-.75v-1.5a.76.76 0 01.75-.75H6.5V3.25a.76.76 0 01.75-.75h1.5a.76.76 0 01.75.75V6.5h3.25a.76.76 0 01.75.75z"
            fill={this.props.tintColor}
          />
        </g>
      </svg>
    );
  }
}

AddIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#fff',
};

AddIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
