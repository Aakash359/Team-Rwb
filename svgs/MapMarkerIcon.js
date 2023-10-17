import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const MapMarkerIcon = props => (
  <Svg viewBox="0 0 30.67 46" {...props}>
    <G data-name="Layer 2">
      <Path
        d="M15.33 0C7.29 0 0 6.52 0 14.57S6.65 32.22 15.33 46C24 32.22 30.67 22.62 30.67 14.57S23.38 0 15.33 0z"
        fill="#bf0d3e"
      />
      <Path
        d="M22.11 13.14l-3.05 3 .72 4.21a.86.86 0 0 1 0 .16c0 .22-.1.43-.34.43a.68.68 0 0 1-.34-.11l-3.78-2-3.77 2a.72.72 0 0 1-.34.11c-.24 0-.35-.21-.35-.43v-.16l.73-4.21-3.07-3a.64.64 0 0 1-.2-.4c0-.25.26-.35.47-.39l4.21-.61 1.89-3.83c.08-.16.22-.34.41-.34a.52.52 0 0 1 .42.34l1.89 3.83 4.22.61c.2 0 .47.14.47.39a.62.62 0 0 1-.19.4z"
        fill="#fff"
      />
    </G>
  </Svg>
)

export default MapMarkerIcon
