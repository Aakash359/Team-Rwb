import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class EditIcon extends Component {
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
            d="M11.29 7.5l-5.58 5.57H2.93v-2.78L8.5 4.71zM6 11.61L4.39 10l-.61.61v.72h.86v.86h.72zm2.71-5.76a.16.16 0 0 0-.11.05L5 9.53a.16.16 0 0 0 0 .11.14.14 0 0 0 .15.15.15.15 0 0 0 .11 0l3.55-3.68a.13.13 0 0 0 0-.11.14.14 0 0 0-.1-.15zm4.12.15l-1.12 1.07-2.78-2.78L10 3.18a.84.84 0 0 1 .6-.25.86.86 0 0 1 .61.25l1.58 1.57a.9.9 0 0 1 .24.61.87.87 0 0 1-.2.64z"
            fill={this.props.tintColor}
          />
        </g>
      </svg>
    );
  }
}

EditIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

EditIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
