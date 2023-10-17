import * as React from "react"
import Svg, { Defs, LinearGradient, Stop, G, Path } from "react-native-svg"

function EventCardOverlay(props) {
  return (
    <Svg viewBox="0 0 400 200" {...props}>
      <Defs>
        <LinearGradient
          id="prefix__a"
          x1={722.35}
          y1={-834.38}
          x2={722.35}
          y2={-836.51}
          gradientTransform="matrix(335 0 0 -94 -241786.09 -78431.5)"
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.5} stopColor="#041e42" stopOpacity={0} />
          <Stop offset={1} stopColor="#041e42" />
        </LinearGradient>
      </Defs>
      <G data-name="Layer 2">
        <G data-name="Layer 1">
          <Path
            data-name="Path 103"
            d="M0 0h400v200H0z"
            fill="url(#prefix__a)"
          />
        </G>
      </G>
    </Svg>
  )
}

export default EventCardOverlay
