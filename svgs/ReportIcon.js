import * as React from "react"
import Svg, { G, Path } from "react-native-svg"

function ReportIcon(props) {
  return (
    <Svg viewBox="0 0 16 16" {...props}>
      <G data-name="Layer 2">
        <Path fill="none" d="M0 0h16v16H0z" />
        <Path
          d="M9.3 8.86a.46.46 0 01-.44.43H7.14a.46.46 0 01-.44-.43l-.19-5.15a.42.42 0 01.42-.43h2.14a.42.42 0 01.42.43zm0 3.43a.44.44 0 01-.43.43H7.14a.44.44 0 01-.43-.43v-1.5a.43.43 0 01.43-.43h1.72a.43.43 0 01.43.43z"
          fill={props.tintColor || "#bf0d3e"}
        />
      </G>
    </Svg>
  )
}

export default ReportIcon
