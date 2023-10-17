import React from 'react'
import Svg, { Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const ChevronDownIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <Path
      d="M2.7 6.4c-.2-.2-.2-.4 0-.6l1.1-1.1c.2-.2.4-.2.6 0L8 8.2l3.6-3.6c.2-.2.4-.2.6 0l1.1 1.1c.2.2.2.4 0 .6l-5 5c-.2.2-.4.2-.6 0l-5-4.9z"
      fill={props.tintColor}
    />
    <Path fill="none" d="M0 0h16v16H0z" />
  </Svg>
)

export default ChevronDownIcon
