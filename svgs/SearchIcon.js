import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const SearchIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path
        d="M12.72 13.57a.86.86 0 0 1-.61-.25L9.82 11a4.76 4.76 0 0 1-2.68.83 4.72 4.72 0 1 1 4.72-4.72A4.76 4.76 0 0 1 11 9.82l2.3 2.29a.9.9 0 0 1 .24.61.86.86 0 0 1-.82.85zM7.14 4.14a3 3 0 1 0 3 3 3 3 0 0 0-3-3z"
        fill={props.tintColor || "#bf0d3e"}
      />
      <Path fill="none" d="M0 0h16v16H0z" />
    </G>
  </Svg>
)

export default SearchIcon
