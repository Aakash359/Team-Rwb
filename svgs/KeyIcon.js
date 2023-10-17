import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const keyIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path
        d="M12.81 3.21a4.12 4.12 0 0 1 0 5.82 4.2 4.2 0 0 1-3.74 1l-1.3 1.3h-.9l-.13 1-1.09.13-.15 1.21-3.42.33L2 10.9l4-4a4.19 4.19 0 0 1 1-3.71 4.14 4.14 0 0 1 5.82 0zM8.69 8.67a3.18 3.18 0 0 0 3.24-.54 2.86 2.86 0 0 0-4-4 3.16 3.16 0 0 0-.54 3.24l-4.12 4.04v1.2l1.08-.11.14-1.09 1.08-.13.14-1.15h1.52l1.46-1.46zm1.15-3.95a1 1 0 1 1 0 1.35 1 1 0 0 1 0-1.35z"
        fill={props.tintColor || "#bf0d3e"}
        fillRule="evenodd"
      />
      <Path fill="none" d="M0 0h16v16H0z" />
    </G>
  </Svg>
)

export default keyIcon
