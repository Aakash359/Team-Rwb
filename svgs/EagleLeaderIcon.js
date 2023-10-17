import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const EagleLeaderIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path
        d="M14.3 7l-2.84 2.75.67 3.9a.86.86 0 0 1 0 .16c0 .2-.09.39-.32.39a.66.66 0 0 1-.31-.09L8 12.26l-3.51 1.85a.69.69 0 0 1-.31.09c-.23 0-.33-.19-.33-.39a.88.88 0 0 1 0-.16l.67-3.9L1.7 7a.57.57 0 0 1-.2-.37c0-.24.24-.33.44-.36l3.92-.57 1.76-3.58c.07-.15.2-.32.38-.32s.31.17.38.32l1.76 3.56 3.92.57c.19 0 .44.12.44.36a.57.57 0 0 1-.2.39z"
        fill={props.tintColor || "#bf0d3e"}
      />
      <Path fill="none" d="M0 0h16v16H0z" />
    </G>
  </Svg>
)

export default EagleLeaderIcon
