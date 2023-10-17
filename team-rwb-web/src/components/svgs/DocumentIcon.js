import * as React from 'react';
import PropTypes from 'prop-types';

function DocumentIcon(props) {
  return (
    <svg
      className={props.className}
      viewBox="0 0 16 16"
      width={props.width}
      height={props.height}>
      <g data-name="Layer 2">
        <path fill="none" d="M0 0h16v16H0z" />
        <path
          d="M7.07 5.45V1.51h5.8a.7.7 0 01.7.69v11.6a.7.7 0 01-.7.69H3.13a.7.7 0 01-.7-.69V6.14h4a.69.69 0 00.64-.69zm-.93-.23H2.72A1.4 1.4 0 012.93 5l2.95-3a1.79 1.79 0 01.26-.2z"
          fill={props.tintColor}
        />
      </g>
    </svg>
  );
}

DocumentIcon.defaultProps = {
  width: 24,
  height: 24,
  tintColor: '#bf0d3e',
};

DocumentIcon.propTypes = {
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tintColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export default DocumentIcon;
