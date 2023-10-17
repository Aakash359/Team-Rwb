import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const AccountIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path
        d="M11.41 14H4.59a1.92 1.92 0 0 1-2.09-2c0-1.77.41-4.48 2.7-4.48.25 0 1.27 1.09 2.8 1.09s2.55-1.11 2.8-1.11c2.29 0 2.7 2.71 2.7 4.48A1.92 1.92 0 0 1 11.41 14zM8 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3z"
        fill={props.tintColor || "#bf0d3e"}
      />
      <Path fill="none" d="M0 0h16v16H0z" />
    </G>
  </Svg>
)

export default AccountIcon
