import * as React from "react"
import Svg, { G, Path } from "react-native-svg"

function FlashOnIcon(props) {
  return (
    <Svg viewBox="0 0 20 20" {...props}>
      <G data-name="Layer 2">
        <Path fill="none" d="M0 0h20v20H0z" />
        <Path fill={props.tintColor || 'white'} data-name="Icon material-flash-on" d="M5 0v11h3v9l7-12h-4l4-8z" />
      </G>
    </Svg>
  )
}

export default FlashOnIcon
