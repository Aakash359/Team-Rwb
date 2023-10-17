import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const AttendingIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        d="M13.38 6.9L10.24 10a.36.36 0 0 1-.28.12.4.4 0 0 1-.39-.39V8.2H8.2c-2.65 0-4.38.51-4.38 3.43v1.06a.21.21 0 0 1-.2.22.2.2 0 0 1-.17-.11 4 4 0 0 1-.23-.46 7.82 7.82 0 0 1-.72-2.77 5.46 5.46 0 0 1 .33-2c.85-2.16 3.35-2.51 5.37-2.51h1.37V3.49a.39.39 0 0 1 .67-.28l3.14 3.14a.4.4 0 0 1 .12.28.4.4 0 0 1-.12.27z"
        fill={props.tintColor}
      />
    </G>
  </Svg>
)

export default AttendingIcon
