import React, {PureComponent} from 'react';
import {View, Animated, StyleSheet} from 'react-native';
import RWBMark from '../../svgs/RWBMark';

import globalStyles, {RWBColors} from '../styles';

export default class ThumbnailLoading extends PureComponent {
  constructor(props) {
    super(props);
    this.fadeAnimation = new Animated.Value(0);
  }

  componentDidMount() {
    Animated.loop(
      Animated.timing(this.fadeAnimation, {
        toValue: 3,
        duration: 2000,
        useNativeDriver: false,
      }),
    ).start();
  }
  render() {
    const loadingAnimation1 = this.fadeAnimation.interpolate({
      inputRange: [0, 1, 2, 3],
      outputRange: [
        RWBColors.grey20,
        '#eaeaeb',
        RWBColors.grey8,
        RWBColors.grey20,
      ],
    });
    const loadingAnimation2 = this.fadeAnimation.interpolate({
      inputRange: [0, 1, 2, 3],
      outputRange: ['#eaeaeb', RWBColors.grey8, RWBColors.grey20, '#eaeaeb'],
    });
    const loadingAnimation3 = this.fadeAnimation.interpolate({
      inputRange: [0, 1, 2, 3],
      outputRange: [
        RWBColors.grey8,
        RWBColors.grey20,
        '#eaeaeb',
        RWBColors.grey8,
      ],
    });
    return (
      <View style={{flexDirection: 'row'}}>
        <Animated.View
          style={[
            globalStyles.smallProfileImage,
            {backgroundColor: loadingAnimation3, justifyContent: 'center'},
          ]}>
          <RWBMark style={styles.markStyle} fill={RWBColors.white} />
        </Animated.View>
        <Animated.View
          style={[
            globalStyles.smallProfileImage,
            {
              left: -10,
              backgroundColor: loadingAnimation2,
              justifyContent: 'center',
            },
          ]}>
          <RWBMark style={styles.markStyle} fill={RWBColors.white} />
        </Animated.View>
        <Animated.View
          style={[
            globalStyles.smallProfileImage,
            {
              left: -20,
              backgroundColor: loadingAnimation1,
              justifyContent: 'center',
            },
          ]}>
          <RWBMark style={styles.markStyle} fill={RWBColors.white} />
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  markStyle: {
    height: 16,
    aspectRatio: 1.25,
    alignSelf: 'center',
  },
});
