import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class ShareIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        viewBox="0 0 17.13 17.13"
        width={this.props.width}
        height={this.props.height}>
        <path
          d="M17.13 13.56a3.57 3.57 0 1 1-7.14 0v-.38l-4-2A3.57 3.57 0 1 1 6 6l4-2v-.38a3.58 3.58 0 1 1 1.14 2.61l-4 2v.76l4 2a3.57 3.57 0 0 1 6 2.61z"
          fill={this.props.tintColor}
          data-name="Layer 2"
        />
      </svg>
    );
  }
}

ShareIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#fff',
};

ShareIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};
