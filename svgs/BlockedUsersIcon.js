import React from 'react';
import Svg, {G, Path} from 'react-native-svg';
/* SVGR has dropped some elements not supported by react-native-svg: title */

const BlockedUsersIcon = (props) => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path
        d="M8 14a6 6 0 1 1 6-6 6 6 0 0 1-6 6zm2.34-9.58A4.17 4.17 0 0 0 8 3.73a4.26 4.26 0 0 0-3.55 6.6zm1.23 1.25l-5.89 5.9a4.26 4.26 0 0 0 5.89-5.88z"
        fill={props.tintColor || '#bf0d3e'}
      />
      <Path fill="none" d="M0 0h16v16H0z" />
    </G>
  </Svg>
);

export default BlockedUsersIcon;
