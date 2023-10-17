import React from 'react'
import Svg, { G, Path } from 'react-native-svg'
/* SVGR has dropped some elements not supported by react-native-svg: title */

const CheckIcon = props => (
<Svg viewBox="0 0 16 16" {...props}>
    <G data-name="Layer 2">
        <G data-name="Over States">
            <Path
                d="M13.84 5.7l-5.66 5.66-1.06 1.06a.77.77 0 0 1-.53.22.79.79 0 0 1-.54-.22L5 11.36 2.16 8.53a.77.77 0 0 1 0-1.06l1.07-1.06a.75.75 0 0 1 .53-.22.77.77 0 0 1 .53.22l2.3 2.3 5.12-5.13a.77.77 0 0 1 .53-.22.75.75 0 0 1 .53.22l1.07 1.06a.76.76 0 0 1 .21.53.74.74 0 0 1-.21.53z"
                fill={props.color || "#bf0d3e"}
            />
            <Path fill="none" d="M0 0h16v16H0z" />
        </G>
    </G>
</Svg>
)

export default CheckIcon
