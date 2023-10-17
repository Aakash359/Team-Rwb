import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class FilterIcon extends Component {
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
            d="M7.25 10a.76.76 0 01.75.75v2.5a.76.76 0 01-.75.75h-.5a.76.76 0 01-.75-.75v-2.5a.76.76 0 01.75-.75zM5.5 11v2H2.25a.25.25 0 01-.25-.25v-1.5a.25.25 0 01.25-.25zm8.25 0a.25.25 0 01.25.25v1.5a.25.25 0 01-.25.25H8.5v-2zm-2.5-5a.76.76 0 01.75.75v2.5a.76.76 0 01-.75.75h-.5a.76.76 0 01-.75-.75v-2.5a.76.76 0 01.75-.75zM9.5 7v2H2.25A.25.25 0 012 8.75v-1.5A.25.25 0 012.25 7zm4.25 0a.25.25 0 01.25.25v1.5a.25.25 0 01-.25.25H12.5V7zm-8.5-5a.76.76 0 01.75.75v2.5a.76.76 0 01-.75.75h-.5A.76.76 0 014 5.25v-2.5A.76.76 0 014.75 2zM3.5 3v2H2.25A.25.25 0 012 4.75v-1.5A.25.25 0 012.25 3zm10.25 0a.25.25 0 01.25.25v1.5a.25.25 0 01-.25.25H6.5V3z"
            fill={this.props.tintColor}
          />
        </g>
      </svg>
    );
  }
}

FilterIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#838588',
};

FilterIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
