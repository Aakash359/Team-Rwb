import * as React from "react"
import Svg, { G, Path } from "react-native-svg"

function FlashOffIcon(props) {
  return (
    <Svg viewBox="0 0 20 20" {...props}>
      <G data-name="Layer 2">
        <Path fill="none" d="M0 0h20v20H0z" />
        <Path
          data-name="Icon material-flash-off"
          d="M2.77 1L1.5 2.27l5 5V11h3v9l3.58-6.14L17.23 18l1.27-1.27zM16.5 8h-4l4-8h-10v2.18l8.5 8.46z"
          fill={props.tintColor || 'white'}
        />
      </G>
    </Svg>
  )
}

export default FlashOffIcon
