import * as React from "react"
import Svg, { G, Path } from "react-native-svg"

function FlashAutoIcon(props) {
  return (
    <Svg viewBox="0 0 20 20" {...props}>
      <G data-name="Layer 2">
        <Path fill="none" d="M0 0h20v20H0z" />
        <Path
          data-name="Icon material-flash-auto"
          d="M.86 0v11.43h2.85V20l6.67-11.43H6.57L10.38 0zM16.1 0h-1.91l-3 8.57H13l.67-1.9h3.05l.66 1.9h1.81zm-2.05 5.38l1.09-3.48 1.1 3.48z"
          fill={props.tintColor || 'white'}
        />
      </G>
    </Svg>
  )
}

export default FlashAutoIcon
