import React from 'react'
import Svg, { Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const ChevronBack = props => (
  <Svg viewBox="0 0 10.4 16.18" {...props}>
    <Path
      d="M4.88 8.09l5.33 5.33a.63.63 0 0 1 0 .9L8.54 16a.63.63 0 0 1-.9 0L.19 8.54a.63.63 0 0 1 0-.9L7.64.19a.63.63 0 0 1 .9 0l1.67 1.67a.63.63 0 0 1 0 .9z"
      fill={props.tintColor || "#fff"}
      data-name="Layer 2"
    />
  </Svg>
)

export default ChevronBack
