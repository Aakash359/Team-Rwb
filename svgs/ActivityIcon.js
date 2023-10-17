import * as React from "react"
import Svg, { G, Path } from "react-native-svg"

function ActivityIcon(props) {
  return (
    <Svg viewBox="0 0 16 16" {...props}>
      <G data-name="Layer 2">
        <Path fill="none" d="M0 0h16v16H0z" />
        <Path
          d="M10 7v6.44a.88.88 0 01-1.75 0v-3h-.5v3a.88.88 0 01-1.75 0V7L3.72 4.72a.75.75 0 111.06-1.06l1.78 1.78h2.88l1.78-1.78a.75.75 0 111.06 1.06zM8 5.19a1.75 1.75 0 111.75-1.75A1.75 1.75 0 018 5.19z"
          fill={props.tintColor || "#bf0d3e"}
        />
      </G>
    </Svg>
  )
}

export default ActivityIcon
