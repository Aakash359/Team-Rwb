import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const FacebookLoginIcon = props => (
  <Svg viewBox="0 0 30 30" {...props}>
    <G data-name="Layer 2">
      <Path fill="#3b5b96" d="M0 0h30v30H0z" />
      <Path
        d="M21.75 6H8.25A2.25 2.25 0 0 0 6 8.25v13.5A2.25 2.25 0 0 0 8.25 24h6.83v-6.45h-2.16v-2.82h2.16v-1.4a3.73 3.73 0 0 1 3.65-3.88h2v3.18h-1.79c-.47 0-.6.27-.6.63v1.47h2.37v2.82h-2.37V24h3.41A2.25 2.25 0 0 0 24 21.75V8.25A2.25 2.25 0 0 0 21.75 6z"
        fill="#fff"
      />
    </G>
  </Svg>
)

export default FacebookLoginIcon
