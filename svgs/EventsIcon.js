import React from 'react'
import Svg, { Path } from 'react-native-svg'

const EventsIcon = props => (
  <Svg viewBox="0 0 24 24" {...props}>
    <Path
      d={props.filledIcon ? "M17 13h-5v5h5v-5zM16 2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-1V2h-2zm3 18H5V9h14v11z" : "M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"}
      fill={props.tintColor}
    />
  </Svg>
)

export default EventsIcon
