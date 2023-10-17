import * as React from "react"
import Svg, { Path } from "react-native-svg"

const HomeIcon = props => (
  <Svg viewBox="0 0 24 24" {...props}>
    <Path 
      d={props.filledIcon ? "M12 3L6 7.6V6H4v3.1l-3 2.3L2.2 13 4 11.6V21h7v-6h2v6h7v-9.4l1.8 1.4 1.2-1.6L12 3z" : "M12 3L6 7.6V6H4v3.1l-3 2.3L2.2 13 4 11.6V21h16v-9.4l1.8 1.4 1.2-1.6L12 3zm6 16h-5v-4h-2v4H6v-8.9l6-4.6 6 4.6V19z"}
      fill={props.tintColor} 
    />
  </Svg>
)

export default HomeIcon
