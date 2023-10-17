import React from 'react';
import PropTypes from 'prop-types';

function ReplyIcon(props) {
  return (
    <svg
      className={props.className}
      viewBox="0 0 16 16"
      width={props.width}
      height={props.height}>
      <g data-name="Layer 2">
        <path
          d="M14 9.5a.39.39 0 01-.13.3l-3.43 3.43a.42.42 0 01-.3.13.44.44 0 01-.43-.43v-1.71h-1.5c-2.19 0-4.93-.39-5.86-2.7A6.06 6.06 0 012 6.29a8.59 8.59 0 01.85-3 3.33 3.33 0 01.25-.5.2.2 0 01.18-.12.22.22 0 01.22.24v1.15c0 3.2 1.9 3.76 4.78 3.76h1.5V6.07a.44.44 0 01.43-.43.42.42 0 01.3.13l3.36 3.43a.39.39 0 01.13.3z"
          fill={props.tintColor}
        />
        <path fill="none" d="M0 0h16v16H0z" />
      </g>
    </svg>
  );
}

ReplyIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

ReplyIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default ReplyIcon;
