import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const VirtualEventIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path
        d="M15.5 11.5v.75c0 .41-.56.75-1.25.75H1.75c-.69 0-1.25-.34-1.25-.75v-.75h15zm-13-1.75v-5.5A1.25 1.25 0 0 1 3.75 3h8.5a1.25 1.25 0 0 1 1.25 1.25v5.5A1.25 1.25 0 0 1 12.25 11h-8.5A1.25 1.25 0 0 1 2.5 9.75zm1 0a.26.26 0 0 0 .25.25h8.5a.26.26 0 0 0 .25-.25v-5.5a.26.26 0 0 0-.25-.25h-8.5a.26.26 0 0 0-.25.25zm5.25 2.37a.12.12 0 0 0-.13-.12H7.38a.12.12 0 0 0-.13.12.12.12 0 0 0 .13.13h1.24a.12.12 0 0 0 .13-.13z"
        fill={props.tintColor || "#bf0d3e"}
      />
      <Path fill="none" d="M0 0h16v16H0z" />
    </G>
  </Svg>
)

export default VirtualEventIcon
