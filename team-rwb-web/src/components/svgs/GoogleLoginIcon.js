import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class GoogleLoginIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 30 30"
        width={this.props.width}
        height={this.props.height}>
        <g>
          <path fill="#4285f4" d="M0 0h30v30H0z" />
          <path
            d="M23.48 13.36H15v3.48h4.84a4.11 4.11 0 0 1-1.79 2.72 5.43 5.43 0 0 1-3.05.86 5.42 5.42 0 0 1 0-10.84 4.83 4.83 0 0 1 3.44 1.35L21 8.34A8.65 8.65 0 0 0 15 6a9 9 0 0 0 0 18 8.62 8.62 0 0 0 6-2.18 8.78 8.78 0 0 0 2.68-6.62 11 11 0 0 0-.2-1.84z"
            fill="#fff"
          />
        </g>
      </svg>
    );
  }
}

GoogleLoginIcon.defaultProps = {
  width: 40,
  height: 40,
};

GoogleLoginIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
