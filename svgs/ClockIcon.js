import * as React from "react"
import Svg, { G, Path } from "react-native-svg"

function ClockIcon(props) {
  return (
    <Svg viewBox="0 0 16 16" {...props}>
      <G data-name="Layer 2">
        <Path fill="none" d="M0 0h16v16H0z" />
        <Path
          d="M8 14a6 6 0 116-6 6 6 0 01-6 6zM8 3.75A4.25 4.25 0 1012.25 8 4.26 4.26 0 008 3.75zm1 5a.25.25 0 01-.25.25h-2.5A.25.25 0 016 8.75v-.5A.25.25 0 016.25 8H8V5.25A.25.25 0 018.25 5h.5a.25.25 0 01.25.25z"
          fill={props.tintColor || "#bf0d3e"}
        />
      </G>
    </Svg>
  )
}

export default ClockIcon
