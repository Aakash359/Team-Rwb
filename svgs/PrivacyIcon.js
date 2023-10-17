import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const PrivacyIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path
        d="M11 7V5a3 3 0 0 0-6 0v2H3.5v7h9V7zm-2.5 3.86V12h-1v-1.14A1 1 0 0 1 7 10a1 1 0 0 1 2 0 1 1 0 0 1-.5.86zM6 7V5a2 2 0 0 1 4 0v2z"
        fill={props.tintColor || "#bf0d3e"}
      />
      <Path fill="none" d="M0 0h16v16H0z" />
    </G>
  </Svg>
)

export default PrivacyIcon
