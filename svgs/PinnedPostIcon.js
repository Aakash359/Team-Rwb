import * as React from "react"
import Svg, { Path } from "react-native-svg"

function PinnedPostIcon(props) {
  return (
    <Svg viewBox="0 0 16 16" {...props}>
      <Path
        d="M11.4 10.1H8.6l-.3 3.2c0 .1-.1.2-.2.2s-.2-.1-.2-.2l-.5-3.2H4.6c-.2 0-.4-.2-.4-.4 0-1.1.8-2.1 1.7-2.1V4.1c-.5 0-.9-.3-.9-.8s.4-.9.9-.9h4.3c.5 0 .9.4.9.9s-.4.9-.9.9v3.4c.9 0 1.7 1 1.7 2.1 0 .2-.2.4-.5.4zm-4-5.7c0-.1-.1-.2-.2-.2s-.3 0-.3.2v3c0 .1.1.2.2.2s.2-.1.2-.2v-3z"
        fill={props.tintColor || RWBColors.magenta}
      />
    </Svg>
  )
}

export default PinnedPostIcon