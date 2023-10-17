import React from 'react'
import Svg, { Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const MyActivitiesIcon = props => (
  <Svg viewBox="0 0 17.99 14.14" {...props}>
    <Path
      d="M5.14 2.89a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1h3.18a1 1 0 0 1 1 1zm0 5.11a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V6.1a1 1 0 0 1 1-1h3.18a1 1 0 0 1 1 1zm0 5.14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-1.89a1 1 0 0 1 1-1h3.18a1 1 0 0 1 1 1zM18 2.89a1 1 0 0 1-1 1H7.39a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1H17a1 1 0 0 1 1 1zM18 8a1 1 0 0 1-1 1H7.39a1 1 0 0 1-1-1V6.1a1 1 0 0 1 1-1H17a1 1 0 0 1 1 1zm0 5.14a1 1 0 0 1-1 1H7.39a1 1 0 0 1-1-1v-1.89a1 1 0 0 1 1-1H17a1 1 0 0 1 1 1z"
      fill={props.tintColor}
      data-name="Layer 2"
    />
  </Svg>
)

export default MyActivitiesIcon
