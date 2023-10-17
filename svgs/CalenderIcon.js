import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const CalenderIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path
        d="M14.5 13.14a.94.94 0 0 1-1 .86h-11a.94.94 0 0 1-1-.86V4.57a.94.94 0 0 1 1-.86h1v-.64A1.17 1.17 0 0 1 4.75 2h.5A1.17 1.17 0 0 1 6.5 3.07v.64h3v-.64A1.17 1.17 0 0 1 10.75 2h.5a1.17 1.17 0 0 1 1.25 1.07v.64h1a.94.94 0 0 1 1 .86zm-1 0V6.29h-11v6.85zm-8-10.07a.23.23 0 0 0-.25-.21h-.5a.23.23 0 0 0-.25.21V5a.23.23 0 0 0 .25.21h.5A.23.23 0 0 0 5.5 5zm6 0a.23.23 0 0 0-.25-.21h-.5a.23.23 0 0 0-.25.21V5a.23.23 0 0 0 .25.21h.5A.23.23 0 0 0 11.5 5z"
        fill={props.tintColor || "#bf0d3e"}
      />
      <Path fill="none" d="M0 0h16v16H0z" />
    </G>
  </Svg>
)

export default CalenderIcon
