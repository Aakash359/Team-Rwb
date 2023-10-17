import React from 'react'
import Svg, { Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const ShareIcon = props => (
  <Svg viewBox="0 0 17.13 17.13" {...props}>
    <Path
      d="M17.13 13.56a3.57 3.57 0 1 1-7.14 0v-.38l-4-2A3.57 3.57 0 1 1 6 6l4-2v-.38a3.58 3.58 0 1 1 1.14 2.61l-4 2v.76l4 2a3.57 3.57 0 0 1 6 2.61z"
      fill={props.tintColor || "#fff"}
      data-name="Layer 2"
    />
  </Svg>
)

export default ShareIcon
