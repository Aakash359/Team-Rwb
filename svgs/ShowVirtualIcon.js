import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const ShowVirtualIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        d="M14.43 11v.64c0 .36-.48.65-1.07.65H2.64c-.59 0-1.07-.29-1.07-.65V11h12.86zM3.28 9.5V4.79a1.09 1.09 0 0 1 1.08-1.08h7.28a1.09 1.09 0 0 1 1.08 1.08V9.5a1.08 1.08 0 0 1-1.08 1.07H4.36A1.08 1.08 0 0 1 3.28 9.5zm.86 0a.22.22 0 0 0 .22.21h7.28a.22.22 0 0 0 .22-.21V4.79a.22.22 0 0 0-.22-.22H4.36a.22.22 0 0 0-.22.22zm4.5 2a.1.1 0 0 0-.1-.11H7.46a.1.1 0 0 0-.1.11.09.09 0 0 0 .1.1h1.08a.09.09 0 0 0 .1-.06z"
        fill={props.tintColor}
      />
    </G>
  </Svg>
)

export default ShowVirtualIcon
