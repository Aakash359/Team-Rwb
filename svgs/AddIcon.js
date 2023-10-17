import * as React from "react"
import Svg, { G, Path } from "react-native-svg"

function AddIcon(props) {
  return (
    <Svg viewBox="0 0 16 16" {...props}>
      <G data-name="Layer 2">
        <Path fill="none" d="M0 0h16v16H0z" />
        <Path
          d="M13.5 8.75a.76.76 0 01-.75.75H9.5v3.25a.76.76 0 01-.75.75h-1.5a.76.76 0 01-.75-.75V9.5H3.25a.76.76 0 01-.75-.75v-1.5a.76.76 0 01.75-.75H6.5V3.25a.76.76 0 01.75-.75h1.5a.76.76 0 01.75.75V6.5h3.25a.76.76 0 01.75.75z"
          fill={props.tintColor || "#fff"}
        />
      </G>
    </Svg>
  )
}

export default AddIcon
