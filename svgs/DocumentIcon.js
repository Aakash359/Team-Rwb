import * as React from "react"
import Svg, { G, Path } from "react-native-svg"

function DocumentIcon(props) {
  return (
    <Svg viewBox="0 0 16 16" {...props}>
      <G data-name="Layer 2">
        <Path fill="none" d="M0 0h16v16H0z" />
        <Path
          d="M7.07 5.45V1.51h5.8a.7.7 0 01.7.69v11.6a.7.7 0 01-.7.69H3.13a.7.7 0 01-.7-.69V6.14h4a.69.69 0 00.64-.69zm-.93-.23H2.72A1.4 1.4 0 012.93 5l2.95-3a1.79 1.79 0 01.26-.2z"
          fill="#bf0d3e"
        />
      </G>
    </Svg>
  )
}

export default DocumentIcon
