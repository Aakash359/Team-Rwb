import * as React from "react"
import Svg, { Defs, G, Path } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: style */

function FlipCameraIcon(props) {
  return (
    <Svg viewBox="0 0 36 36.01" {...props}>
      <Defs></Defs>
      <G id="prefix__Layer_2" data-name="Layer 2">
        <G id="prefix__Grid">
          <G id="prefix__Master">
            <G id="prefix__Group_382" data-name="Group 382">
              <Path
                id="prefix__Path_87"
                data-name="Path 87"
                className="prefix__cls-1"
                d="M12.6 18a5.4 5.4 0 105.4-5.4 5.39 5.39 0 00-5.4 5.4z"
                fill={props.tintColor || 'white'}
              />
              <Path
                id="prefix__Path_88"
                data-name="Path 88"
                className="prefix__cls-1"
                d="M10.8 14.4v-3.6H5.56a14.37 14.37 0 0126.37 3.6h3.71a18 18 0 00-32-7.18V3.6H0v10.8z"
                fill={props.tintColor || 'white'}
              />
              <Path
                id="prefix__Path_89"
                data-name="Path 89"
                className="prefix__cls-1"
                d="M25.2 21.6v3.6h5.24a14.36 14.36 0 01-26.37-3.6H.36a18 18 0 0032 7.18v3.62H36V21.6z"
                fill={props.tintColor || 'white'}
              />
            </G>
          </G>
        </G>
      </G>
    </Svg>
  )
}

export default FlipCameraIcon
