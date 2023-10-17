import * as React from 'react';
import Svg, {Path, G} from 'react-native-svg';

const TrashIcon = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke={props.tintColor || '#bf0d3e'}
    strokeWidth={2}
    {...props}>
    <Path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19 7-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16"
      fill={props.tintColor || '#bf0d3e'}
    />
  </Svg>
);

export default TrashIcon;
