import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const UploadPhotoIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
      <Path
        d="M14.43 5.86v6a1.72 1.72 0 0 1-1.71 1.71H3.28a1.72 1.72 0 0 1-1.71-1.71v-6a1.72 1.72 0 0 1 1.71-1.72h1.5l.35-.91a1.33 1.33 0 0 1 1.16-.8h3.42a1.33 1.33 0 0 1 1.16.8l.34.91h1.51a1.72 1.72 0 0 1 1.71 1.72zm-3.43 3a3 3 0 1 0-3 3 3 3 0 0 0 3-3zm-1.07 0A1.93 1.93 0 1 1 8 6.93a1.94 1.94 0 0 1 1.93 1.93z"
        fill={props.tintColor || "#bf0d3e"}
      />
      <Path fill="none" d="M0 0h16v16H0z" />
    </G>
  </Svg>
)

export default UploadPhotoIcon
