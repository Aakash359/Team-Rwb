import * as React from "react"
import Svg, { G, Path } from "react-native-svg"

function PostOptionIcon(props) {
  return (
    <Svg viewBox="0 0 16 16" {...props}>
      <G data-name="Layer 2">
        <Path fill="none" d="M0 0h16v16H0z" />
        <Path
          d="M9.5 4.75a.76.76 0 01-.75.75h-1.5a.76.76 0 01-.75-.75v-1.5a.76.76 0 01.75-.75h1.5a.76.76 0 01.75.75zm0 4a.76.76 0 01-.75.75h-1.5a.76.76 0 01-.75-.75v-1.5a.76.76 0 01.75-.75h1.5a.76.76 0 01.75.75zm0 4a.76.76 0 01-.75.75h-1.5a.76.76 0 01-.75-.75v-1.5a.76.76 0 01.75-.75h1.5a.76.76 0 01.75.75z"
          fill={props.tintColor || "#C1C2C3"}
        />
      </G>
    </Svg>
  )
}

export default PostOptionIcon
