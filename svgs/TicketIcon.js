import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const TicketIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path fill="none" d="M0 0h16v16H0z" />
      <Path
        d="M7.38 12.94a.8.8 0 0 1-1.11 0l-.77-.77a1.18 1.18 0 0 0-1.67-1.67l-.77-.77a.8.8 0 0 1 0-1.11l5.57-5.56a.8.8 0 0 1 1.11 0l.76.77a1.18 1.18 0 0 0 1.67 1.67l.77.76a.8.8 0 0 1 0 1.11zm3.9-5.45a.39.39 0 0 0 0-.55L9.06 4.72a.39.39 0 0 0-.55 0L4.72 8.51a.38.38 0 0 0 0 .55l2.22 2.22a.39.39 0 0 0 .27.11.39.39 0 0 0 .28-.11zm-.56-.28l-3.51 3.51-1.93-1.94 3.5-3.5z"
        fill={props.tintColor}
      />
    </G>
  </Svg>
)

export default TicketIcon
