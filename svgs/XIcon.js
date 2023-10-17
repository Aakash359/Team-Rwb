import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const XIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path
        d="M12.42 11.36l-1.06 1.06a.77.77 0 0 1-.53.22.75.75 0 0 1-.53-.22L8 10.12l-2.3 2.3a.75.75 0 0 1-.53.22.77.77 0 0 1-.53-.22l-1.06-1.06a.77.77 0 0 1-.22-.53.75.75 0 0 1 .22-.53L5.88 8l-2.3-2.3a.75.75 0 0 1-.22-.53.77.77 0 0 1 .22-.53l1.06-1.06a.77.77 0 0 1 .53-.22.75.75 0 0 1 .53.22L8 5.88l2.3-2.3a.75.75 0 0 1 .53-.22.77.77 0 0 1 .53.22l1.06 1.06a.77.77 0 0 1 .22.53.75.75 0 0 1-.22.53L10.12 8l2.3 2.3a.75.75 0 0 1 .22.53.77.77 0 0 1-.22.53z"
        fill={props.tintColor || "#bf0d3e"}

      />
      <Path fill="none" d="M0 0h16v16H0z" />
    </G>
  </Svg>
)

export default XIcon