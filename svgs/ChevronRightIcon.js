import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const ChevronRightIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path
        d="M6.37 13.27a.42.42 0 0 1-.6 0l-1.11-1.11a.42.42 0 0 1 0-.6L8.21 8 4.66 4.44a.42.42 0 0 1 0-.6l1.11-1.11a.42.42 0 0 1 .6 0l5 5a.42.42 0 0 1 0 .6z"
        fill={props.tintColor || "#bf0d3e"}
      />
      <Path fill="none" d="M0 0h16v16H0z" />
    </G>
  </Svg>
)

export default ChevronRightIcon
