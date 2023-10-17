import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const LocationIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path
        d="M11.74 7.4l-2.84 6a1 1 0 0 1-.9.6 1 1 0 0 1-.89-.55l-2.85-6A3.18 3.18 0 0 1 4 6a4 4 0 0 1 8 0 3.18 3.18 0 0 1-.26 1.4zM8 4a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"
        fill={props.tintColor || "#bf0d3e"}
      />
      <Path fill="none" d="M0 0h16v16H0z" />
    </G>
  </Svg>
)

export default LocationIcon
