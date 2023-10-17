import React from 'react'
import Svg, { Defs, G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: style, title */

const LinkedInLoginIcon = props => (
  <Svg viewBox="0 0 30 30" {...props}>
    <Defs />
    <G id="prefix__Layer_2" data-name="Layer 2">
      <G id="prefix__Art">
        <Path fill="#1280af" d="M0 0h30v30H0z" />
        <Path
          fill="#ffffff"
          className="prefix__cls-2"
          d="M10 8a2 2 0 0 1-2.11 2A2 2 0 1 1 8 6a1.94 1.94 0 0 1 2 2zM6 24V11.44h3.88V24zM12.21 15.45c0-1.57-.05-2.88-.1-4h3.39l.18 1.75h.08a4.5 4.5 0 0 1 3.87-2c2.57 0 4.5 1.72 4.5 5.42V24h-3.91v-7c0-1.62-.56-2.72-2-2.72a2.13 2.13 0 0 0-2 1.46 2.68 2.68 0 0 0-.13 1V24h-3.88z"
        />
      </G>
    </G>
  </Svg>
)

export default LinkedInLoginIcon
