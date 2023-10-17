import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const InterestedIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path
        d="M7.73 12.6L3.9 8.91a4.34 4.34 0 0 1-1.4-2.75 2.67 2.67 0 0 1 2.94-2.87A4.12 4.12 0 0 1 8 4.61a4.12 4.12 0 0 1 2.56-1.32 2.67 2.67 0 0 1 2.94 2.87 4.36 4.36 0 0 1-1.41 2.76L8.27 12.6a.39.39 0 0 1-.54 0z"
        fill={props.tintColor}
      />
      <Path fill="none" d="M0 0h16v16H0z" />
    </G>
  </Svg>
)

export default InterestedIcon