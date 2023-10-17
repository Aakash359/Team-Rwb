import * as React from "react"
import Svg, { G, Path } from "react-native-svg"

function PostIcon(props) {
  return (
    <Svg viewBox="0 0 16 16" {...props}>
      <G data-name="Layer 2">
        <Path fill="none" d="M0 0h16v16H0z" />
        <Path
          d="M15 1.59l-2 12a.49.49 0 01-.25.35.48.48 0 01-.24.06.72.72 0 01-.19 0l-3.55-1.48-1.89 2.3a.46.46 0 01-.38.18.51.51 0 01-.17 0 .5.5 0 01-.33-.5v-2.73l6.75-8.27-8.35 7.23-3.09-1.27A.49.49 0 011 9a.5.5 0 01.25-.46l13-7.5A.45.45 0 0114.5 1a.47.47 0 01.28.09.49.49 0 01.22.5z"
          fill={props.tintColor || "white"}
        />
      </G>
    </Svg>
  )
}

export default PostIcon
