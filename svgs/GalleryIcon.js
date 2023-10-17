import * as React from "react"
import Svg, { G, Path } from "react-native-svg"

function GalleryIcon(props) {
  return (
    <Svg viewBox="0 0 16 16" {...props}>
      <G data-name="Layer 2">
        <Path fill="none" d="M0 0h16v16H0z" />
        <Path
          d="M15.5 12.75A1.25 1.25 0 0114.25 14H1.75A1.25 1.25 0 01.5 12.75v-9.5A1.25 1.25 0 011.75 2h12.5a1.25 1.25 0 011.25 1.25zM1.75 3a.26.26 0 00-.25.25v9.5a.26.26 0 00.25.25h12.5a.26.26 0 00.25-.25v-9.5a.26.26 0 00-.25-.25zM4 7a1.5 1.5 0 111.5-1.5A1.5 1.5 0 014 7zm9.5 5h-11v-1.5L5 8l1.25 1.25 4-4L13.5 8.5z"
          fill={props.tintColor || "#bf0d3e"}
        />
      </G>
    </Svg>
  )
}

export default GalleryIcon
