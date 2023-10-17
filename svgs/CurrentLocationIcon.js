import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const CurrentLocationIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        d="M8.38 12.48a.42.42 0 0 1-.38.24h-.1a.41.41 0 0 1-.33-.41V8.43H3.71a.43.43 0 0 1-.19-.81l8.57-4.29a.46.46 0 0 1 .2-.05.39.39 0 0 1 .3.13.44.44 0 0 1 .08.5z"
        fill={props.tintColor || "#bf0d3e"}
      />
    </G>
  </Svg>
)

export default CurrentLocationIcon
