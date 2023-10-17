import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class AdminIcon extends Component {
  render() {
    return (
      <svg
        viewBox="0 0 14.46 16"
        className={this.props.className}
        width={this.props.width}
        height={this.props.height}>
        <g>
          <path
            d="M7.23 15.18l-.53-.33a25.77 25.77 0 01-2.73-2c-2-1.7-3-3.17-3-4.49v-6l.52-.28A12.56 12.56 0 017.23 1a12.61 12.61 0 015.71 1.11l.52.28v6c0 1.32-1 2.79-3 4.49a24.27 24.27 0 01-2.74 2z"
            fill="#bf0d3e"
          />
          <path
            d="M7.23 14s5.23-3.23 5.23-5.64V3a11.71 11.71 0 00-5.23-1A11.65 11.65 0 002 3v5.36C2 10.77 7.23 14 7.23 14m0 2a2 2 0 01-1.05-.3 25.68 25.68 0 01-2.86-2.09C1.09 11.71 0 10 0 8.36V3a2 2 0 011-1.77A13.61 13.61 0 017.23 0a13.61 13.61 0 016.19 1.23 2 2 0 011 1.76v5.37c0 1.63-1.09 3.35-3.32 5.25a25.68 25.68 0 01-2.82 2.09 2 2 0 01-1.05.3z"
            fill="#fff"
          />
        </g>
      </svg>
    );
  }
}

AdminIcon.defaultProps = {
  width: 24,
  height: 24,
};

AdminIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
