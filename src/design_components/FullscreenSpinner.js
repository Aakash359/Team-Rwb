import React, {PureComponent} from 'react';
import {ActivityIndicator, Dimensions, View} from 'react-native';
import globalStyles, {RWBColors} from '../styles';

// Not all screens are set up to use this by default, and it can have different results depending on where it is place
// this can lead to different results between flatlists and scrollviews
export default class FullscreenSpinner extends PureComponent {
  render() {
    return (
      <View
        style={{
          backgroundColor: RWBColors.white,
          position: 'absolute',
          height: Dimensions.get('screen').height,
          zIndex: 999,
          top: 0,
          left: 0,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }
}
