import React from 'react'
import Svg, { Path } from 'react-native-svg'

const ClearSearchIcon = props => (
  <Svg viewBox="0 0 16 16" {...props}>
    <Path fill="none" d="M0 0h16v16H0z" />
    <Path fill={props.tintColor || "#c1c2c3"} d="M8 2C4.7 2 2 4.7 2 8s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm2.6 8.6c-.2.2-.6.2-.8 0L8 8.8l-1.7 1.7c-.2.2-.6.2-.8 0-.2-.2-.2-.6 0-.8L7.2 8 5.4 6.3c-.2-.3-.2-.6 0-.9s.6-.2.8 0L8 7.2l1.7-1.7c.2-.2.6-.2.8 0 .2.2.2.6 0 .8L8.8 8l1.7 1.7c.3.3.3.6.1.9z" />
  </Svg>
)

export default ClearSearchIcon
